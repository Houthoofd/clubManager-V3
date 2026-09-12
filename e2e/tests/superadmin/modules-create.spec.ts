import { test, expect } from '@playwright/test';

test.describe('Super Admin Modules Create', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
    await page.getByRole('link', { name: /Modules/i }).click();
    await page.waitForURL('**/superadmin/modules');
  });

  test('Can create a new module', async ({ page }) => {
    // Click on Nouveau Module
    await page.getByRole('button', { name: /Nouveau Module/i }).click();

    // Verify modal appears
    await expect(page.getByRole('heading', { name: 'Nouveau Module' })).toBeVisible();

    // Fill the form
    await page.getByPlaceholder('Ex: Gestion des tournois').fill('Module de Test E2E');
    await page.getByPlaceholder(/Expliquez brièvement/i).fill('Description E2E');
    
    // Submit
    await page.getByRole('button', { name: 'Créer le module' }).click();

    // The modal should close and the new module should be in the list
    await expect(page.getByText('Module de Test E2E').first()).toBeVisible();
  });
});
