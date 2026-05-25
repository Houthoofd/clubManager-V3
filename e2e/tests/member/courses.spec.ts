/**
 * courses.spec.ts
 * Tests E2E — Flux membre : Cours (/courses)
 * Phase E3
 *
 * Projet Playwright : chromium-member (testIgnore dans playwright.config.ts)
 *
 * Comptes de test :
 *   Membre : e2e_member (U-9999-0002) — role_app: member
 *
 * data-testid utilisés :
 *   courses-page            → wrapper principal de CoursesPage
 *   courses-sessions-table  → wrapper de la DataTable des séances
 *
 * Note : MyCoursesPage est rendue dans l'onglet #tab-myEnrollments de /courses,
 * pas via une route /my-courses séparée.
 */

import { test, expect } from "../../fixtures";

// ============================================================
// Helpers
// ============================================================

async function gotoCoursesPage(page: import("@playwright/test").Page) {
  await page.goto("/courses");
  await page.locator('[data-testid="courses-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Cours — Flux membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /courses → courses-page visible
  // ----------------------------------------------------------
  test("charger /courses → page des cours visible", async ({ memberPage }) => {
    await gotoCoursesPage(memberPage);
    await expect(
      memberPage.locator('[data-testid="courses-page"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Planning visible et actif par défaut
  // ----------------------------------------------------------
  test("onglet Planning visible par défaut", async ({ memberPage }) => {
    await gotoCoursesPage(memberPage);

    const planningTab = memberPage.locator("#tab-planning");
    await expect(planningTab).toBeVisible({ timeout: 10_000 });
    await expect(planningTab).toHaveAttribute("aria-selected", "true");
  });

  // ----------------------------------------------------------
  // Test 3 : Clic sur l'onglet Séances → contenu visible
  // ----------------------------------------------------------
  test("clic onglet Séances → section séances visible", async ({
    memberPage,
  }) => {
    await gotoCoursesPage(memberPage);

    const sessionsTab = memberPage.locator("#tab-sessions");
    await sessionsTab.waitFor({ state: "visible", timeout: 10_000 });
    await sessionsTab.click();

    await expect(sessionsTab).toHaveAttribute("aria-selected", "true");

    // Table des séances OU empty state doivent être rendus
    await expect(
      memberPage
        .locator(
          '[data-testid="courses-sessions-table"], [data-testid="courses-page"] .p-6',
        )
        .first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Onglet "Mes inscriptions" (MyCoursesPage)
  //
  // MyCoursesPage est dans l'onglet #tab-myEnrollments — pas une route séparée.
  // ----------------------------------------------------------
  test("onglet Mes inscriptions → page inscriptions visible", async ({
    memberPage,
  }) => {
    await gotoCoursesPage(memberPage);

    // Cliquer sur l'onglet myEnrollments
    const myEnrollmentsTab = memberPage.locator("#tab-myEnrollments");
    await myEnrollmentsTab.waitFor({ state: "visible", timeout: 10_000 });
    await myEnrollmentsTab.click();

    await expect(myEnrollmentsTab).toHaveAttribute("aria-selected", "true");

    // Le wrapper de MyCoursesPage doit être visible
    await expect(
      memberPage.locator('[data-testid="my-courses-page"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Table Mes inscriptions ou état vide visible
  // ----------------------------------------------------------
  test("Mes inscriptions → table ou état vide rendu", async ({
    memberPage,
  }) => {
    await gotoCoursesPage(memberPage);

    const myEnrollmentsTab = memberPage.locator("#tab-myEnrollments");
    await myEnrollmentsTab.waitFor({ state: "visible", timeout: 10_000 });
    await myEnrollmentsTab.click();

    await memberPage
      .locator('[data-testid="my-courses-page"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // La table (avec données) ou l'état vide doit être visible
    const tableOrEmpty = memberPage.locator(
      '[data-testid="my-courses-table"], [data-testid="my-courses-page"] table, [data-testid="my-courses-page"] [class*="empty"]',
    );
    await expect(tableOrEmpty.first()).toBeVisible({ timeout: 10_000 });
  });
});
