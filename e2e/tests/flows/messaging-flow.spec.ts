/**
 * messaging-flow.spec.ts
 * Tests E2E — Flux métier croisé : Échange de messages
 * Phase E5
 *
 * Projet Playwright : chromium-admin (testIgnore dans playwright.config.ts)
 *
 * Scénarios :
 *   1. Admin envoie un message au membre → membre le voit dans sa boîte.
 *   2. Membre ouvre le message → marqué comme lu.
 *   3. Broadcast admin → notification visible chez le membre (fixme).
 *
 * Stratégie :
 *   - Les tests utilisent la fixture `db` pour insérer des messages directement
 *     en DB et vérifier leur apparition côté frontend.
 *   - Un test complet (envoi via UI admin + réception UI membre) est également
 *     inclus pour valider le flux complet via API.
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

interface UserRow {
  id: number;
}

async function getDbId(
  db: import("../../fixtures/db.fixture").DbHelper,
  userId: string,
): Promise<number> {
  const rows = await db.query<UserRow>(
    "SELECT id FROM utilisateurs WHERE userId = ?",
    [userId],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error(`Utilisateur ${userId} introuvable en DB`);
  return id;
}

// ============================================================
// Tests
// ============================================================

test.describe("Flux messagerie — E2E croisé", () => {
  // ----------------------------------------------------------
  // Test 1 : Admin envoie un message au membre via l'UI
  //          → le membre voit le message dans sa boîte de réception
  // ----------------------------------------------------------
  test("admin envoie un message → membre le voit dans la boîte de réception", async ({
    adminPage,
    memberPage,
    db,
  }) => {
    const memberDbId = await getDbId(db, E2E_DB_USER_IDS.member);
    const ts = Date.now();
    const sujet = `[E2E-flow] ${ts}`;

    // ── Admin : composer le message ──────────────────────────
    await adminPage.goto("/messages");
    await adminPage
      .locator('[data-testid="messages-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await adminPage.locator('[data-testid="messages-compose-btn"]').click();
    await adminPage
      .locator('[id="compose-message-form"]')
      .waitFor({ state: "visible", timeout: 5_000 });

    // Vérifier que le type "user" est sélectionné par défaut
    await expect(
      adminPage.locator('input[name="recipientType"][value="user"]'),
    ).toBeChecked();

    await adminPage.locator("#destinataire-id").fill(String(memberDbId));
    await adminPage.locator("#sujet").fill(sujet);
    await adminPage.locator("#contenu").fill(`Contenu du flux E2E ${ts}`);

    // Envoyer
    await adminPage
      .locator('[form="compose-message-form"][type="submit"]')
      .click();

    // Attendre la fermeture de la modale
    await expect(
      adminPage.locator('[id="compose-message-form"]'),
    ).not.toBeVisible({ timeout: 10_000 });

    // ── Membre : vérifier la réception ───────────────────────
    await memberPage.goto("/messages");
    await memberPage
      .locator('[data-testid="messages-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // L'onglet inbox est actif par défaut
    await expect(
      memberPage.locator('[data-testid="messages-list"]'),
    ).toBeVisible({ timeout: 10_000 });

    // Le sujet du message envoyé doit apparaître
    await expect(memberPage.getByText(sujet)).toBeVisible({
      timeout: 15_000,
    });
  });

  // ----------------------------------------------------------
  // Test 2 : Message inséré en DB → membre l'ouvre → marqué comme lu
  // ----------------------------------------------------------
  test("membre ouvre un message → marqué comme lu", async ({
    memberPage,
    db,
  }) => {
    const adminDbId = await getDbId(db, E2E_DB_USER_IDS.admin);
    const memberDbId = await getDbId(db, E2E_DB_USER_IDS.member);
    const ts = Date.now();
    const sujet = `[E2E-read] ${ts}`;

    // Insérer un message non lu de l'admin vers le membre
    const msgId = await db.insertOne("messages", {
      expediteur_id: adminDbId,
      destinataire_id: memberDbId,
      sujet,
      contenu: `Message à lire ${ts}`,
      envoye_par_email: 0,
      lu: 0,
    });

    try {
      await memberPage.goto("/messages");
      await memberPage
        .locator('[data-testid="messages-page"]')
        .waitFor({ state: "visible", timeout: 15_000 });

      // Le message doit apparaître dans la liste
      const messageItem = memberPage.locator(
        `[data-testid="message-item-${msgId}"]`,
      );
      await expect(messageItem).toBeVisible({ timeout: 15_000 });

      // Cliquer sur le message pour l'ouvrir
      // L'API appelée est GET /api/messages/{id} qui auto-marque comme lu
      // IMPORTANT : waitForResponse doit être défini AVANT le click
      const responsePromise = memberPage.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/messages/${msgId}`) &&
          resp.request().method() === "GET",
        { timeout: 10_000 },
      );
      await messageItem.locator("button").first().click();
      await responsePromise;

      // Vérifier en DB que le message est maintenant lu
      const rows = await db.query<{ lu: number }>(
        "SELECT lu FROM messages WHERE id = ?",
        [msgId],
      );
      expect(rows[0]?.lu).toBe(1);
    } finally {
      await db.query("DELETE FROM messages WHERE id = ?", [msgId]);
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Admin envoie un broadcast → membre voit la notification
  // ----------------------------------------------------------
  test("admin broadcast → badge notifications incrémenté chez le membre", async ({
    adminPage,
    memberPage,
    db,
  }) => {
    const memberDbId = await getDbId(db, E2E_DB_USER_IDS.member);
    const ts = Date.now();

    // ── Compter les notifications non lues du membre AVANT le broadcast ──
    const beforeRows = await db.query<{ count: number }>(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND lu = 0",
      [memberDbId],
    );
    const countBefore = beforeRows[0]?.count ?? 0;

    // ── Admin : naviguer vers /notifications ─────────────────
    await adminPage.goto("/notifications");
    await adminPage.waitForLoadState("load");

    // ── Ouvrir la modale broadcast ───────────────────────────
    const broadcastBtn = adminPage.locator(
      '[data-testid="broadcast-notification-btn"]',
    );
    await broadcastBtn.waitFor({ state: "visible", timeout: 15_000 });
    await broadcastBtn.click();

    // ── Remplir le formulaire broadcast ─────────────────────
    const broadcastForm = adminPage.locator(
      '[data-testid="broadcast-notification-form"]',
    );
    await broadcastForm.waitFor({ state: "visible", timeout: 5_000 });

    // Remplir le titre
    const titleInput = broadcastForm
      .locator(
        'input[type="text"], input[name="title"], input[id*="title"], input[id*="titre"]',
      )
      .first();
    await titleInput.fill(`[E2E-broadcast] ${ts}`);

    // Remplir le message
    const messageInput = broadcastForm
      .locator('textarea, input[name="message"], input[id*="message"]')
      .first();
    await messageInput.fill(`Message broadcast E2E ${ts}`);

    // ── Envoyer le broadcast ─────────────────────────────────
    const broadcastResponsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/notifications/broadcast") &&
        resp.request().method() === "POST",
      { timeout: 15_000 },
    );

    await broadcastForm.locator('button[type="submit"]').click();
    const broadcastResponse = await broadcastResponsePromise;
    expect(broadcastResponse.status()).toBeLessThan(300);

    // ── Membre : vérifier que les notifications ont augmenté ──
    // Attendre un court délai pour la propagation DB
    await memberPage.waitForTimeout(1000);

    const afterRows = await db.query<{ count: number }>(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND lu = 0",
      [memberDbId],
    );
    const countAfter = afterRows[0]?.count ?? 0;

    // Le nombre de notifications non lues doit avoir augmenté
    expect(countAfter).toBeGreaterThan(countBefore);

    // ── Cleanup : supprimer les notifications créées par le broadcast ──
    await db.query(
      "DELETE FROM notifications WHERE user_id = ? AND titre LIKE ?",
      [memberDbId, `%[E2E-broadcast]%`],
    );
  });
});
