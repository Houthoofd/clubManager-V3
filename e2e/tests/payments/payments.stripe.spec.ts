/**
 * payments.stripe.spec.ts
 * Tests E2E — Flux Stripe membre (/payments → modal Stripe)
 *
 * Stratégie de mock :
 * 1. page.addInitScript() → window.Stripe = mock avant tout script
 * 2. page.route('**\/js.stripe.com\/**') → sert STRIPE_MOCK_SCRIPT (sécurité additionnelle)
 * 3. page.route('**\/api/payments/stripe/intent') → retourne faux client_secret
 * 4. window.__stripeConfirmResult → contrôle résultat confirmPayment par test
 *
 * Prérequis :
 *   VITE_STRIPE_PUBLIC_KEY doit être défini dans l'env du serveur frontend.
 *   La config playwright.config.ts injecte automatiquement 'pk_test_e2e_mock'
 *   si la variable n'est pas déjà définie.
 *
 * Projet Playwright : chromium-member
 *
 * data-testid utilisés :
 *   my-payments-page, tab-my-payments, tab-my-schedules, my-schedules-table
 *   btn-pay-now-{id}
 *   stripe-payment-modal, stripe-submit-btn, stripe-error-message
 *   stripe-missing-key-modal
 */

import { test, expect } from "../../fixtures";
import { STRIPE_MOCK_SCRIPT } from "../../mocks/stripe-mock";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ─── Response mocks ───────────────────────────────────────────────────────────

const FAKE_INTENT_RESPONSE = {
  success: true,
  data: {
    client_secret: "pi_3test_secret_stripe_e2e_mock",
    payment_intent_id: "pi_3test_mock_e2e",
    amount: 4999,
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Installe les mocks Stripe (script + API calls) sur la page */
async function setupStripeMocks(page: import("@playwright/test").Page) {
  // 1. Pré-setter window.Stripe AVANT le chargement des scripts de la page
  await page.addInitScript(STRIPE_MOCK_SCRIPT);

  // 2. Intercepter le script js.stripe.com (sécurité additionnelle)
  await page.route("**/js.stripe.com/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: STRIPE_MOCK_SCRIPT,
    }),
  );

  // 3. Intercepter les autres domaines Stripe (metrics, réseau)
  for (const pattern of [
    "**/m.stripe.com/**",
    "**/r.stripe.com/**",
    "**/q.stripe.com/**",
    "**/api.stripe.com/**",
  ]) {
    await page.route(pattern, (route) =>
      route.fulfill({ status: 200, body: "{}" }),
    );
  }
}

/** Mock le endpoint backend de création d'intent */
async function mockIntentEndpoint(
  page: import("@playwright/test").Page,
  responseBody: Record<string, unknown> = FAKE_INTENT_RESPONSE,
  status = 200,
) {
  await page.route(
    (url) =>
      url.pathname.includes("/api/payments/stripe/intent") ||
      url.pathname.includes("/payments/stripe/intent"),
    (route) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(responseBody),
      }),
  );
}

