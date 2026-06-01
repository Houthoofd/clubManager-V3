/**
 * statistics.pages.spec.ts
 * Tests E2E — Sous-pages statistiques (/statistics/*)
 * Phase E10
 *
 * data-testid utilisés :
 *   members-stats-page, courses-stats-page, finance-stats-page, store-stats-page
 */

import { test, expect } from '../../fixtures';

test.describe('Statistiques — sous-pages', () => {
  // ----------------------------------------------------------
  // Test 1 : /statistics/members → page accessible (admin)
  // ----------------------------------------------------------
  test('/statistics/members → page accessible', async ({ adminPage }) => {
    await adminPage.goto('/statistics/members');
    await expect(
      adminPage.locator('[data-testid="members-stats-page"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : /statistics/courses → page accessible (admin)
  // ----------------------------------------------------------
  test('/statistics/courses → page accessible', async ({ adminPage }) => {
    await adminPage.goto('/statistics/courses');
    await expect(
      adminPage.locator('[data-testid="courses-stats-page"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : /statistics/finance → page accessible (admin uniquement)
  // ----------------------------------------------------------
  test('/statistics/finance → page accessible (admin)', async ({ adminPage }) => {
    await adminPage.goto('/statistics/finance');
    await expect(
      adminPage.locator('[data-testid="finance-stats-page"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : /statistics/store → page accessible
  // ----------------------------------------------------------
  test('/statistics/store → page accessible', async ({ adminPage }) => {
    await adminPage.goto('/statistics/store');
    await expect(
      adminPage.locator('[data-testid="store-stats-page"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : PeriodSelector visible sur /statistics/members
  // ----------------------------------------------------------
  test('PeriodSelector visible sur members stats', async ({ adminPage }) => {
    await adminPage.goto('/statistics/members');
    await adminPage.locator('[data-testid="members-stats-page"]').waitFor({ state: 'visible', timeout: 15_000 });

    // Le PeriodSelector est dans un div.bg-white.rounded-lg.shadow.p-6
    // Son bouton refresh ou ses sélecteurs devraient être visibles
    await expect(
      adminPage.locator('.bg-white.rounded-lg.shadow').first(),
    ).toBeVisible({ timeout: 5_000 });
  });
});
