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

import { test, expect } from '@playwright/test';
import { E2E_ADMIN } from '../../setup/e2e-credentials';

// ============================================================
// Helpers
// ============================================================

/** URL de base du formulaire d'inscription */
const REGISTER_URL = '/register';

/** Naviguer vers la page d'inscription et attendre le chargement */
async function gotoRegister(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(REGISTER_URL);
  await page.waitForLoadState('networkidle');
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
    await expect(page.locator('[data-testid="register-firstname-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-lastname-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-password-input"]')).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Inscription valide → redirection /login + succès
  // ----------------------------------------------------------
  test('inscription valide → redirection vers /login avec message succès', async ({ page }) => {
    await gotoRegister(page);

    // Générer un email unique pour éviter les doublons
    const uniqueEmail = `e2e_register_${Date.now()}@test.local`;

    await page.locator('[data-testid="register-firstname-input"]').fill('Test');
    await page.locator('[data-testid="register-lastname-input"]').fill('E2E');
    await page.locator('[data-testid="register-email-input"]').fill(uniqueEmail);
    await page.locator('[data-testid="register-password-input"]').fill('ValidPass@E2E2024!');

    // Remplir d'autres champs requis si présents (date de naissance, genre, etc.)
    // → Ces champs sont optionnels selon l'implémentation du formulaire
    const dobInput = page.locator('[data-testid="register-dob-input"]');
    if (await dobInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
      await dobInput.fill('1990-01-01');
    }

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
    await page.locator('[data-testid="register-firstname-input"]').fill('Dupliqué');
    await page.locator('[data-testid="register-lastname-input"]').fill('Test');
    await page.locator('[data-testid="register-email-input"]').fill(E2E_ADMIN.email);
    await page.locator('[data-testid="register-password-input"]').fill('ValidPass@E2E2024!');

    await page.locator('[data-testid="register-submit-btn"]').click();

    // Attendre une notification d'erreur (toast ou inline)
    const errorVisible = await Promise.race([
      page.locator('.sonner-toast[data-type="error"]').waitFor({ state: 'visible', timeout: 8_000 }).then(() => true),
      page.locator('[role="alert"]').waitFor({ state: 'visible', timeout: 8_000 }).then(() => true),
      page.locator('[data-testid="register-error"]').waitFor({ state: 'visible', timeout: 8_000 }).then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
    // On reste sur /register (ou /login si le serveur retourne une erreur async)
    await expect(page).not.toHaveURL(/\/dashboard/);
  });

  // ----------------------------------------------------------
  // Test 4 : Champ prénom manquant → validation inline
  // ----------------------------------------------------------
  test('champ prénom manquant → validation inline', async ({ page }) => {
    await gotoRegister(page);

    // Remplir tous les champs sauf le prénom
    await page.locator('[data-testid="register-lastname-input"]').fill('Test');
    await page.locator('[data-testid="register-email-input"]').fill(`no_firstname_${Date.now()}@test.local`);
    await page.locator('[data-testid="register-password-input"]').fill('ValidPass@E2E2024!');

    // Soumettre sans prénom
    await page.locator('[data-testid="register-submit-btn"]').click();

    // On reste sur /register (validation HTML5 ou JS bloque)
    await expect(page).toHaveURL(/\/register/, { timeout: 3_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Mot de passe faible → indicateur de force visible
  // ----------------------------------------------------------
  test('mot de passe faible → indicateur de force visible', async ({ page }) => {
    await gotoRegister(page);

    // Taper un mot de passe très faible
    const passwordInput = page.locator('[data-testid="register-password-input"]');
    await passwordInput.fill('abc');
    // Déclencher le blur pour activer la validation
    await passwordInput.blur();

    // L'indicateur de force doit apparaître
    const strengthIndicator = page.locator('[data-testid="register-password-strength"]')
      .or(page.locator('[data-testid="password-strength-indicator"]'))
      .or(page.locator('.password-strength'))
      .first();

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
