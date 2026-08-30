import { test, expect } from '@playwright/test';

test.describe('Payments Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the user is logged in and on the payments page
    // Replace with actual setup logic
    await page.goto('/payments');
  });

  test('should refund a payment', async ({ page }) => {
    // Navigate to a payment record that can be refunded
    await page.click('text=Recent Transactions');
    
    // Select a specific transaction (mocked or seeded data)
    await page.locator('.transaction-item').first().click();
    
    // Click refund button
    await page.click('button:has-text("Refund")');
    
    // Confirm refund
    await page.click('button:has-text("Confirm Refund")');
    
    // Expect success message
    await expect(page.locator('.toast-success')).toHaveText(/Refund successful/i);
    
    // Verify status changed to refunded
    await expect(page.locator('.transaction-status')).toHaveText(/Refunded/i);
  });

  test('should access invoices', async ({ page }) => {
    // Navigate to invoices section
    await page.click('text=Invoices');
    
    // Verify invoices list is visible
    await expect(page.locator('.invoice-list')).toBeVisible();
    
    // Click on the first invoice to view details or download
    await page.locator('.invoice-item').first().click();
    
    // Verify invoice details are visible
    await expect(page.locator('.invoice-details')).toBeVisible();
    
    // Optionally test the download button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('should handle Stripe payment failure', async ({ page }) => {
    // Mock the Stripe payment endpoint to return a failure response
    await page.route('**/api/payments/charge', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Your card was declined.' } }),
      });
    });

    // Initiate a payment
    await page.click('button:has-text("Pay Now")');
    
    // Fill in mock card details (if required by UI flow)
    // await page.fill('#card-number', '4000 0000 0000 0002'); // Example of a declining card
    
    // Submit payment
    await page.click('button:has-text("Submit Payment")');
    
    // Expect error message to be displayed to the user
    await expect(page.locator('.payment-error-message')).toHaveText(/Your card was declined/i);
  });

  test('should not allow paying for a subscription twice', async ({ page }) => {
    // Go to subscriptions
    await page.goto('/subscriptions');
    
    // Select an already active subscription
    await page.locator('.subscription-item.active').first().click();
    
    // Ensure the pay button is disabled or not present
    const payButton = page.locator('button:has-text("Pay Now")');
    
    if (await payButton.isVisible()) {
      await expect(payButton).toBeDisabled();
    } else {
      // Or verify that some message indicates it's already paid
      await expect(page.locator('.subscription-status-message')).toHaveText(/Already paid/i);
    }
  });
});
