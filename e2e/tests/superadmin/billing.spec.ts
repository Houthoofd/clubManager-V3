import { test, expect } from '@playwright/test';

test.describe('Super Admin Billing / SaaS Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Fill credentials
    const identifierInput = page.locator('input[name="identifier"], input[type="email"], input[id="identifier"]').first();
    await identifierInput.fill('superadmin@clubmanager.com');
    
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill('superadmin');
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Se connecter")').first();
    await submitBtn.click();
    
    // Wait for superadmin URL
    await page.waitForURL('**/superadmin**');
    
    // Navigate to billing
    await page.goto('/superadmin/billing');
  });

  test('Happy Path: Verify financial metrics cards are visible (MRR, Active Subscriptions)', async ({ page }) => {
    // Assert financial metrics are visible. Using common keywords for English/French
    const mrrLocator = page.getByText(/MRR|Revenu/i).first();
    const subsLocator = page.getByText(/Active Subscriptions|Abonnements/i).first();

    await expect(mrrLocator).toBeVisible();
    await expect(subsLocator).toBeVisible();
  });

  test('Happy Path: Verify the billing tabs (Plans tarifaires, Factures) exist and are clickable', async ({ page }) => {
    const plansTab = page.getByText('Plans tarifaires').first();
    const facturesTab = page.getByText('Factures').first();
    
    await expect(plansTab).toBeVisible();
    await expect(facturesTab).toBeVisible();
    
    await facturesTab.click();
    // Depending on the UI, the factures list/table should be visible
    await expect(facturesTab).toBeVisible();
    
    await plansTab.click();
    await expect(plansTab).toBeVisible();
  });

  test('Happy Path: In the "Plans tarifaires" tab, verify that pricing plans are displayed', async ({ page }) => {
    const plansTab = page.getByText('Plans tarifaires').first();
    await plansTab.click();
    
    // Verify pricing plans are displayed (e.g., currency symbols or common plan names)
    const priceIndicator = page.getByText(/€|\$|Prix|Price/i).first();
    await expect(priceIndicator).toBeVisible();
  });

  test('Edge Case: Empty state', async ({ page }) => {
    // Intercept /api/superadmin/saas/plans or equivalent and return empty array
    await page.route('**/api/superadmin/saas/plans**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();
    
    const plansTab = page.getByText('Plans tarifaires').first();
    if (await plansTab.isVisible()) {
      await plansTab.click();
    }
    
    // Verify the empty state UI appears without crashing
    const emptyStateIndicator = page.getByText(/Aucun|Empty|No plans/i).first();
    await expect(emptyStateIndicator).toBeVisible();
    // Ensure page hasn't crashed (body is still interactive/present)
    await expect(page.locator('body')).toBeVisible();
  });

  test('Edge Case: API Error', async ({ page }) => {
    // Intercept financial metrics endpoint
    await page.route('**/api/superadmin/saas/metrics**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Verify UI shows error state or skeleton loaders, doesn't crash to white page
    // Look for error text, skeletons, or simply ensure layout is intact
    await expect(page.locator('body')).toBeVisible();
    
    // Header/Navigation should still be visible if the page didn't crash entirely
    const headerOrNav = page.locator('header, nav, aside').first();
    await expect(headerOrNav).toBeVisible();
  });
});
