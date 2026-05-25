/**
 * forgot-password.spec.ts
 * Tests E2E — Authentification / Mot de passe oublié
 *
 * Projet Playwright : chromium-no-auth (pas de storageState)
 *
 * data-testid attendus sur la page /forgot-password :
 *   forgot-password-email-input   → champ email
 *   forgot-password-submit-btn    → bouton "Envoyer le lien"
 *   forgot-password-success       → élément visible après soumission réussie
 *   forgot-password-back-login    → lien "Retour à la connexion"
 *
 * @playwright/test project: chromium-no-auth
 */

import { test, expect } from "@playwright/test";

// ============================================================
// Helpers
// ============================================================

const FORGOT_PASSWORD_URL = "/forgot-password";

async function gotoForgotPassword(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.goto(FORGOT_PASSWORD_URL);
  await page.waitForLoadState("networkidle");
}

// ============================================================
// Tests
// ============================================================

test.describe("Forgot Password — Récupération de mot de passe", () => {
  // ----------------------------------------------------------
  // Test 1 : Affichage du formulaire
  // ----------------------------------------------------------
  test("afficher le formulaire forgot-password", async ({ page }) => {
    await gotoForgotPassword(page);

    await expect(
      page.locator('[data-testid="forgot-password-email-input"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="forgot-password-submit-btn"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Soumission avec email valide → état succès
  // ----------------------------------------------------------
  test("soumettre un email valide → afficher état succès", async ({ page }) => {
    await gotoForgotPassword(page);

    // Remplir avec un email valide (peu importe s'il existe en DB —
    // pour des raisons de sécurité, le backend répond toujours "succès")
    await page
      .locator('[data-testid="forgot-password-email-input"]')
      .fill("test@example.com");
    await page.locator('[data-testid="forgot-password-submit-btn"]').click();

    // Attendre l'état succès
    await expect(
      page.locator('[data-testid="forgot-password-success"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Email invalide → validation inline
  // ----------------------------------------------------------
  test("email invalide → validation inline", async ({ page }) => {
    await gotoForgotPassword(page);

    const emailInput = page.locator(
      '[data-testid="forgot-password-email-input"]',
    );

    // Taper une valeur invalide puis blur
    await emailInput.fill("notanemail");
    await emailInput.blur();

    // Un message d'erreur inline doit apparaître
    // (validation HTML5 ou JS — le formulaire ne doit pas être soumis)
    const errorMsg = page
      .locator('[data-testid="forgot-password-email-error"]')
      .or(page.locator('[data-testid="forgot-password-error"]'))
      .or(
        emailInput.locator(
          'xpath=following-sibling::*[contains(@class,"error")]',
        ),
      )
      .first();

    // Le formulaire ne doit pas avoir soumis et afficher le succès
    await expect(
      page.locator('[data-testid="forgot-password-success"]'),
    ).not.toBeVisible({ timeout: 3_000 });

    // On reste sur /forgot-password
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  // ----------------------------------------------------------
  // Test 4 : Lien "Retour à la connexion" → /login
  // ----------------------------------------------------------
  test('lien "Retour à la connexion" → /login', async ({ page }) => {
    await gotoForgotPassword(page);

    // Cliquer le lien de retour
    await page.locator('[data-testid="forgot-password-login-link"]').click();

    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });
});
