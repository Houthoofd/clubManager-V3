import { test, expect } from '@playwright/test';

test.describe('Super Admin Modules Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[name="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
    
    // Navigate to Modules
    await page.getByRole('link', { name: /Modules/i }).click();
    await page.waitForURL('**/superadmin/modules');
  });

  test('Modules list renders correctly (Happy Path)', async ({ page }) => {
    // Check for a known module like Familles or Boutique
    await expect(page.getByText(/Familles/i)).toBeVisible();
    await expect(page.getByText(/Boutique/i)).toBeVisible();
  });

  test('Toggle a module state (Happy Path)', async ({ page }) => {
    // Intercept to mock success
    await page.route('**/api/superadmin/saas/modules/*/toggle', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Module mis à jour' })
      });
    });

    const toggle = page.locator('button[role="switch"]').first();
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();

    // Verify success toast
    await expect(page.getByText('Module mis à jour')).toBeVisible();
  });

  test('Toggle a module with API error (Edge Case)', async ({ page }) => {
    // Intercept to mock 500 error
    await page.route('**/api/superadmin/saas/modules/*/toggle', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Erreur serveur interne' })
      });
    });

    const toggle = page.locator('button[role="switch"]').first();
    await toggle.waitFor({ state: 'visible' });
    
    // We expect the toggle state to revert if it failed.
    // In many UI frameworks, the switch optimism updates, then reverts on error.
    await toggle.click();

    // Verify error toast
    await expect(page.getByText('Erreur serveur interne')).toBeVisible();
  });
});