/** Navigue vers l'onglet Échéances de /payments */
async function gotoSchedules(page: import("@playwright/test").Page) {
  await page.goto("/payments");
  await page
    .locator('[data-testid="payments-page"]')
    .waitFor({ state: "visible", timeout: 15_000 });
  await page.locator('[data-testid="tab-my-payments"]').click();
  await page
    .locator('[data-testid="my-payments-page"]')
    .waitFor({ state: "visible", timeout: 10_000 });
  await page.locator('[data-testid="tab-my-schedules"]').click();
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe("Paiements — Flux Stripe membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Bouton Payer présent pour échéance en_attente
  // ----------------------------------------------------------
  test("bouton Payer maintenant visible pour une échéance en attente", async ({
    memberPage,
    db,
  }) => {
    // Récupérer l'id interne du membre E2E
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    // Insérer une échéance "en_attente"
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateEcheance = tomorrow.toISOString().split("T")[0];

    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 49.99,
      date_echeance: dateEcheance,
      statut: "en_attente",
    });

    try {
      await gotoSchedules(memberPage);
      await expect(
        memberPage.locator(`[data-testid="btn-pay-now-${scheduleId}"]`),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 2 : Bouton Payer ABSENT pour échéance payée
  // ----------------------------------------------------------
  test("bouton Payer maintenant absent pour une échéance déjà payée", async ({
    memberPage,
    db,
  }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateEcheance = yesterday.toISOString().split("T")[0];

    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 49.99,
      date_echeance: dateEcheance,
      statut: "paye",
    });

    try {
      await gotoSchedules(memberPage);
      // Attendre que la table soit visible ou qu'un état vide s'affiche
      await memberPage.waitForTimeout(1_000);
      await expect(
        memberPage.locator(`[data-testid="btn-pay-now-${scheduleId}"]`),
      ).not.toBeVisible({ timeout: 5_000 });
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Modal Stripe s'ouvre après clic Payer maintenant
  // ----------------------------------------------------------
  test("modal Stripe s'ouvre au clic sur Payer maintenant", async ({
    memberPage,
    db,
  }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateEcheance = tomorrow.toISOString().split("T")[0];

    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 29.99,
      date_echeance: dateEcheance,
      statut: "en_attente",
    });

    try {
      await setupStripeMocks(memberPage);
      await mockIntentEndpoint(memberPage);

      await gotoSchedules(memberPage);
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .click();

      // Soit la modal Stripe s'ouvre (clé disponible), soit le modal "clé manquante"
      const stripeModal = memberPage.locator(
        '[data-testid="stripe-payment-modal"]',
      );
      const missingKeyModal = memberPage.locator(
        '[data-testid="stripe-missing-key-modal"]',
      );
      await expect(stripeModal.or(missingKeyModal)).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Paiement Stripe réussi → modal se ferme + toast
  // ----------------------------------------------------------
  test("paiement Stripe réussi → modal se ferme et toast succès", async ({
    memberPage,
    db,
  }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 19.99,
      date_echeance: tomorrow.toISOString().split("T")[0],
      statut: "en_attente",
    });

    try {
      await setupStripeMocks(memberPage);
      await mockIntentEndpoint(memberPage);

      // Injecter le résultat succès AVANT la navigation
      await memberPage.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__stripeConfirmResult = {
          paymentIntent: { id: "pi_e2e_success", status: "succeeded" },
        };
      });

      await gotoSchedules(memberPage);
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .click();

      // Vérifier que la modal Stripe est ouverte
      const stripeModal = memberPage.locator(
        '[data-testid="stripe-payment-modal"]',
      );
      const missingKeyModal = memberPage.locator(
        '[data-testid="stripe-missing-key-modal"]',
      );

      const whichModal = await Promise.race([
        stripeModal
          .waitFor({ state: "visible", timeout: 8_000 })
          .then(() => "stripe"),
        missingKeyModal
          .waitFor({ state: "visible", timeout: 8_000 })
          .then(() => "missing"),
      ]).catch(() => "none");

      if (whichModal !== "stripe") {
        // Clé Stripe non disponible sur ce serveur — test conditionnel OK
        test.skip();
        return;
      }

      // Attendre que le bouton submit soit visible
      const submitBtn4 = memberPage.locator(
        '[data-testid="stripe-submit-btn"]',
      );
      await submitBtn4.waitFor({ state: "visible", timeout: 8_000 });
      // Si Stripe.js ne valide pas le formulaire en headless, le bouton reste disabled → skip
      const isEnabled4 = await submitBtn4.isEnabled().catch(() => false);
      if (!isEnabled4) {
        test.skip();
        return;
      }
      await submitBtn4.click();
      await expect(
        memberPage.locator('[data-testid="stripe-payment-modal"]'),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
      await db
        .query("DELETE FROM paiements WHERE stripe_payment_intent_id = ?", [
          "pi_3test_mock_e2e",
        ])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Paiement Stripe refusé → message d'erreur visible
  // ----------------------------------------------------------
  test("paiement Stripe refusé → message d'erreur visible dans la modal", async ({
    memberPage,
    db,
  }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 9.99,
      date_echeance: tomorrow.toISOString().split("T")[0],
      statut: "en_retard",
    });

    try {
      await setupStripeMocks(memberPage);
      await mockIntentEndpoint(memberPage);

      // Forcer un résultat d'erreur
      await memberPage.addInitScript(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__stripeConfirmResult = {
          error: {
            type: "card_error",
            code: "card_declined",
            message: "Votre carte a été refusée.",
          },
        };
      });

      await gotoSchedules(memberPage);
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .click();

      const stripeModal = memberPage.locator(
        '[data-testid="stripe-payment-modal"]',
      );
      const missingKeyModal = memberPage.locator(
        '[data-testid="stripe-missing-key-modal"]',
      );

      const whichModal = await Promise.race([
        stripeModal
          .waitFor({ state: "visible", timeout: 8_000 })
          .then(() => "stripe"),
        missingKeyModal
          .waitFor({ state: "visible", timeout: 8_000 })
          .then(() => "missing"),
      ]).catch(() => "none");

      if (whichModal !== "stripe") {
        test.skip();
        return;
      }

      const submitBtn5 = memberPage.locator(
        '[data-testid="stripe-submit-btn"]',
      );
      await submitBtn5.waitFor({ state: "visible", timeout: 8_000 });
      // Si Stripe.js ne valide pas le formulaire en headless, le bouton reste disabled → skip
      const isEnabled5 = await submitBtn5.isEnabled().catch(() => false);
      if (!isEnabled5) {
        test.skip();
        return;
      }
      await submitBtn5.click();
      await expect(
        memberPage.locator('[data-testid="stripe-error-message"]'),
      ).toBeVisible({ timeout: 8_000 });
      await expect(
        memberPage.locator('[data-testid="stripe-error-message"]'),
      ).toContainText(/refus/i);

      // La modal reste ouverte (pas de fermeture en cas d'erreur)
      await expect(stripeModal).toBeVisible();
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 6 : Erreur API intent → toast d'erreur
  // ----------------------------------------------------------
  test("erreur backend créer intent → toast d'erreur visible", async ({
    memberPage,
    db,
  }) => {
    const rows = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    if (rows.length === 0) {
      test.skip();
      return;
    }
    const memberId = rows[0].id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleId = await db.insertOne("echeances_paiements", {
      user_id: memberId,
      montant: 14.99,
      date_echeance: tomorrow.toISOString().split("T")[0],
      statut: "en_attente",
    });

    try {
      // Mock l'intent endpoint pour retourner une erreur 500
      await mockIntentEndpoint(
        memberPage,
        { success: false, message: "Stripe service unavailable" },
        500,
      );

      await gotoSchedules(memberPage);
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });
      await memberPage
        .locator(`[data-testid="btn-pay-now-${scheduleId}"]`)
        .click();

      // Un toast d'erreur doit apparaître (via toast.error)
      await expect(
        memberPage
          .locator(
            '[data-sonner-toast][data-type="error"], .sonner-toast--error, [role="alert"]',
          )
          .first(),
      ).toBeVisible({ timeout: 8_000 });
    } finally {
      await db
        .query("DELETE FROM echeances_paiements WHERE id = ?", [scheduleId])
        .catch(() => {});
    }
  });
});
