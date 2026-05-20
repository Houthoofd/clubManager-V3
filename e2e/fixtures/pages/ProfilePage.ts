/**
 * ProfilePage.ts
 * Page Object — page de profil utilisateur (/profile)
 *
 * data-testid attendus :
 *   profile-firstname-input  → champ prénom
 *   profile-save-btn         → bouton sauvegarder
 */

import { type Page, type Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  // ============================================================
  // Locators
  // ============================================================
  readonly firstNameInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-testid="profile-firstname-input"]');
    this.saveButton     = page.locator('[data-testid="profile-save-btn"]');
  }

  // ============================================================
  // Méthodes
  // ============================================================

  /** Naviguer vers la page de profil */
  async goto(): Promise<void> {
    await this.page.goto('/profile');
    await this.page.waitForLoadState('networkidle');
  }
}
