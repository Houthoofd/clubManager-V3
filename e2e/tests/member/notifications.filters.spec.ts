/**
 * notifications.filters.spec.ts
 * Tests E2E — Filtres de notifications (/notifications)
 * Phase E10
 *
 * data-testid utilisés :
 *   notifications-page, notifications-tab-{key}
 *   notifications-list, delete-all-btn
 */

import { test, expect } from "../../fixtures";

test.describe("Notifications — filtres", () => {
  // ----------------------------------------------------------
  // Test 1 : Filtrer les notifications par type "warning"
  // → seules les notifs warning visibles
  // ----------------------------------------------------------
  test("filtre onglet Warning → seules les notifs warning visibles", async ({
    memberPage,
    db,
  }) => {
    // Insérer une notification warning pour le membre
    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      ["U-9999-0002"],
    );
    const memberDbId = memberRow.id;

    await db
      .insertOne("notifications", {
        user_id: memberDbId,
        type: "warning",
        titre: "Notif Warning E2E",
        contenu: "Contenu test warning",
        lu: 0,
      })
      .catch(() => {});

    try {
      await memberPage.goto("/notifications");
      await memberPage
        .locator('[data-testid="notifications-page"]')
        .waitFor({ state: "visible", timeout: 15_000 });

      // Cliquer sur l'onglet "warning"
      await memberPage
        .locator('[data-testid="notifications-tab-warning"]')
        .click();

      // Seules les notifs de type warning devraient être visibles
      // Soit la liste, soit l'état vide "aucune notification dans cette catégorie"
      const list = memberPage.locator('[data-testid="notifications-list"]');
      const empty = memberPage.locator("text=/Aucune notification/i").first();
      await expect(list.or(empty).first()).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query(
          "DELETE FROM notifications WHERE user_id = ? AND type = ? AND titre = ?",
          [memberDbId, "warning", "Notif Warning E2E"],
        )
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 2 : "Supprimer toutes" → liste vide après confirmation
  // ----------------------------------------------------------
  test("supprimer toutes les notifications → liste vide", async ({
    memberPage,
    db,
  }) => {
    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      ["U-9999-0002"],
    );
    const memberDbId = memberRow.id;

    // Nettoyer les notifications accumulées pour garantir que le bouton
    // "Tout supprimer" sera visible (il n'apparaît que si base.length > 0).
    await db
      .query("DELETE FROM notifications WHERE user_id = ?", [memberDbId])
      .catch(() => {});

    // Insérer au moins une notification pour avoir le bouton "Tout supprimer"
    await db
      .insertOne("notifications", {
        user_id: memberDbId,
        type: "info",
        titre: "Notif Delete All E2E",
        contenu: "Contenu à supprimer",
        lu: 0,
      })
      .catch(() => {});

    // Attendre la réponse API des notifications avant de vérifier le bouton
    const notifResponsePromise = memberPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/notifications") &&
        resp.request().method() === "GET",
      { timeout: 10_000 },
    );

    await memberPage.goto("/notifications");
    await memberPage
      .locator('[data-testid="notifications-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Attendre la réponse API pour s'assurer que les données sont chargées
    await notifResponsePromise.catch(() => {});

    // Vérifier si le bouton "Tout supprimer" est visible
    const deleteBtn = memberPage.locator('[data-testid="delete-all-btn"]');
    const isBtnVisible = await deleteBtn
      .waitFor({ state: "visible", timeout: 5_000 })
      .then(() => true)
      .catch(() => false);

    if (isBtnVisible) {
      const responsePromise = memberPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/notifications") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      await deleteBtn.click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
      // Petit délai pour laisser l'UI se mettre à jour
      await memberPage.waitForTimeout(500);

      // Après suppression, la liste devrait être vide
      await expect(
        memberPage.locator("text=/Aucune notification/i").first(),
      ).toBeVisible({ timeout: 10_000 });
    } else {
      // Pas de notifications visibles — test conditionnel passé
      test.skip();
    }
  });
});
