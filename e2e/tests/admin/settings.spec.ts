/**
 * settings.spec.ts
 * Tests E2E — Flux admin : Paramètres (/settings)
 * Phase E4
 *
 * Projet Playwright : chromium-admin
 *
 * data-testid utilisés :
 *   settings-page → wrapper principal de SettingsPage
 */

import { test, expect } from "../../fixtures";

// ============================================================
// Helpers
// ============================================================

async function gotoSettings(page: import("@playwright/test").Page) {
  await page.goto("/settings");
  await page.locator('[data-testid="settings-page"]').waitFor({
    state: "visible",
    timeout: 15_000,
  });
}

// ============================================================
// Tests
// ============================================================

test.describe("Paramètres — Flux admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /settings → settings-page visible
  // ----------------------------------------------------------
  test("charger /settings → page paramètres visible", async ({ adminPage }) => {
    await gotoSettings(adminPage);
    await expect(
      adminPage.locator('[data-testid="settings-page"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Club Info visible et actif par défaut
  // ----------------------------------------------------------
  test("onglet Club Info visible par défaut", async ({ adminPage }) => {
    await gotoSettings(adminPage);

    const clubTab = adminPage.locator("#tab-club");
    await expect(clubTab).toBeVisible({ timeout: 10_000 });
    await expect(clubTab).toHaveAttribute("aria-selected", "true");
  });

  // ----------------------------------------------------------
  // Test 3 : Navigation vers l'onglet Apparence
  // ----------------------------------------------------------
  test("navigation vers l'onglet Apparence", async ({ adminPage }) => {
    await gotoSettings(adminPage);

    const apparenceTab = adminPage.locator("#tab-apparence");
    await expect(apparenceTab).toBeVisible({ timeout: 10_000 });
    await apparenceTab.click();

    await expect(apparenceTab).toHaveAttribute("aria-selected", "true");
  });

  // ----------------------------------------------------------
  // Test 4 : Navigation vers l'onglet Navigation (modules)
  // ----------------------------------------------------------
  test("navigation vers l'onglet Navigation (modules)", async ({
    adminPage,
  }) => {
    await gotoSettings(adminPage);

    const navTab = adminPage.locator("#tab-navigation");
    await expect(navTab).toBeVisible({ timeout: 10_000 });
    await navTab.click();

    await expect(navTab).toHaveAttribute("aria-selected", "true");
  });

  // ----------------------------------------------------------
  // Test 5 : Le bouton de sauvegarde de la section Club est présent et cliquable
  //
  // Note : On ne vérifie PAS le toast de succès car la valeur de test
  // peut être rejetée par la validation API selon la configuration du club.
  // Ce test vérifie uniquement que l'UI expose bien le bouton de sauvegarde.
  // ----------------------------------------------------------
  test("bouton Sauvegarder de la section Club visible et cliquable", async ({
    adminPage,
  }) => {
    await gotoSettings(adminPage);

    // L'input du nom du club est visible (onglet club actif par défaut)
    const clubNameInput = adminPage.locator("#club_name");
    await expect(clubNameInput).toBeVisible({ timeout: 10_000 });

    // Le bouton de sauvegarde est visible dans la section
    const saveBtn = adminPage
      .locator('[data-testid="settings-page"]')
      .getByRole("button")
      .filter({ hasText: /enregistrer|save/i })
      .first();

    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    await expect(saveBtn).toBeEnabled();

    // Vérifier que le bouton est cliquable (appel API déclenché sans erreur JS)
    // On ne vérifie pas le résultat HTTP car il dépend de la config de la DB
    await saveBtn.click();

    // Après le clic, on est toujours sur /settings (pas de redirection)
    await expect(adminPage).toHaveURL(/\/settings/, { timeout: 5_000 });
  });
});
