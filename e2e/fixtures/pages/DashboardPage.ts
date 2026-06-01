/**
 * DashboardPage.ts
 * Page Object — tableau de bord principal (/dashboard)
 *
 * data-testid attendus :
 *   welcome-banner   → bandeau de bienvenue
 *   kpi-grid         → grille des KPIs
 *   nav-courses      → lien de navigation vers les cours
 *   nav-profile      → lien de navigation vers le profil
 *   nav-messages     → lien de navigation vers les messages
 */

import { type Page, type Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;

  // ============================================================
  // Locators
  // ============================================================
  readonly welcomeBanner: Locator;
  readonly kpiGrid: Locator;
  readonly navCourses: Locator;
  readonly navProfile: Locator;
  readonly navMessages: Locator;

  constructor(page: Page) {
    this.page = page;

    this.welcomeBanner = page.locator('[data-testid="welcome-banner"]');
    this.kpiGrid = page.locator('[data-testid="kpi-grid"]');
    this.navCourses = page.locator('[data-testid="nav-courses"]');
    this.navProfile = page.locator('[data-testid="nav-profile"]');
    this.navMessages = page.locator('[data-testid="nav-messages"]');
  }

  // ============================================================
  // Méthodes
  // ============================================================

  /** Naviguer directement vers /dashboard */
  async goto(): Promise<void> {
    await this.page.goto("/dashboard");
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Vérifier que le dashboard est chargé.
   * Attend que le welcomeBanner soit visible (signe que le composant est rendu).
   */
  async isLoaded(): Promise<void> {
    await expect(this.welcomeBanner).toBeVisible({ timeout: 10_000 });
  }
}
