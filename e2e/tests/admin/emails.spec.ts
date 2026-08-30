import { test, expect } from '@playwright/test';

test.describe('Emails Admin Flow', () => {
  test('Admin can send a templated email and Resend is mocked', async ({ page }) => {
    // Intercept network requests to Resend API endpoint or backend email endpoint
    // To prevent sending real emails, we mock the backend route that calls Resend
    await page.route('**/api/emails/send', async route => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      // Verify the payload contains the expected template and recipient
      expect(postData).toHaveProperty('to');
      expect(postData).toHaveProperty('templateId');
      
      // Fulfill with a mocked success response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Email envoyé via Resend (Mock)' })
      });
    });

    // Admin login
    await page.goto('/login');
    // ... logic ...

    // Navigate to email sending interface
    await page.goto('/admin/emails/templates');
    
    // Select a template
    await page.locator('select[name="template"]').selectOption('welcome_email');
    
    // Select recipient
    await page.locator('input[name="recipient"]').fill('test-user@example.com');
    
    // Send email
    await page.locator('button:has-text("Envoyer l\'email")').click();

    // Verify success message appears (which comes from our mock)
    await expect(page.locator('text=Email envoyé')).toBeVisible();
  });
});
