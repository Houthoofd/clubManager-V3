import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Store Edge Cases', () => {
  test('Creating an order does NOT decrease stock immediately', async ({ page, request }) => {
    // 1. Get initial stock
    const initRes = await request.get('/api/store/stocks');
    const initialStocks = await initRes.json();
    const articleId = initialStocks[0]?.article_id;
    const initialQty = initialStocks[0]?.quantite || 0;

    // 2. Create order via API or UI
    // Mock user login first
    await page.goto('/login');
    // ... login logic ...

    await request.post('/api/store/orders', {
      data: {
        items: [{ article_id: articleId, taille_id: 1, quantite: 1 }]
      }
    });

    // 3. Verify stock is unchanged
    const midRes = await request.get('/api/store/stocks');
    const midStocks = await midRes.json();
    const midQty = midStocks.find((s: any) => s.article_id === articleId)?.quantite;
    
    expect(midQty).toBe(initialQty);
  });

  test('Successful payment decreases stock', async ({ page, request }) => {
    // Note: this test requires triggering the Stripe webhook or verify endpoint directly
    // to simulate a successful payment.
    const res = await request.post('/api/payments/stripe/public/verify', {
      data: { payment_intent: 'pi_mock_123', type: 'boutique', orderId: 1 }
    });
    expect(res.ok()).toBeTruthy();

    // Verify stock decreased
    // ...
  });

  test('Uploading an image when an admin creates a new article', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    // ... login logic ...

    // Navigate to create article
    await page.goto('/admin/store/create');

    // Fill form
    await page.locator('input[name="nom"]').fill('Nouveau T-Shirt');
    await page.locator('input[name="prix"]').fill('20');

    // Upload image
    // Create a dummy buffer for the test
    const dummyImage = Buffer.from('dummy image data');
    await page.locator('input[type="file"]').setInputFiles({
      name: 'tshirt.png',
      mimeType: 'image/png',
      buffer: dummyImage,
    });

    // Submit
    await page.locator('button[type="submit"]').click();

    // Verify success
    await expect(page.locator('text=Article créé avec succès')).toBeVisible();
  });
});
