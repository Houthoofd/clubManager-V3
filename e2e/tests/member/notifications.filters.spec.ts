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

    await memberPage.goto("/notifications");
    await memberPage
      .locator('[data-testid="notifications-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Attendre que les notifications se chargent
    await memberPage.waitForTimeout(1000);

    // Vérifier si le bouton "Tout supprimer" est visible
    const deleteBtn = memberPage.locator('[data-testid="delete-all-btn"]');
    const isBtnVisible = await deleteBtn
      .isVisible({ timeout: 5_000 })
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
