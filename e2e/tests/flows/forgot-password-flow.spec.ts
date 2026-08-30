import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  test('should display success message when submitting valid email', async ({ page }) => {
    // 1. Aller sur la page de connexion
    await page.goto('/login');

    // 2. Cliquer sur Mot de passe oublié (soit via le lien direct ou en cherchant le texte)
    // On utilise un sélécteur robuste
    await page.click('[data-testid="login-forgot-password-link"]');

    // 3. Vérifier qu'on est sur la page forgot-password
    await expect(page).toHaveURL(/.*\/forgot-password/);

    // 4. Remplir le champ email
    await page.fill('[data-testid="forgot-password-email-input"]', 'test-user@clubmanager.com');

    // 5. Intercepter la requête API
    await page.route('**/api/auth/password/forgot', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: "Email envoyé" })
      });
    });

    // 6. Soumettre le formulaire
    await page.click('[data-testid="forgot-password-submit-btn"]');

    // 7. Vérifier que le message de succès apparaît
    await expect(page.locator('[data-testid="forgot-password-success"]')).toBeVisible();
  });

  test('should show error when accessing reset-password without token', async ({ page }) => {
    // Essayer d'aller directement sur la page de réinitialisation sans token
    await page.goto('/reset-password');
    
    // Devrait afficher une erreur ou rediriger vers /login
    // En se basant sur auth.json, il devrait y avoir une erreur "Lien invalide" ou "Aucun token"
    await expect(page.locator('text="Lien invalide"').or(page.locator('text="Aucun token"'))).toBeVisible();
  });
});
