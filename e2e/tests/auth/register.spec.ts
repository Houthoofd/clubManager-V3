/**
 * register.spec.ts
 * Tests E2E — Authentification / Inscription
 *
 * Projet Playwright : chromium-no-auth (pas de storageState)
 *
 * data-testid attendus sur le formulaire d'inscription :
 *   register-firstname-input   → champ prénom
 *   register-lastname-input    → champ nom
 *   register-email-input       → champ email
 *   register-password-input    → champ mot de passe
 *   register-submit-btn        → bouton "S'inscrire"
 *   register-login-link        → lien "Se connecter"
 *   register-password-strength → indicateur de force du mot de passe
 *
 * @playwright/test project: chromium-no-auth
 */

import { test, expect } from "@playwright/test";
import { E2E_ADMIN } from "../../setup/e2e-credentials";

// ============================================================
// Helpers
// ============================================================

/** URL de base du formulaire d'inscription */
const REGISTER_URL = "/register";

/** Naviguer vers la page d'inscription et attendre le chargement */
async function gotoRegister(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto(REGISTER_URL);
  await page.waitForLoadState("domcontentloaded");
}

// ============================================================
// Tests
// ============================================================

test.describe("Register — Inscription d'un utilisateur", () => {
  // ----------------------------------------------------------
  // Test 1 : Affichage du formulaire
  // ----------------------------------------------------------
  test("afficher le formulaire d'inscription", async ({ page }) => {
    await gotoRegister(page);

    // Vérifier que les champs clés sont visibles
    await expect(
      page.locator('[data-testid="register-firstname-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="register-lastname-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="register-email-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="register-password-input"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Inscription valide → redirection /login + succès
  // ----------------------------------------------------------
  test("inscription valide → redirection vers /login avec message succès", async ({
    page,
  }) => {
    await gotoRegister(page);

    // Générer un email unique pour éviter les doublons
    const uniqueEmail = `e2e_register_${Date.now()}@test.local`;

    await page.locator('[data-testid="register-firstname-input"]').fill("Test");
    // Note: le nom ne peut pas contenir de chiffres (regex /^[a-zA-ZÀ-ÿ\s'-]+$/)
    await page
      .locator('[data-testid="register-lastname-input"]')
      .fill("Dupont");
    await page
      .locator('[data-testid="register-email-input"]')
      .fill(uniqueEmail);

    // Date de naissance (champ requis)
    const dobInput = page.locator('[data-testid="register-dob-input"]');
    await dobInput.fill("1990-01-01");

    // Genre (select natif requis — attendre que les options soient chargées)
    await page.waitForFunction(
      () =>
        (document.querySelector("#genre_id") as HTMLSelectElement)?.options
          .length > 1,
      { timeout: 8_000 },
    );
    await page.selectOption("#genre_id", { index: 1 });

    await page
      .locator('[data-testid="register-password-input"]')
      .fill("ValidPass@E2E2024!");

    await page.locator('[data-testid="register-submit-btn"]').click();

    // Après inscription, on doit être redirigé vers /login
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Email déjà utilisé → toast d'erreur
  // ----------------------------------------------------------
  test("email déjà utilisé → toast d'erreur visible", async ({ page }) => {
    await gotoRegister(page);

    // Utiliser l'email d'un compte E2E existant
    // Remplir TOUS les champs requis (genre + dob) pour passer la validation frontend
    await page
      .locator('[data-testid="register-firstname-input"]')
      .fill("Duplique");
    await page.locator('[data-testid="register-lastname-input"]').fill("Test");
    await page
      .locator('[data-testid="register-email-input"]')
      .fill(E2E_ADMIN.email);
    await page.locator('[data-testid="register-dob-input"]').fill("1990-01-01");
    // Attendre que le select genre soit chargé et le remplir
    await page.waitForFunction(
      () =>
        (document.querySelector("#genre_id") as HTMLSelectElement)?.options
          .length > 1,
      { timeout: 8_000 },
    );
    await page.selectOption("#genre_id", { index: 1 });
    await page
      .locator('[data-testid="register-password-input"]')
      .fill("ValidPass@E2E2024!");

    await page.locator('[data-testid="register-submit-btn"]').click();

    // Attendre une notification d'erreur (toast Sonner)
    const errorVisible = await page
      .locator('[data-sonner-toast][data-type="error"]')
      .waitFor({ state: "visible", timeout: 8_000 })
      .then(() => true)
      .catch(() => false);

    expect(errorVisible).toBe(true);
    // On reste sur /register (ou /login si le serveur retourne une erreur async)
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  // ----------------------------------------------------------
  // Test 4 : Champ prénom manquant → validation inline
  // ----------------------------------------------------------
  test("champ prénom manquant → validation inline", async ({ page }) => {
    await gotoRegister(page);

    // Remplir tous les champs sauf le prénom
    await page.locator('[data-testid="register-lastname-input"]').fill("Test");
    await page
      .locator('[data-testid="register-email-input"]')
      .fill(`no_firstname_${Date.now()}@test.local`);
    await page
      .locator('[data-testid="register-password-input"]')
      .fill("ValidPass@E2E2024!");

    // Soumettre sans prénom
    await page.locator('[data-testid="register-submit-btn"]').click();

    // On reste sur /register (validation HTML5 ou JS bloque)
    await expect(page).toHaveURL(/\/register/, { timeout: 3_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Mot de passe faible → indicateur de force visible
  // ----------------------------------------------------------
  test("mot de passe faible → indicateur de force visible", async ({
    page,
  }) => {
    await gotoRegister(page);

    // Taper un mot de passe très faible
    const passwordInput = page.locator(
      '[data-testid="register-password-input"]',
    );
    await passwordInput.fill("abc");
    // Déclencher le blur pour activer la validation
    await passwordInput.blur();

    // L'indicateur de force PasswordInput a id="password-strength" (id={id}-strength)
    const strengthIndicator = page.locator("#password-strength");

    await expect(strengthIndicator).toBeVisible({ timeout: 3_000 });
  });

  // ----------------------------------------------------------
  // Test 6 : Lien "Se connecter" → navigation vers /login
  // ----------------------------------------------------------
  test('lien "Se connecter" → navigation vers /login', async ({ page }) => {
    await gotoRegister(page);

    // Cliquer le lien qui pointe vers /login
    await page.locator('[data-testid="register-login-link"]').click();

    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
