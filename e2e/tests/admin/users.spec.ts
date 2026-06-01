/**
 * users.spec.ts
 * Tests E2E — Flux admin : Gestion des utilisateurs (/users)
 * Phase E4
 *
 * Projet Playwright : chromium-admin
 *
 * data-testid utilisés :
 *   users-page         → wrapper principal
 *   users-search       → champ de recherche
 *   users-role-filter  → filtre par rôle
 *   users-table        → wrapper du DataTable
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

async function gotoUsers(page: import("@playwright/test").Page) {
  await page.goto("/users");
  await page.locator('[data-testid="users-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Utilisateurs — Flux admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /users → page visible
  // ----------------------------------------------------------
  test("charger /users → page utilisateurs visible", async ({ adminPage }) => {
    await gotoUsers(adminPage);
    await expect(adminPage.locator('[data-testid="users-page"]')).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Table des utilisateurs visible
  // On cherche le userId format U-9999-XXXX (garantis en DB par le seed).
  // ----------------------------------------------------------
  test("table des utilisateurs visible avec les comptes E2E", async ({
    adminPage,
  }) => {
    await gotoUsers(adminPage);

    const tableWrapper = adminPage.locator('[data-testid="users-table"]');
    await expect(tableWrapper).toBeVisible({ timeout: 10_000 });

    // Les utilisateurs E2E sont paginés (38 utilisateurs, 20/page) : on filtre d'abord
    const searchInput = adminPage.locator('[data-testid="users-search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill("U-9999");

    // Attendre la réponse API filtrée (debounce 300 ms)
    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/users") && resp.url().includes("U-9999"),
      { timeout: 10_000 },
    );

    // Les userId E2E (U-9999-0001, U-9999-0002, U-9999-0003) doivent apparaître
    // .first() évite la violation strict mode (plusieurs lignes matchent le pattern)
    await expect(tableWrapper.getByText(/U-9999-000[123]/).first()).toBeVisible(
      {
        timeout: 10_000,
      },
    );
  });

  // ----------------------------------------------------------
  // Test 3 : Recherche par userId → liste filtrée
  // On recherche le userId de l'admin E2E pour un résultat certain.
  // ----------------------------------------------------------
  test("recherche par userId admin → résultat filtré visible", async ({
    adminPage,
  }) => {
    await gotoUsers(adminPage);

    const searchInput = adminPage.locator('[data-testid="users-search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Rechercher par userId exact de l'admin
    await searchInput.fill(E2E_DB_USER_IDS.admin); // "U-9999-0001"

    // Attendre la réponse API (debounce 300 ms)
    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/users") &&
        resp.url().includes(encodeURIComponent(E2E_DB_USER_IDS.admin)),
      { timeout: 10_000 },
    );

    // Le userId de l'admin doit être visible dans les résultats
    await expect(
      adminPage
        .locator('[data-testid="users-table"]')
        .getByText(E2E_DB_USER_IDS.admin),
    ).toBeVisible({ timeout: 10_000 });

    // Le userId du membre ne doit pas apparaître
    await expect(
      adminPage
        .locator('[data-testid="users-table"]')
        .getByText(E2E_DB_USER_IDS.member),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Filtre rôle "member" → le membre E2E visible, admin non
  // ----------------------------------------------------------
  test('filtre rôle "member" → membre E2E visible, admin non', async ({
    adminPage,
  }) => {
    await gotoUsers(adminPage);

    const roleFilter = adminPage.locator('[data-testid="users-role-filter"]');
    await expect(roleFilter).toBeVisible({ timeout: 10_000 });
    await roleFilter.selectOption("member");

    // Affiner par userId E2E membre pour contourner la pagination
    const searchInput = adminPage.locator('[data-testid="users-search"]');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill(E2E_DB_USER_IDS.member); // "U-9999-0002"

    // Attendre la réponse API combinant rôle + recherche
    await adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/users") &&
        resp.url().includes("role_app=member") &&
        resp.url().includes(E2E_DB_USER_IDS.member),
      { timeout: 10_000 },
    );

    // Le userId membre doit être visible dans la table filtrée
    await expect(
      adminPage
        .locator('[data-testid="users-table"]')
        .getByText(E2E_DB_USER_IDS.member),
    ).toBeVisible({ timeout: 10_000 });

    // Le userId admin ne doit PAS être visible (role admin ≠ member)
    await expect(
      adminPage
        .locator('[data-testid="users-table"]')
        .getByText(E2E_DB_USER_IDS.admin),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Onglet Supprimés → page utilisateurs supprimés
  // ----------------------------------------------------------
  test("onglet Supprimés → page utilisateurs supprimés visible", async ({
    adminPage,
  }) => {
    await gotoUsers(adminPage);

    const deletedTab = adminPage.locator("#tab-deleted");
    await expect(deletedTab).toBeVisible({ timeout: 10_000 });
    await deletedTab.click();

    await expect(deletedTab).toHaveAttribute("aria-selected", "true");
    await adminPage.waitForLoadState("load");
    await expect(adminPage).toHaveURL(/\/users/);
  });
});
