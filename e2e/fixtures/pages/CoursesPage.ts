/**
 * CoursesPage.ts
 * Page Object — liste des cours (/courses)
 *
 * data-testid attendus :
 *   courses-list        → conteneur de la liste des cours
 *   course-card-{id}    → carte d'un cours individuel (ex: course-card-42)
 */

import { type Page, type Locator } from '@playwright/test';

export class CoursesPage {
  readonly page: Page;

  // ============================================================
  // Locators statiques
  // ============================================================
  readonly courseList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.courseList = page.locator('[data-testid="courses-list"]');
  }

  // ============================================================
  // Locators dynamiques
  // ============================================================

  /**
   * Retourne le locator pour la carte d'un cours spécifique.
   * @param id - Identifiant du cours (numérique ou string)
   */
  courseCard(id: number | string): Locator {
    return this.page.locator(`[data-testid="course-card-${id}"]`);
  }

  // ============================================================
  // Méthodes
  // ============================================================

  /** Naviguer vers la liste des cours */
  async goto(): Promise<void> {
    await this.page.goto('/courses');
    await this.page.waitForLoadState('networkidle');
  }
}
