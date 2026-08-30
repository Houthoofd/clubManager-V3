import { test, expect } from '@playwright/test';

test.describe('QuickPay Flow', () => {
  test('Store item QuickPay flow filters items and completes payment', async ({ page }) => {
    // Navigate to quickpay page for a store item
    // Assuming /quickpay is the route, with proper query params
    // The exact token depends on authentication, we'll mock or simulate it
    await page.goto('/public/quick-pay?type=boutique&id=13&token=MOCK_TOKEN');

    // Wait for the page to load
    await expect(page.locator('text=Paiement Rapide')).toBeVisible();

    // Verify only the selected article is displayed in the list
    const items = page.locator('[data-testid^="quickpay-item-"]');
    await expect(items).toHaveCount(1);
    
    // Simulate clicking pay
    await page.locator('button:has-text("Payer maintenant")').click();

    // Verify Stripe intent is called and the success animation shows
    // (In a real test environment, we either mock the stripe API or use Stripe test cards)
    // We expect the success container or animation to be visible
    await expect(page.locator('[data-testid="payment-success-animation"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Paiement réussi')).toBeVisible();
  });

  test('Subscription (cotisation) QuickPay flow completes successfully', async ({ page }) => {
    // Navigate to quickpay page for a subscription
    await page.goto('/public/quick-pay?type=cotisation&id=35&token=MOCK_TOKEN');

    // Wait for the page to load
    await expect(page.locator('text=Paiement Rapide')).toBeVisible();

    // Verify only the selected subscription is displayed
    const items = page.locator('[data-testid^="quickpay-item-"]');
    await expect(items).toHaveCount(1);
    
    // Simulate clicking pay
    await page.locator('button:has-text("Payer maintenant")').click();

    // Verify success
    await expect(page.locator('[data-testid="payment-success-animation"]')).toBeVisible({ timeout: 10000 });
  });
});
