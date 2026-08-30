import { test, expect } from '@playwright/test';

test.describe('Store Checkout and Admin Fulfillment Flow', () => {
  // Use sequential mode if they share the same browser context, or separate contexts
  test.describe.configure({ mode: 'serial' });

  let orderId: string;

  test('Member browses store, adds item to cart, and checks out', async ({ browser }) => {
    // Crée un contexte isolé pour le membre
    const memberContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const memberPage = await memberContext.newPage();

    // 1. Connexion en tant que membre
    await memberPage.goto('/login');
    await memberPage.fill('[data-testid="login-userid-input"]', 'e2e_member@test.local');
    await memberPage.fill('[data-testid="login-password-input"]', 'Member@E2E2024!');
    await memberPage.click('[data-testid="login-submit-btn"]');
    await memberPage.waitForURL('/dashboard');

    // 2. Navigation vers la boutique
    await memberPage.goto('/store');
    
    // 3. Ajouter un article au panier
    // On cherche un bouton "Ajouter au panier" ou similaire
    const firstItemAddToCart = memberPage.locator('button:has-text("Ajouter au panier")').first();
    await firstItemAddToCart.click();

    // 4. Ouvrir le panier
    await memberPage.click('[data-testid="cart-button"]');

    // 5. Valider la commande
    await memberPage.click('button:has-text("Valider la commande")');
    // Simulation du paiement ou validation gratuite
    await memberPage.click('button:has-text("Confirmer le paiement")');

    // 6. Vérifier le message de succès
    await expect(memberPage.locator('text="Commande confirmée"')).toBeVisible();

    // 7. Extraire l'ID de commande si affiché pour l'utiliser côté Admin
    // On suppose que l'URL redirige vers /store/orders/:id ou qu'il y a un message avec l'ID
    // orderId = ... 

    await memberContext.close();
  });

  test('Admin logs in and fulfills the order', async ({ browser }) => {
    const adminContext = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const adminPage = await adminContext.newPage();

    // 1. Connexion en tant qu'admin
    await adminPage.goto('/login');
    await adminPage.fill('[data-testid="login-userid-input"]', 'e2e_admin@test.local');
    await adminPage.fill('[data-testid="login-password-input"]', 'Admin@E2E2024!');
    await adminPage.click('[data-testid="login-submit-btn"]');
    await adminPage.waitForURL('/dashboard');

    // 2. Aller sur le gestionnaire de commandes
    await adminPage.goto('/admin/store/orders');

    // 3. Trouver la commande la plus récente en statut "En attente" ou "Payée"
    const pendingOrderRow = adminPage.locator('tr:has-text("En attente")').first();
    await pendingOrderRow.locator('button:has-text("Gérer")').click();

    // 4. Changer le statut à "Prête" ou "Expédiée"
    await adminPage.selectOption('select[name="orderStatus"]', 'READY');
    await adminPage.click('button:has-text("Mettre à jour le statut")');

    // 5. Vérifier que la notification de succès (et donc l'email) s'est déclenchée
    await expect(adminPage.locator('text="Statut mis à jour"')).toBeVisible();

    await adminContext.close();
  });
});
