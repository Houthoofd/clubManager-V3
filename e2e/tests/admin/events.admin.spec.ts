import { test, expect } from '@playwright/test';

test.describe('Events Admin Flow', () => {
  test('Admin can create an event with a banner image', async ({ page }) => {
    // Admin login
    await page.goto('/login');
    // ... logic ...

    // Go to event creation
    await page.goto('/admin/events/create');

    // Fill basic info
    await page.locator('input[name="titre"]').fill('Tournoi annuel');
    await page.locator('input[name="date_event"]').fill('2026-10-15');
    await page.locator('input[name="capacite"]').fill('100');
    await page.locator('input[name="prix"]').fill('15');
    
    // Upload event banner
    const dummyBanner = Buffer.from('fake image content');
    await page.locator('input[type="file"][name="banniere"]').setInputFiles({
      name: 'banner.png',
      mimeType: 'image/png',
      buffer: dummyBanner,
    });

    // Submit form
    await page.locator('button:has-text("Créer l\'événement")').click();

    // Verify success and redirection
    await expect(page.locator('text=Événement créé avec succès')).toBeVisible();

    // Verify member view displays the banner (mocked scenario)
    await page.goto('/events');
    await expect(page.locator('text=Tournoi annuel')).toBeVisible();
    await expect(page.locator('img[alt="Bannière Tournoi annuel"]')).toBeVisible();
  });
});
