import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard & Clubs', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
  });

  test('Dashboard loads and KPIs are visible', async ({ page }) => {
    await expect(page.getByText('Total des Clubs')).toBeVisible();
    await expect(page.getByText('Clubs Actifs')).toBeVisible();
  });

  test('Clubs list loads, test search bar and filter', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Rechercher (nom, code)...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Test Club');
    // Verify a club row or empty state
  });

  test('Impersonate a club (Happy Path)', async ({ page }) => {
    // Wait for the clubs table to load
    await page.locator('tbody tr').first().locator('button').last().click();
    await page.route('**/api/superadmin/clubs/*/impersonate', route => { route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { token: 'mock-token', refreshToken: 'mock', user: { id: 1, role: 'admin' } } }) }); });
    const impersonateBtn = page.getByRole('button', { name: /Se connecter en tant qu\'admin/i }).first();
    await impersonateBtn.waitFor({ state: 'visible' });
    await impersonateBtn.click();

    // Verify it redirects to the club's dashboard
    await page.waitForURL('**/dashboard');

    // Verify the red impersonation banner is visible
    await expect(page.getByText(/Mode Impersonation/i)).toBeVisible();

    // Click return button
    const returnBtn = page.getByRole('button', { name: /Revenir au Super Admin/i });
    await returnBtn.click();
    
    // Verify redirect back to superadmin
    await page.waitForURL('**/superadmin');
  });

  test('Search for a non-existent club name (Edge Case)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Rechercher (nom, code)...');
    await searchInput.fill('THIS_CLUB_DOES_NOT_EXIST_123');
    await expect(page.getByText(/Aucune organisation/i)).toBeVisible();
  });

  test('API error on impersonation (Edge Case)', async ({ page }) => {
    // Intercept impersonation API and return 500
    await page.route('**/api/superadmin/clubs/*/impersonate', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Internal Server Error' })
      });
    });

    await page.locator('tbody tr').first().locator('button').last().click();
    const impersonateBtn = page.getByRole('button', { name: /Se connecter en tant qu'admin/i }).first();
    await impersonateBtn.waitFor({ state: 'visible' });
    await impersonateBtn.click();

    // Verify error toast
    await expect(page.getByText('Internal Server Error')).toBeVisible();
    // App should not crash
    await expect(page.getByText('Total des Clubs')).toBeVisible();
  });
});






