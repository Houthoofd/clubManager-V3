/**
 * payments.member.spec.ts
 * Tests E2E — Module Paiements (vue membre) (/payments)
 * Phase E6
 *
 * data-testid utilisés :
 *   payments-page, tab-my-payments
 *   my-payments-page, my-payments-kpis
 *   tab-my-payments, tab-my-schedules
 *   my-payments-table, my-schedules-table
 */

import { test, expect } from "../../fixtures";

test.describe("Paiements — Flux membre", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /payments → page visible (membre)
  // ----------------------------------------------------------
  test("charger /payments → page visible", async ({ memberPage }) => {
    await memberPage.goto("/payments");
    await memberPage
      .locator('[data-testid="payments-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });
    await expect(
      memberPage.locator('[data-testid="payments-page"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Mes Paiements → KPIs visibles
  // ----------------------------------------------------------
  test("onglet Mes Paiements → KPIs et historique visibles", async ({
    memberPage,
  }) => {
    await memberPage.goto("/payments");
    await memberPage
      .locator('[data-testid="payments-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Cliquer sur l'onglet "Mes Paiements"
    await memberPage.locator('[data-testid="tab-my-payments"]').click();

    await expect(
      memberPage.locator('[data-testid="my-payments-page"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      memberPage.locator('[data-testid="my-payments-kpis"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Onglet historique paiements → table ou vide
  // ----------------------------------------------------------
  test("onglet historique paiements → table ou état vide", async ({
    memberPage,
  }) => {
    await memberPage.goto("/payments");
    await memberPage
      .locator('[data-testid="payments-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });
    await memberPage.locator('[data-testid="tab-my-payments"]').click();
    await memberPage
      .locator('[data-testid="my-payments-page"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // L'onglet "Paiements" dans MyPaymentsPage est actif par défaut
    const table = memberPage.locator('[data-testid="my-payments-table"]');
    const empty = memberPage.locator("text=/no payments|aucun paiement/i");
    await expect(table.or(empty)).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Onglet Échéances → liste ou état vide
  // ----------------------------------------------------------
  test("onglet Échéances → liste ou état vide", async ({ memberPage }) => {
    await memberPage.goto("/payments");
    await memberPage
      .locator('[data-testid="payments-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });
    await memberPage.locator('[data-testid="tab-my-payments"]').click();
    await memberPage
      .locator('[data-testid="my-payments-page"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await memberPage.locator('[data-testid="tab-my-schedules"]').click();

    const table = memberPage.locator('[data-testid="my-schedules-table"]');
    const empty = memberPage
      .locator("text=/no.*(schedule|deadline)|aucune.*échéance/i")
      .first(); // first() évite le strict mode violation si plusieurs éléments matchent
    await expect(table.or(empty).first()).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Vérifier que l'onglet Plans n'est pas cliquable par un membre
  // (ou que le contenu admin n'est pas visible)
  // ----------------------------------------------------------
  test("onglet Plans tarifaires → contenu admin non visible pour un membre", async ({
    memberPage,
  }) => {
    await memberPage.goto("/payments");
    await memberPage
      .locator('[data-testid="payments-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // L'onglet admin Plans (si visible) ne doit pas afficher le contenu admin
    const tabPlans = memberPage.locator('[data-testid="tab-plans"]');
    const isTabVisible = await tabPlans
      .isVisible({ timeout: 3_000 })
      .catch(() => false);

    if (isTabVisible) {
      await tabPlans.click();
    }

    // Le contenu admin (plans-tab) ne devrait pas être visible pour un membre
    await expect(
      memberPage.locator('[data-testid="plans-tab"]'),
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
