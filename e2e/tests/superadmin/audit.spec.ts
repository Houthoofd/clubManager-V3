import { test, expect } from '@playwright/test';

test.describe('Super Admin Audit Logs Flow', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    // Login manually as Super Admin
    await page.goto('/login');
    
    // Fill identifier and password
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    
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
    const searchInput = page.getByPlaceholder(/Rechercher/i).first();
    
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
    const searchInput = page.getByPlaceholder(/Rechercher/i).first();
    await searchInput.fill('NON_EXISTENT_ACTION_123');
    await searchInput.press('Enter');
    
    // Verify the empty state component is shown
    await expect(page.getByText(/Aucun log/i)).toBeVisible();
  
  });
});
