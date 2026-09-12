import { test, expect } from '@playwright/test';

test.describe('Super Admin Modules Extra', () => {
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

  test('Can search for a module', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Rechercher un module...');
    
    // Fill with something non-existent
    await searchInput.fill('DOES_NOT_EXIST_XYZ');
    await expect(page.getByText('Aucun module trouvé')).toBeVisible();
  });

  test('Can open module details drawer', async ({ page }) => {
    const emptyState = page.getByText(/Aucun module/i);
    if (await emptyState.isVisible()) return;

    // Click on "Configurer" button of the first module
    await page.getByRole('button', { name: /Configurer/i }).first().click();
    
    // The drawer has some text related to 'Plan' or 'Modèle'
    await expect(page.getByRole('button', { name: /Fermer|Enregistrer/i }).first()).toBeVisible();
  });
});
