/**
 * notifications.spec.ts
 * Tests E2E — Flux membre : Notifications (/notifications)
 * Phase E3
 *
 * Projet Playwright : chromium-member (testIgnore dans playwright.config.ts)
 *
 * Compte de test :
 *   Membre : e2e_member (U-9999-0002)
 *
 * data-testid utilisés :
 *   notifications-page         → wrapper principal
 *   notifications-list         → <ul> de la liste des notifications
 *   mark-all-read-btn          → bouton "Tout marquer comme lu"
 *   delete-all-btn             → bouton "Tout supprimer"
 *   notification-item-{id}     → item de notification
 *   notification-delete-{id}   → bouton supprimer par notification
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

async function gotoNotifications(page: import("@playwright/test").Page) {
  await page.goto("/notifications");
  await page.locator('[data-testid="notifications-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

/**
 * Récupère l'ID interne DB du membre e2e.
 */
async function getMemberDbId(
  db: import("../../fixtures/db.fixture").DbHelper,
): Promise<number> {
  const rows = await db.query<{ id: number }>(
    "SELECT id FROM utilisateurs WHERE userId = ?",
    [E2E_DB_USER_IDS.member],
  );
  const id = rows[0]?.id;
  if (!id) throw new Error("Membre e2e introuvable en DB");
  return id;
}

// ============================================================
// Tests
// ============================================================

test.describe("Notifications — Flux membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /notifications → page visible
  // ----------------------------------------------------------
  test("charger /notifications → page visible", async ({ memberPage }) => {
    await gotoNotifications(memberPage);
    await expect(
      memberPage.locator('[data-testid="notifications-page"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Notification créée en DB → visible dans la liste
  // ----------------------------------------------------------
  test("notification insérée en DB → visible dans la liste", async ({
    memberPage,
    db,
  }) => {
    const memberId = await getMemberDbId(db);
    const ts = Date.now();
    const titre = `[E2E] Notification ${ts}`;

    // Insérer une notification pour le membre
    const notifId = await db.insertOne("notifications", {
      user_id: memberId,
      type: "info",
      titre,
      contenu: `Contenu de test ${ts}`,
    });

    try {
      await gotoNotifications(memberPage);

      // La notification doit être visible dans la liste
      await expect(
        memberPage.locator(`[data-testid="notification-item-${notifId}"]`),
      ).toBeVisible({ timeout: 10_000 });

      // Le titre doit apparaître dans l'item
      await expect(memberPage.getByText(titre)).toBeVisible({
        timeout: 5_000,
      });
    } finally {
      await db.query("DELETE FROM notifications WHERE id = ?", [notifId]);
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Supprimer une notification individuelle
  // ----------------------------------------------------------
  test("supprimer une notification → absente de la liste", async ({
    memberPage,
    db,
  }) => {
    const memberId = await getMemberDbId(db);
    const ts = Date.now();

    const notifId = await db.insertOne("notifications", {
      user_id: memberId,
      type: "warning",
      titre: `[E2E-delete] ${ts}`,
      contenu: `Notification à supprimer ${ts}`,
    });

    await gotoNotifications(memberPage);

    // Attendre l'apparition de la notification
    const itemLocator = memberPage.locator(
      `[data-testid="notification-item-${notifId}"]`,
    );
    await expect(itemLocator).toBeVisible({ timeout: 10_000 });

    // Cliquer sur le bouton "Supprimer" de cette notification
    const deleteBtn = memberPage.locator(
      `[data-testid="notification-delete-${notifId}"]`,
    );
    await deleteBtn.click();

    // La notification doit disparaître de la liste
    await expect(itemLocator).not.toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Bouton "Tout marquer comme lu" → badge non-lu passe à 0
  //
  // Stratégie :
  //   - Insérer 2 notifications non lues pour le membre.
  //   - Naviguer vers /notifications.
  //   - Vérifier que le bouton "Tout marquer comme lu" est présent.
  //   - Cliquer dessus → le bouton doit disparaître (plus de non-lus).
  // ----------------------------------------------------------
  test('"Tout marquer comme lu" → bouton disparaît après clic', async ({
    memberPage,
    db,
  }) => {
    const memberId = await getMemberDbId(db);
    const ts = Date.now();

    // Insérer 2 notifications non lues
    const id1 = await db.insertOne("notifications", {
      user_id: memberId,
      type: "info",
      titre: `[E2E-unread-A] ${ts}`,
      contenu: "Non lue A",
    });
    const id2 = await db.insertOne("notifications", {
      user_id: memberId,
      type: "info",
      titre: `[E2E-unread-B] ${ts}`,
      contenu: "Non lue B",
    });

    try {
      await gotoNotifications(memberPage);

      // Le bouton "Tout marquer comme lu" doit être visible
      const markAllBtn = memberPage.locator(
        '[data-testid="mark-all-read-btn"]',
      );
      await expect(markAllBtn).toBeVisible({ timeout: 10_000 });

      // Attendre la réponse API après le clic
      // La route est POST /api/notifications/read-all
      const responsePromise = memberPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/notifications/read-all") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await markAllBtn.click();
      await responsePromise;

      // Après avoir tout marqué comme lu, le bouton doit disparaître
      // (il n'apparaît que si hasUnread === true)
      await expect(markAllBtn).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query("DELETE FROM notifications WHERE id IN (?, ?)", [
        id1,
        id2,
      ]);
    }
  });
});
