import { test, expect } from '@playwright/test';

test.describe('Payment and Subscription Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('Admin manually adds a subscription to a member', async ({ browser }) => {
    const adminContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const adminPage = await adminContext.newPage();

    // 1. Connexion Admin
    await adminPage.goto('/login');
    await adminPage.fill('[data-testid="login-userid-input"]', 'e2e_admin@test.local');
    await adminPage.fill('[data-testid="login-password-input"]', 'Admin@E2E2024!');
    await adminPage.click('[data-testid="login-submit-btn"]');

    // 2. Aller dans la gestion des utilisateurs / finances
    await adminPage.goto('/admin/users');
    
    // 3. Sélectionner un utilisateur
    await adminPage.click('tr:has-text("e2e_member@test.local") >> button:has-text("Gérer")');

    // 4. Ajouter un paiement manuel ou un abonnement
    await adminPage.click('button:has-text("Ajouter un paiement")');
    await adminPage.fill('input[name="amount"]', '100');
    await adminPage.fill('input[name="description"]', 'Cotisation Annuelle E2E');
    await adminPage.click('button:has-text("Valider le paiement")');

    await expect(adminPage.locator('text="Paiement enregistré"')).toBeVisible();

    await adminContext.close();
  });

  test('Member logs in and sees their new payment', async ({ browser }) => {
    const memberContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const memberPage = await memberContext.newPage();

    // 1. Connexion Membre
    await memberPage.goto('/login');
    await memberPage.fill('[data-testid="login-userid-input"]', 'e2e_member@test.local');
    await memberPage.fill('[data-testid="login-password-input"]', 'Member@E2E2024!');
    await memberPage.click('[data-testid="login-submit-btn"]');

    // 2. Aller dans la section Mes Paiements
    await memberPage.goto('/payments');

    // 3. Vérifier que la "Cotisation Annuelle E2E" apparaît
    await expect(memberPage.locator('text="Cotisation Annuelle E2E"')).toBeVisible();
    await expect(memberPage.locator('text="100"')).toBeVisible();

    await memberContext.close();
  });
});
