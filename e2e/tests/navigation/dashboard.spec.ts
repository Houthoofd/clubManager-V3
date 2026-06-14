/**
 * dashboard.spec.ts
 * Tests E2E — Tableau de bord principal (/dashboard)
 * Phase E10
 *
 * data-testid utilisés :
 *   dashboard-page, kpi-grid, today-courses-section, recent-notifications-section
 */

import { test, expect } from "../../fixtures";

test.describe("Dashboard — /dashboard", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /dashboard → page visible avec KPIs
  // ----------------------------------------------------------
  test("charger /dashboard → page visible avec KPIs", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await adminPage
      .locator('[data-testid="dashboard-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await expect(adminPage.locator('[data-testid="kpi-grid"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  // ----------------------------------------------------------
  // Test 2 : Section Cours du jour visible (cours ou état vide)
  // ----------------------------------------------------------
  test("section Cours du jour visible", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await adminPage
      .locator('[data-testid="dashboard-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await expect(
      adminPage.locator('[data-testid="today-courses-section"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Section Notifications récentes visible
  // ----------------------------------------------------------
  test("section Notifications récentes visible", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");
    await adminPage
      .locator('[data-testid="dashboard-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await expect(
      adminPage.locator('[data-testid="recent-notifications-section"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : QuickActions visibles et cliquables
  // ----------------------------------------------------------
  test("QuickActions → grille visible et navigation fonctionnelle", async ({
    adminPage,
  }) => {
    await adminPage.goto("/dashboard");
    await adminPage
      .locator('[data-testid="dashboard-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // La section QuickActions doit être visible
    await expect(
      adminPage.locator('[data-testid="quick-actions"]'),
    ).toBeVisible({ timeout: 10_000 });

    // Cliquer sur la carte "Cours" → navigation vers /courses
    const coursesAction = adminPage.locator(
      '[data-testid="quick-action-courses"]',
    );
    await coursesAction.waitFor({ state: "visible", timeout: 5_000 });
    await coursesAction.click();

    await expect(adminPage).toHaveURL(/\/courses/, { timeout: 10_000 });
  });
});
