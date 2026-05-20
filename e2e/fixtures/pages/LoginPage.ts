/**
 * LoginPage.ts
 * Page Object — formulaire de connexion (/login)
 *
 * Tous les locators utilisent data-testid pour être robustes
 * aux changements de style/structure HTML.
 *
 * data-testid attendus sur les éléments du formulaire :
 *   login-userid-input           → champ identifiant
 *   login-password-input         → champ mot de passe
 *   login-submit-btn             → bouton "Se connecter"
 *   login-remember-me            → checkbox "Se souvenir de moi"
 *   login-forgot-password-link   → lien "Mot de passe oublié ?"
 *   login-register-link          → lien "S'inscrire" / "Créer un compte"
 *   login-email-not-verified-banner → bannière email non vérifié
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // ============================================================
  // Locators
  // ============================================================
  readonly userIdInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;
  readonly emailNotVerifiedBanner: Locator;
  /** Toast d'erreur Sonner */
  readonly errorToast: Locator;

  constructor(page: Page) {
    this.page = page;

    this.userIdInput            = page.locator('[data-testid="login-userid-input"]');
    this.passwordInput          = page.locator('[data-testid="login-password-input"]');
    this.submitButton           = page.locator('[data-testid="login-submit-btn"]');
    this.rememberMeCheckbox     = page.locator('[data-testid="login-remember-me"]');
    this.forgotPasswordLink     = page.locator('[data-testid="login-forgot-password-link"]');
    this.registerLink           = page.locator('[data-testid="login-register-link"]');
    this.emailNotVerifiedBanner = page.locator('[data-testid="login-email-not-verified-banner"]');
    // Sonner toast avec type="error"
    this.errorToast             = page.locator('.sonner-toast[data-type="error"]');
  }

  // ============================================================
  // Méthodes
  // ============================================================

  /** Naviguer vers la page de login */
  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Remplir et soumettre le formulaire de login.
   * @param userId   - Identifiant utilisateur (format U-YYYY-XXXX)
   * @param password - Mot de passe
   */
  async login(userId: string, password: string): Promise<void> {
    await this.userIdInput.fill(userId);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Vérifier que l'utilisateur est redirigé vers /dashboard.
   * Attend jusqu'à 10 s pour laisser le temps à l'auth de s'établir.
   */
  async expectOnDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  }
}
