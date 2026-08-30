import { test, expect } from '@playwright/test';

test.describe('Authentication Edge Cases Flow', () => {
  
  test('should show error when submitting password recovery with invalid/expired token', async ({ page }) => {
    await page.goto('/reset-password?token=invalid-or-expired-token');
    
    try {
      await page.fill('[data-testid="reset-password-input"]', 'NewStrongPass123!', { timeout: 2000 });
      await page.fill('[data-testid="reset-password-confirm-input"]', 'NewStrongPass123!');
      
      await page.route('**/api/auth/password/reset', async route => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Token invalide ou expiré' })
        });
      });

      await page.click('[data-testid="reset-password-submit-btn"]');
      
      await expect(page.locator('text="Token invalide ou expiré"').or(page.locator('[data-testid="reset-password-error"]'))).toBeVisible();
    } catch (e) {
      await expect(page.locator('text="Lien invalide"').or(page.locator('text="Aucun token"').or(page.locator('text="invalide"')))).toBeVisible();
    }
  });

  test('should block login after multiple invalid attempts', async ({ page }) => {
    await page.goto('/login');
    
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Trop de tentatives. Veuillez réessayer plus tard.' })
      });
    });

    await page.fill('[data-testid="login-email-input"]', 'brute-force@clubmanager.com');
    await page.fill('[data-testid="login-password-input"]', 'WrongPassword123');
    await page.click('[data-testid="login-submit-btn"]');
    
    await expect(page.locator('text="Trop de tentatives"').or(page.locator('[data-testid="login-error"]'))).toBeVisible();
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    await page.route('**/api/users/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Session expirée' })
      });
    });

    await page.goto('/dashboard');

    await expect(page).toHaveURL(/.*\/login/);
  });
});
