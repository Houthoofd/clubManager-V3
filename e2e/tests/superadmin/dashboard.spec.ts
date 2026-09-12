import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard & Clubs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[name="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[name="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
  });

  test('Dashboard loads and KPIs are visible', async ({ page }) => {
    await expect(page.getByText('Total Clubs')).toBeVisible();
    await expect(page.getByText('MRR')).toBeVisible();
  });

  test('Clubs list loads, test search bar and filter', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Rechercher un club...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Test Club');
    // Verify a club row or empty state
  });

  test('Impersonate a club (Happy Path)', async ({ page }) => {
    // Wait for the clubs table to load
    const impersonateBtn = page.getByRole('button', { name: /Accéder au club/i }).first();
    await impersonateBtn.waitFor({ state: 'visible' });
    await impersonateBtn.click();

    // Verify it redirects to the club's dashboard
    await page.waitForURL('**/dashboard');

    // Verify the red impersonation banner is visible
    await expect(page.getByText(/Vous agissez en tant que/i)).toBeVisible();

    // Click return button
    const returnBtn = page.getByRole('button', { name: /Retourner à l'administration/i });
    await returnBtn.click();
    
    // Verify redirect back to superadmin
    await page.waitForURL('**/superadmin');
  });

  test('Search for a non-existent club name (Edge Case)', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Rechercher un club...');
    await searchInput.fill('THIS_CLUB_DOES_NOT_EXIST_123');
    await expect(page.getByText(/Aucun club trouvé/i)).toBeVisible();
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

    const impersonateBtn = page.getByRole('button', { name: /Accéder au club/i }).first();
    await impersonateBtn.waitFor({ state: 'visible' });
    await impersonateBtn.click();

    // Verify error toast
    await expect(page.getByText('Internal Server Error')).toBeVisible();
    // App should not crash
    await expect(page.getByText('Total Clubs')).toBeVisible();
  });
});
