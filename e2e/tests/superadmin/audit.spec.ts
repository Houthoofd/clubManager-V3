import { test, expect } from '@playwright/test';

test.describe('Super Admin Audit Logs Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login manually as Super Admin
    await page.goto('/login');
    
    // Fill identifier and password
    await page.locator('input[name="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[name="password"]').fill('superadmin');
    
    // Click submit button
    await page.locator('button[type="submit"]').click();
    
    // Wait for the /superadmin URL
    await page.waitForURL('**/superadmin');
    
    // Navigate to /superadmin/audit
    await page.goto('/superadmin/audit');
  });

  test('Happy Path: Verify the audit logs list/table renders', async ({ page }) => {
    // Verify the main table or list is visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('Happy Path: Test severity filters', async ({ page }) => {
    // Select "CRITICAL" from the filter dropdown
    // Depending on the exact UI, it could be a select element or a custom combobox
    const severityDropdown = page.locator('select[name="severity"], [aria-label*="severity" i], [placeholder*="severity" i]').first();
    
    if (await severityDropdown.isVisible()) {
        const tagName = await severityDropdown.evaluate(e => e.tagName.toLowerCase());
        if (tagName === 'select') {
            await severityDropdown.selectOption({ label: 'CRITICAL' });
        } else {
            await severityDropdown.click();
            await page.getByRole('option', { name: /critical/i }).click();
        }
    }

    // Ensure table still renders
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('Happy Path: Test the search bar', async ({ page }) => {
    // Type "impersonate" into the search bar
    const searchInput = page.getByRole('textbox', { name: /search/i }).first();
    
    // Optionally wait for the network request resolving the search
    const responsePromise = page.waitForResponse(
      response => response.url().includes('audit') && response.status() === 200,
      { timeout: 5000 }
    ).catch(() => null); // Fallback in case the endpoint name is different

    await searchInput.fill('impersonate');
    await searchInput.press('Enter');
    
    await responsePromise;

    // Verify table is still visible after search
    await expect(page.locator('table').first()).toBeVisible();
  });

  test('Edge Case: Conflicting filters', async ({ page }) => {
    // Apply filters that result in no logs
    const searchInput = page.getByRole('textbox', { name: /search/i }).first();
    await searchInput.fill('NON_EXISTENT_ACTION_123');
    await searchInput.press('Enter');
    
    // Verify the empty state component is shown
    await expect(page.getByText(/no logs|no results|not found|empty/i)).toBeVisible();
  });

  test('Edge Case: Extreme pagination or 429 Error', async ({ page }) => {
    // Intercept the audit logs fetch to return 429 Too Many Requests
    // We match any API call that looks like it's fetching audit logs
    await page.route('**/api/**/audit**', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too Many Requests' })
      });
    });

    // Reload to trigger the intercepted API call
    await page.reload();

    // Verify an appropriate error toast or state is shown without crashing
    await expect(page.getByText(/too many requests|rate limit|error/i).first()).toBeVisible();
  });
});
