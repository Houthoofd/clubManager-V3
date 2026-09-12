import { test, expect } from '@playwright/test';

test.describe('Super Admin Modules Management', () => {
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

  test('Modules list renders correctly (Happy Path)', async ({ page }) => {
    // We check if either some modules are rendered, OR the empty state
    const emptyState = page.getByText(/Aucun module/i);
    const hasEmptyState = await emptyState.isVisible();
    
    if (hasEmptyState) {
       await expect(emptyState).toBeVisible();
    } else {
       // Just check that there is at least one config button or switch
       const firstSwitch = page.locator('button[role="switch"]').first();
       await expect(firstSwitch).toBeVisible();
    }
  });

  test('Toggle a module state (Happy Path)', async ({ page }) => {
    const emptyState = page.getByText(/Aucun module/i);
    if (await emptyState.isVisible()) return;

    const firstSwitch = page.locator('button[role="switch"]').first();
    const toggle = firstSwitch;
    await toggle.waitFor({ state: 'visible' });
    
    // Save current state
    const initialState = await firstSwitch.getAttribute('aria-checked');
    
    await toggle.click();

    // Verify it changed
    await expect(firstSwitch).not.toHaveAttribute('aria-checked', initialState as string);
  });
});
