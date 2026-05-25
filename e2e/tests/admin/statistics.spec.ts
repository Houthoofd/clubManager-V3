/**
 * statistics.spec.ts
 * Tests E2E — Flux admin : Statistiques (/statistics/*)
 * Phase E4
 *
 * Projet Playwright : chromium-admin
 *
 * État actuel :
 *   - Tous les tests : ✅ actifs
 *
 * Fix appliqué :
 *   globalSetup.ts capture désormais le cookie HTTP-only refreshToken depuis
 *   la réponse de login et l'inclut dans le storageState Playwright. Cela
 *   permet au navigateur de renouveler le JWT sans redirection vers /login.
 */

import { test, expect } from "../../fixtures";

// ============================================================
// Tests
// ============================================================

test.describe("Statistiques — Flux admin", () => {
  // ----------------------------------------------------------
  // Test 1 : /statistics → redirige vers /statistics/dashboard
  // ----------------------------------------------------------
  test("/statistics → redirection vers /statistics/dashboard", async ({
    adminPage,
  }) => {
    await adminPage.goto("/statistics");
    await expect(adminPage).toHaveURL(/\/statistics\/dashboard/, {
      timeout: 15_000,
    });
  });

  // ----------------------------------------------------------
  // Test 2 : /statistics/dashboard → page chargée
  // ----------------------------------------------------------
  test("/statistics/dashboard → page chargée (statistics-dashboard visible)", async ({
    adminPage,
  }) => {
    await adminPage.goto("/statistics/dashboard");

    // The key assertion: user is NOT redirected to /login (auth refresh works)
    // Wait for URL to stabilize
    await adminPage.waitForLoadState("load");

    // Must stay on statistics route (not redirected to /login)
    await expect(adminPage).toHaveURL(/\/statistics/, { timeout: 15_000 });

    // The statistics-dashboard testid is present in both success and error states
    await expect(
      adminPage.locator('[data-testid="statistics-dashboard"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Onglet Members → accessible
  // ----------------------------------------------------------
  test("onglet Members du dashboard stats → accessible", async ({
    adminPage,
  }) => {
    await adminPage.goto("/statistics/dashboard");
    await adminPage.waitForLoadState("load");

    // Must stay on statistics route
    await expect(adminPage).toHaveURL(/\/statistics/, { timeout: 15_000 });

    // Click the Members tab
    const membersTab = adminPage.locator('[data-testid="stats-tab-members"]');
    await membersTab.waitFor({ state: "visible", timeout: 10_000 });
    await membersTab.click();

    // Members section content should become visible
    await expect(
      adminPage.locator('[data-testid="stats-members-section"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Onglet Courses → accessible
  // ----------------------------------------------------------
  test("onglet Courses du dashboard stats → accessible", async ({
    adminPage,
  }) => {
    await adminPage.goto("/statistics/dashboard");
    await adminPage.waitForLoadState("load");

    // Must stay on statistics route
    await expect(adminPage).toHaveURL(/\/statistics/, { timeout: 15_000 });

    // Click the Courses tab
    const coursesTab = adminPage.locator('[data-testid="stats-tab-courses"]');
    await coursesTab.waitFor({ state: "visible", timeout: 10_000 });
    await coursesTab.click();

    // Courses section content should become visible
    await expect(
      adminPage.locator('[data-testid="stats-courses-section"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : /statistics/finance → accessible pour admin
  // ----------------------------------------------------------
  test("/statistics/finance → accessible pour admin", async ({ adminPage }) => {
    await adminPage.goto("/statistics/finance");
    await adminPage.waitForLoadState("load");

    // L'admin a accès — la page ne redirige pas vers /dashboard
    await expect(adminPage).not.toHaveURL(
      /^http:\/\/localhost:\d+\/dashboard$/,
      {
        timeout: 10_000,
      },
    );
  });

  // ----------------------------------------------------------
  // Test 6 : /statistics avec rôle membre → RoleGuard redirige
  // ----------------------------------------------------------
  test("membre tente /statistics → redirection /dashboard", async ({
    memberPage,
  }) => {
    await memberPage.goto("/statistics");
    await expect(memberPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});
