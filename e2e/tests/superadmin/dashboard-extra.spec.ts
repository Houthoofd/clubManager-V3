import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard Extra Features', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
  });

  test('Can open Club Details Drawer', async ({ page }) => {
    const emptyState = page.getByText(/Aucune organisation/i);
    if (await emptyState.isVisible()) return;

    await page.locator('tbody tr').first().locator('td').nth(1).click();
    await expect(page.getByText('Admins Actifs').first()).toBeVisible();
  });

  test('Can trigger Export CSV', async ({ page }) => {
    const emptyState = page.getByText(/Aucune organisation/i);
    if (await emptyState.isVisible()) return;

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export CSV/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('clubs_export_');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Bulk actions UI is visible when selecting rows', async ({ page }) => {
    const emptyState = page.getByText(/Aucune organisation/i);
    if (await emptyState.isVisible()) return;

    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first();
    await firstCheckbox.check();

    await expect(page.getByText(/club\(s\) sélectionné\(s\)/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Suspendre/i }).first()).toBeVisible();
  });
});
