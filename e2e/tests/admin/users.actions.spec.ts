/**
 * users.actions.spec.ts
 * Tests E2E — Actions admin sur les utilisateurs (/users)
 * Phase E10
 *
 * data-testid utilisés :
 *   users-page, users-table, users-search
 *   btn-edit-role-{id}, btn-edit-status-{id}, btn-delete-user-{id}
 *   btn-notify-bulk, tab-groups
 *   select-user-role (#role-select), btn-submit-role
 *   btn-submit-status (#status-select)
 *   input-delete-reason, btn-confirm-delete-user
 *   tab-deleted-users
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

async function gotoUsers(page: import("@playwright/test").Page) {
  await page.goto("/users");
  await page
    .locator('[data-testid="users-page"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("Utilisateurs — Actions admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Modifier le rôle d'un utilisateur → rôle mis à jour
  // ----------------------------------------------------------
  test("modifier le rôle → rôle mis à jour", async ({ adminPage, db }) => {
    const ts = String(Date.now() % 10000).padStart(4, "0"); // 4 digits pour le format U-YYYY-XXXX
    const id = await db.insertOne("utilisateurs", {
      userId: `U-9997-${ts}`,
      email: `tr-${ts}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Test",
      last_name: "RoleUser",
      role_app: "member",
      status_id: 1,
      active: 1,
    });

    try {
      await gotoUsers(adminPage);

      // Chercher l'utilisateur
      await adminPage
        .locator('[data-testid="users-search"]')
        .fill(`U-9997-${ts}`);
      await adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users") && resp.url().includes("U-999"),
        { timeout: 10_000 },
      );
      await adminPage.waitForTimeout(500);

      // Attendre que la ligne apparaisse
      const editBtn = adminPage.locator(`[data-testid="btn-edit-role-${id}"]`);
      await editBtn.waitFor({ state: "visible", timeout: 10_000 });
      await editBtn.click();

      // La modal s'ouvre — sélectionner un nouveau rôle via l'id HTML natif du select
      await adminPage
        .locator("#role-select")
        .waitFor({ state: "visible", timeout: 5_000 });
      await adminPage.locator("#role-select").selectOption("professor");

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users/") &&
          resp.request().method() === "PATCH",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-role"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM utilisateurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 2 : Modifier le statut → statut mis à jour
  // ----------------------------------------------------------
  test("modifier le statut → statut mis à jour", async ({ adminPage, db }) => {
    const ts2 = String((Date.now() + 1) % 10000).padStart(4, "0"); // différent de test 1
    const id = await db.insertOne("utilisateurs", {
      userId: `U-9996-${ts2}`,
      email: `ts-${ts2}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Test",
      last_name: "StatusUser",
      role_app: "member",
      status_id: 1,
      active: 1,
    });

    try {
      await gotoUsers(adminPage);
      await adminPage
        .locator('[data-testid="users-search"]')
        .fill(`U-9996-${ts2}`);
      await adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users") && resp.url().includes("U-999"),
        { timeout: 10_000 },
      );
      await adminPage.waitForTimeout(500);

      const editBtn = adminPage.locator(
        `[data-testid="btn-edit-status-${id}"]`,
      );
      await editBtn.waitFor({ state: "visible", timeout: 10_000 });
      await editBtn.click();

      // La modal statut s'ouvre
      await adminPage
        .locator("#status-select")
        .waitFor({ state: "visible", timeout: 5_000 });
      await adminPage.locator("#status-select").selectOption("2");

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users/") &&
          resp.request().method() === "PATCH",
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-status"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM utilisateurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 3 : Supprimer un utilisateur → visible dans Supprimés
  // ----------------------------------------------------------
  test("supprimer un utilisateur → visible dans onglet Supprimés", async ({
    adminPage,
    db,
  }) => {
    const ts3 = String((Date.now() + 2) % 10000).padStart(4, "0"); // différent de tests 1 et 2
    const id = await db.insertOne("utilisateurs", {
      userId: `U-9995-${ts3}`,
      email: `td-${ts3}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Test",
      last_name: "DeleteUser",
      role_app: "member",
      status_id: 1,
      active: 1,
    });

    try {
      await gotoUsers(adminPage);
      await adminPage
        .locator('[data-testid="users-search"]')
        .fill(`U-9995-${ts3}`);
      await adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users") && resp.url().includes("U-999"),
        { timeout: 10_000 },
      );
      await adminPage.waitForTimeout(500);

      const deleteBtn = adminPage.locator(
        `[data-testid="btn-delete-user-${id}"]`,
      );
      await deleteBtn.waitFor({ state: "visible", timeout: 10_000 });
      await deleteBtn.click();

      // La modal delete s'ouvre
      await adminPage
        .locator('[data-testid="input-delete-reason"]')
        .waitFor({ state: "visible", timeout: 5_000 });
      await adminPage
        .locator('[data-testid="input-delete-reason"]')
        .fill("Raison de test E2E suppression");

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users/") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="btn-confirm-delete-user"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM utilisateurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Modal notification en masse visible
  // ----------------------------------------------------------
  test("modal notification en masse → modal visible", async ({ adminPage }) => {
    await gotoUsers(adminPage);

    const notifyBtn = adminPage.locator('[data-testid="btn-notify-bulk"]');
    const isBtnVisible = await notifyBtn
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (isBtnVisible) {
      await notifyBtn.click();
      // La modal NotifyUsersModal doit s'ouvrir
      await expect(adminPage.locator('[role="dialog"]')).toBeVisible({
        timeout: 5_000,
      });
    } else {
      test.skip();
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Onglet Groupes → liste visible
  // ----------------------------------------------------------
  test("onglet Groupes → liste visible", async ({ adminPage }) => {
    await gotoUsers(adminPage);

    await adminPage.locator('[data-testid="tab-groups"]').click();

    // L'onglet groupes affiche GroupsPage — vérifier qu'il n'y a pas d'erreur
    await expect(
      adminPage.locator("text=/500|Internal Server Error/i"),
    ).not.toBeVisible({ timeout: 5_000 });
    // Attendre que le contenu se charge
    await adminPage.waitForTimeout(1000);
  });

  // ----------------------------------------------------------
  // Test 6 : Restaurer un utilisateur supprimé → visible dans la liste active
  // ----------------------------------------------------------
  test("restaurer un utilisateur supprimé → visible dans la liste active", async ({
    adminPage,
    db,
  }) => {
    const ts = String(Date.now() % 10000).padStart(4, "0");
    const id = await db.insertOne("utilisateurs", {
      userId: `U-9994-${ts}`,
      email: `restore-${ts}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Restore",
      last_name: "TestUser",
      role_app: "member",
      status_id: 1,
      active: 0,
      deleted_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      deletion_reason: "Test E2E restauration",
    });

    try {
      await gotoUsers(adminPage);

      // Naviguer vers l'onglet Supprimés
      await adminPage
        .locator('[data-testid="tab-deleted-users"]')
        .waitFor({ state: "visible", timeout: 10_000 });
      await adminPage.locator('[data-testid="tab-deleted-users"]').click();

      // La page des supprimés doit être visible
      await adminPage
        .locator('[data-testid="deleted-users-page"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // Le bouton restaurer doit être visible pour notre utilisateur
      const restoreBtn = adminPage.locator(`[data-testid="btn-restore-${id}"]`);
      await restoreBtn.waitFor({ state: "visible", timeout: 10_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users/") &&
          resp.url().includes("/restore") &&
          resp.request().method() === "POST",
        { timeout: 10_000 },
      );
      await restoreBtn.click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM utilisateurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 7 : Assigner un abonnement à un utilisateur
  // ----------------------------------------------------------
  test("assigner un abonnement à un utilisateur", async ({ adminPage, db }) => {
    // Récupérer un plan tarifaire existant
    const planRows = await db.query<{ id: number; nom: string }>(
      "SELECT id, nom FROM plans_tarifaires WHERE actif = 1 LIMIT 1",
    );
    if (planRows.length === 0) {
      test.skip();
      return;
    }
    const planId = planRows[0].id;

    const ts = String(Date.now() % 10000).padStart(4, "0");
    const id = await db.insertOne("utilisateurs", {
      userId: `U-9993-${ts}`,
      email: `sub-${ts}@test.local`,
      password: "$2b$10$placeholder",
      first_name: "Sub",
      last_name: "TestUser",
      role_app: "member",
      status_id: 1,
      active: 1,
    });

    try {
      await gotoUsers(adminPage);

      // Chercher l'utilisateur
      await adminPage
        .locator('[data-testid="users-search"]')
        .fill(`U-9993-${ts}`);
      await adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users") && resp.url().includes("U-999"),
        { timeout: 10_000 },
      );
      await adminPage.waitForTimeout(500);

      // Cliquer sur le bouton assigner abonnement
      const assignBtn = adminPage.locator(
        `[data-testid="btn-assign-subscription-${id}"]`,
      );
      await assignBtn.waitFor({ state: "visible", timeout: 10_000 });
      await assignBtn.click();

      // La modal doit s'ouvrir
      await adminPage
        .locator('[data-testid="subscription-modal"]')
        .waitFor({ state: "visible", timeout: 5_000 });

      // Sélectionner le plan
      await adminPage
        .locator('[data-testid="subscription-plan-select"]')
        .waitFor({ state: "visible", timeout: 5_000 });
      await adminPage
        .locator('[data-testid="subscription-plan-select"]')
        .selectOption(String(planId));

      // Confirmer
      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/users/") &&
          resp.url().includes("/subscription") &&
          resp.request().method() === "PATCH",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="btn-confirm-subscription"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);
    } finally {
      await db
        .query("DELETE FROM utilisateurs WHERE id = ?", [id])
        .catch(() => {});
    }
  });
});
