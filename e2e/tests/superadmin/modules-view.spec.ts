import { test, expect } from '@playwright/test';

test.describe('Super Admin Modules View', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
    
    // Navigate to Modules
    await page.getByRole('link', { name: /Modules/i }).click();
    await page.waitForURL('**/superadmin/modules');
  });

  test('Can switch to Matrix view', async ({ page }) => {
    const matrixBtn = page.getByRole('button', { name: 'Matrice des Permissions' }).first();
    await matrixBtn.click();

    // Verify matrix view is active by checking for some text unique to it
    await expect(page.getByText('Enregistrer la matrice')).toBeVisible();
  });
});
