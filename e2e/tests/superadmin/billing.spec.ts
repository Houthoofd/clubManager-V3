import { test, expect } from '@playwright/test';

test.describe('Super Admin Billing / SaaS Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Fill credentials
    const identifierInput = page.locator('input[id="identifier"], input[type="email"], input[id="identifier"]').first();
    await identifierInput.fill('superadmin@clubmanager.com');
    
    const passwordInput = page.locator('input[id="password"], input[type="password"]').first();
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

  test('Happy Path: Verify the billing tabs (Plans, Factures) exist and are clickable', async ({ page }) => {
    const plansTab = page.getByRole('button', { name: 'Plans' }).first();
    const facturesTab = page.getByRole('button', { name: 'Factures' }).first();
    
    await expect(plansTab).toBeVisible();
    await expect(facturesTab).toBeVisible();
    
    await facturesTab.click();
    // Depending on the UI, the factures list/table should be visible
    await expect(facturesTab).toBeVisible();
    
    await plansTab.click();
    await expect(plansTab).toBeVisible();
  });

  test('Edge Case: Empty state for plans', async ({ page }) => {
    // Assuming DB is freshly seeded or empty, we can just assert that "Aucun plan tarifaire" appears.
    // If the DB has plans, this test will fail, which is okay for this run since we know DB is fresh.
    const plansTab = page.getByRole('button', { name: 'Plans' }).first();
    await plansTab.click();
    
    const emptyStateIndicator = page.getByText(/Aucun plan tarifaire/i).first();
    await expect(emptyStateIndicator).toBeVisible();
  });
});
