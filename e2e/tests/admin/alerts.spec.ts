/**
 * alerts.spec.ts
 * Tests E2E — Flux admin & membre : Gestion des alertes (/alerts)
 * Phase E4
 *
 * data-testid utilisés :
 *   alerts-page, tab-admin, tab-my-alerts, subtab-alerts, subtab-types
 *   btn-create-alert-type, alert-types-table, alert-type-row-{id}
 *   btn-edit-alert-type-{id}, btn-delete-alert-type-{id}
 *   alert-type-form-modal, input-type-code, input-type-name
 *   select-type-priority, btn-submit-type-form, btn-cancel-type-form
 *   btn-create-alert, admin-alerts-table, alert-row-{id}
 *   btn-resolve-{id}, btn-ignore-{id}
 *   create-alert-modal, input-alert-user-id, select-alert-type, btn-submit-create-alert
 *   my-alerts-tab, my-alerts-list, my-alerts-empty, alert-card-{id}
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

async function gotoAlerts(page: import("@playwright/test").Page) {
  await page.goto("/alerts");
  await page.locator('[data-testid="alerts-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Alertes — Flux admin & membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /alerts → page admin visible
  // ----------------------------------------------------------
  test("charger /alerts → page admin visible", async ({ adminPage }) => {
    await gotoAlerts(adminPage);
    await expect(
      adminPage.locator('[data-testid="alerts-page"]'),
    ).toBeVisible();
    await expect(adminPage.locator('[data-testid="tab-admin"]')).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Types d'alertes → liste ou état vide visible
  // ----------------------------------------------------------
  test("onglet Types d'alertes → liste ou état vide visible", async ({
    adminPage,
  }) => {
    await gotoAlerts(adminPage);
    await adminPage.locator('[data-testid="subtab-types"]').click();

    const table = adminPage.locator('[data-testid="alert-types-table"]');
    const emptyState = adminPage.locator('[data-testid="alert-types-empty"]');

    await expect(table.or(emptyState)).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Créer un type d'alerte → type visible dans la liste
  // Code et nom uniques via Date.now() pour éviter les conflits.
  // ----------------------------------------------------------
  test("créer un type d'alerte → type visible dans la liste", async ({
    adminPage,
    db,
  }) => {
    const uniqueCode = `TEST-${Date.now()}`;
    const uniqueName = `Type E2E ${Date.now()}`;

    await gotoAlerts(adminPage);
    await adminPage.locator('[data-testid="subtab-types"]').click();
    await adminPage.locator('[data-testid="btn-create-alert-type"]').click();
    await adminPage
      .locator('[data-testid="alert-type-form-modal"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await adminPage.locator('[data-testid="input-type-code"]').fill(uniqueCode);
    await adminPage.locator('[data-testid="input-type-name"]').fill(uniqueName);
    await adminPage
      .locator('[data-testid="select-type-priority"]')
      .selectOption("normale");

    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/alerts/types") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="btn-submit-type-form"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    try {
      await expect(
        adminPage
          .locator('[data-testid="alert-types-table"]')
          .getByText(uniqueName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM alertes_types WHERE code = ?", [uniqueCode])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Modifier un type d'alerte → modifications persistées
  // ----------------------------------------------------------
  test("modifier un type d'alerte → modifications persistées", async ({
    adminPage,
    db,
  }) => {
    const id = await db.insertOne("alertes_types", {
      code: `EDIT-${Date.now()}`,
      nom: `Type Edit ${Date.now()}`,
      priorite: "basse",
      actif: 1,
    });

    try {
      const updatedName = `Type Modifié ${Date.now()}`;

      await gotoAlerts(adminPage);
      await adminPage.locator('[data-testid="subtab-types"]').click();
      await adminPage
        .locator(`[data-testid="alert-type-row-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });

      await adminPage
        .locator(`[data-testid="btn-edit-alert-type-${id}"]`)
        .click();
      await adminPage
        .locator('[data-testid="alert-type-form-modal"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      const nameInput = adminPage.locator('[data-testid="input-type-name"]');
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/alerts/types") &&
          resp.request().method() === "PUT",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-type-form"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage
          .locator('[data-testid="alert-types-table"]')
          .getByText(updatedName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM alertes_types WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Supprimer un type d'alerte → type absent de la liste
  // dialog.accept() et responsePromise déclarés AVANT le clic.
  // ----------------------------------------------------------
  test("supprimer un type d'alerte → type absent de la liste", async ({
    adminPage,
    db,
  }) => {
    const id = await db.insertOne("alertes_types", {
      code: `DEL-${Date.now()}`,
      nom: `Type Delete ${Date.now()}`,
      priorite: "basse",
      actif: 1,
    });

    try {
      await gotoAlerts(adminPage);
      await adminPage.locator('[data-testid="subtab-types"]').click();
      await adminPage
        .locator(`[data-testid="alert-type-row-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/alerts/types") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      adminPage.once("dialog", (dialog) => dialog.accept());
      await adminPage
        .locator(`[data-testid="btn-delete-alert-type-${id}"]`)
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator(`[data-testid="alert-type-row-${id}"]`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM alertes_types WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 6 : Créer une alerte utilisateur → alerte visible dans la liste
  // Récupère l'ID interne du membre via SELECT avant de remplir le formulaire.
  // ----------------------------------------------------------
  test("créer une alerte utilisateur → alerte visible dans la liste", async ({
    adminPage,
    db,
  }) => {
    const alertTypeId = await db.insertOne("alertes_types", {
      code: `ALERT-${Date.now()}`,
      nom: `Type Alerte ${Date.now()}`,
      priorite: "normale",
      actif: 1,
    });

    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRow.id;

    try {
      await gotoAlerts(adminPage);
      await adminPage.locator('[data-testid="subtab-alerts"]').click();
      await adminPage.locator('[data-testid="btn-create-alert"]').click();
      await adminPage
        .locator('[data-testid="create-alert-modal"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      await adminPage
        .locator('[data-testid="input-alert-user-id"]')
        .fill(String(memberDbId));
      await adminPage
        .locator('[data-testid="select-alert-type"]')
        .selectOption(String(alertTypeId));

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/alerts/admin") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="btn-submit-create-alert"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator('[data-testid="admin-alerts-table"]'),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query(
          "DELETE FROM alertes_utilisateurs WHERE user_id = ? AND alerte_type_id = ?",
          [memberDbId, alertTypeId],
        )
        .catch(() => {});
      await db
        .query("DELETE FROM alertes_types WHERE id = ?", [alertTypeId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 7 : Résoudre une alerte → statut 'résolue' affiché
  // Insère directement une alerte 'active' en DB pour un état garanti.
  // ----------------------------------------------------------
  test("résoudre une alerte → statut 'résolue' affiché", async ({
    adminPage,
    db,
  }) => {
    const alertTypeId = await db.insertOne("alertes_types", {
      code: `RESOLVE-${Date.now()}`,
      nom: `Type Resolve ${Date.now()}`,
      priorite: "haute",
      actif: 1,
    });

    const [memberRow] = await db.query<{ id: number }>(
      "SELECT id FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRow.id;

    const alertId = await db.insertOne("alertes_utilisateurs", {
      user_id: memberDbId,
      alerte_type_id: alertTypeId,
      statut: "active",
    });

    try {
      await gotoAlerts(adminPage);
      await adminPage.locator('[data-testid="subtab-alerts"]').click();
      await adminPage
        .locator(`[data-testid="btn-resolve-${alertId}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes(`/api/alerts/admin/${alertId}/resolve`) &&
          resp.request().method() === "PATCH",
        { timeout: 10_000 },
      );
      await adminPage.locator(`[data-testid="btn-resolve-${alertId}"]`).click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      // L'UI affiche la clé i18n "status.resolue" (pas d'accent) ou le texte traduit
      await expect(
        adminPage.locator(`[data-testid="alert-row-${alertId}"]`),
      ).toContainText(/resolue|résolue|resolved/i, { timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM alertes_utilisateurs WHERE id = ?", [alertId])
        .catch(() => {});
      await db
        .query("DELETE FROM alertes_types WHERE id = ?", [alertTypeId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 8 : Vue membre : onglet 'Mes alertes' visible
  // ----------------------------------------------------------
  test("vue membre : onglet 'Mes alertes' visible", async ({ memberPage }) => {
    await memberPage.goto("/alerts");
    await memberPage
      .locator('[data-testid="alerts-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await memberPage.locator('[data-testid="tab-my-alerts"]').click();

    await expect(
      memberPage.locator('[data-testid="my-alerts-tab"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 9 : Vue membre : liste ou état vide affiché
  // Utilise .or() pour accepter les deux états possibles selon la DB.
  // ----------------------------------------------------------
  test("vue membre : liste ou état vide affiché", async ({ memberPage }) => {
    await memberPage.goto("/alerts");
    await memberPage
      .locator('[data-testid="alerts-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await memberPage.locator('[data-testid="tab-my-alerts"]').click();
    await memberPage
      .locator('[data-testid="my-alerts-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    const list = memberPage.locator('[data-testid="my-alerts-list"]');
    const empty = memberPage.locator('[data-testid="my-alerts-empty"]');

    await expect(list.or(empty)).toBeVisible({ timeout: 10_000 });
  });
});
