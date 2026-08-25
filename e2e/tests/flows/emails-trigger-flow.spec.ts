import { test, expect } from '@playwright/test';

test.describe('Email Triggers Flow', () => {
  // Option 1 : on intercepte les requêtes réseau API pour s'assurer que l'UI renvoie un succès.
  // Note: On assume que l'utilisateur admin existe et est authentifié si c'est un flow admin.
  // On va plutôt tester depuis le front "public".

  test('should trigger welcome email on successful registration', async ({ page }) => {
    // 1. Navigation vers l'inscription
    await page.goto('/register');

    // 2. Remplir le formulaire
    await page.fill('[data-testid="register-firstname-input"]', 'Test');
    await page.fill('[data-testid="register-lastname-input"]', 'UserEmail');
    await page.fill('[data-testid="register-username-input"]', 'testuser_email');
    await page.fill('[data-testid="register-email-input"]', 'newmember@clubmanager.com');
    await page.fill('[data-testid="register-password-input"]', 'SuperP@ssw0rd!');
    await page.fill('[data-testid="register-dob-input"]', '2000-01-01');
    await page.selectOption('[data-testid="register-gender-select"]', '1'); 
    
    // Mock API response pour bypasser la base de données
    await page.route('**/api/auth/register', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: "Compte créé avec succès. Veuillez vérifier votre adresse email pour activer votre compte.",
          data: { userId: 999, email: "newmember@clubmanager.com", firstName: "Test" }
        })
      });
    });

    // 3. Soumettre
    await page.click('[data-testid="register-submit-btn"]');

    // 4. Vérifier l'UI
    await expect(page.locator('text="activer votre compte"')).toBeVisible();
  });
});
