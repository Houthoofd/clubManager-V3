import { test, expect } from '@playwright/test';

test.describe('Super Admin Billing Modals', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
    await page.getByRole('link', { name: 'Abonnements' }).click();
    await page.waitForURL('**/superadmin/billing');
  });

  test('Can open Create Plan Modal', async ({ page }) => {
    // Click on Plans tab
    const plansTab = page.getByRole('button', { name: 'Plans' }).first();
    await plansTab.click();

    // Click Créer un Plan button
    const createBtn = page.getByRole('button', { name: /Créer un Plan/i }).first();
    await createBtn.click();

    // Verify Modal appears (it contains a Description label)
    await expect(page.getByText('Description').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enregistrer' })).toBeVisible();
  });
});
