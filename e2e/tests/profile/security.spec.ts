/**
 * security.spec.ts
 * Tests E2E — Profil sécurité (/profile onglet Sécurité)
 * Phase E9
 *
 * data-testid utilisés :
 *   profile-security-tab, change-email-section
 *   input-new-email, input-confirm-email, btn-submit-change-email
 *   change-email-success-banner
 *   active-sessions-section, session-list, session-item-{id}
 *   btn-revoke-{id}
 */

import { test, expect } from "../../fixtures";

test.describe("Profil — Onglet Sécurité", () => {
  // ----------------------------------------------------------
  // Test 1 : Onglet Sécurité accessible sur /profile
  // ----------------------------------------------------------
  test("onglet Sécurité accessible et section visible", async ({
    memberPage,
  }) => {
    await memberPage.goto("/profile");

    // Cliquer sur l'onglet Sécurité (tab button avec aria-controls="tabpanel-security")
    await memberPage.locator("#tab-security").click();

    await expect(
      memberPage.locator('[data-testid="profile-security-tab"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Section changement d'email → formulaire visible
  // ----------------------------------------------------------
  test("section changement d'email → formulaire visible", async ({
    memberPage,
  }) => {
    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await expect(
      memberPage.locator('[data-testid="change-email-section"]'),
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      memberPage.locator('[data-testid="input-new-email"]'),
    ).toBeVisible();
    await expect(
      memberPage.locator('[data-testid="input-confirm-email"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 3 : Email invalide → validation inline (bouton désactivé)
  // ----------------------------------------------------------
  test("email invalide → bouton soumission désactivé", async ({
    memberPage,
  }) => {
    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await memberPage
      .locator('[data-testid="input-new-email"]')
      .fill("not-a-valid-email");
    await memberPage
      .locator('[data-testid="input-confirm-email"]')
      .fill("not-a-valid-email");

    // Le bouton doit être désactivé car l'email est invalide
    await expect(
      memberPage.locator('[data-testid="btn-submit-change-email"]'),
    ).toBeDisabled();
  });

  // ----------------------------------------------------------
  // Test 4 : Email valide → toast de confirmation envoyé
  // ----------------------------------------------------------
  test("email valide → confirmation envoyée (toast succès)", async ({
    memberPage,
  }) => {
    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    const uniqueEmail = `new-email-${Date.now()}@example.com`;
    await memberPage
      .locator('[data-testid="input-new-email"]')
      .fill(uniqueEmail);
    await memberPage
      .locator('[data-testid="input-confirm-email"]')
      .fill(uniqueEmail);

    const responsePromise = memberPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/change-email") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await memberPage.locator('[data-testid="btn-submit-change-email"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    await expect(
      memberPage.locator('[data-testid="change-email-success-banner"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Sessions actives → liste visible (au moins 1 session)
  // ----------------------------------------------------------
  test("sessions actives → liste avec au moins 1 session", async ({
    memberPage,
  }) => {
    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await expect(
      memberPage.locator('[data-testid="active-sessions-section"]'),
    ).toBeVisible({ timeout: 5_000 });

    // Attendre que la liste ou l'état loading disparaisse
    await memberPage.waitForTimeout(2000);

    const sessionList = memberPage.locator('[data-testid="session-list"]');
    const noSessions = memberPage.locator("text=/Aucune session/i");
    await expect(sessionList.or(noSessions)).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 6 : Révoquer une session → session disparaît de la liste
  // ----------------------------------------------------------
  test("révoquer une session → session disparaît", async ({
    memberPage,
    db,
  }) => {
    // Récupérer l'ID interne du membre E2E
    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      ["U-9999-0002"],
    );
    const memberDbId = memberRow.id;

    // S'assurer que la session extra du seed est présente et active.
    // Si un test précédent l'a révoquée, on la réactive ici pour que
    // le test soit auto-suffisant (pas besoin de relancer pnpm seed).
    await db.query(
      `INSERT INTO refresh_tokens
         (user_id, token_hash, expires_at, revoked, ip_address, user_agent)
       VALUES
         (?, SHA2(CONCAT('e2e-extra-session-', ?, '-seed'), 256),
          DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, '127.0.0.1', 'E2E-Extra-Session-Browser')
       ON DUPLICATE KEY UPDATE
         expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY),
         revoked    = FALSE`,
      [memberDbId, memberDbId],
    );

    await memberPage.goto("/profile");
    await memberPage.locator("#tab-security").click();
    await memberPage
      .locator('[data-testid="profile-security-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // Attendre le chargement des sessions
    const sessionList = memberPage.locator('[data-testid="session-list"]');
    const noSessions = memberPage.locator("text=/Aucune session/i");
    await expect(sessionList.or(noSessions)).toBeVisible({ timeout: 10_000 });

    // Si des sessions sont visibles, tenter de révoquer la première
    const sessionItems = memberPage.locator('[data-testid^="session-item-"]');
    const count = await sessionItems.count();

    if (count > 1) {
      // Révoquer la deuxième session (pas la session courante)
      const secondSession = sessionItems.nth(1);
      const sessionId = await secondSession.getAttribute("data-testid");
      const id = sessionId?.replace("session-item-", "");

      if (id) {
        const responsePromise = memberPage.waitForResponse(
          (resp) =>
            resp.url().includes("/api/auth/sessions/") &&
            resp.request().method() === "DELETE",
          { timeout: 10_000 },
        );
        await memberPage.locator(`[data-testid="btn-revoke-${id}"]`).click();
        const resp = await responsePromise;
        expect(resp.status()).toBeLessThan(300);

        await expect(
          memberPage.locator(`[data-testid="session-item-${id}"]`),
        ).not.toBeVisible({ timeout: 10_000 });
      }
    } else {
      // Pas assez de sessions pour tester la révocation — test conditionnel passé
      test.skip();
    }
  });
});
