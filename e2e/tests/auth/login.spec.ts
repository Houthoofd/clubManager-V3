/**
 * login.spec.ts
 * Tests E2E — Authentification / Login
 *
 * Projet Playwright : chromium-no-auth (pas de storageState)
 * Toutes les pages partent d'un contexte browser vierge sauf les tests
 * qui construisent manuellement un contexte authentifié (tests 6 et 7).
 *
 * Comptes de test utilisés :
 *   Admin  : U-9999-0001 / Admin@E2E2024!
 *
 * @playwright/test project: chromium-no-auth
 */

import { test, expect, type BrowserContext } from "@playwright/test";
import { STORAGE_STATE } from "../../playwright.config";
import { LoginPage } from "../../fixtures/pages/LoginPage";
import { DashboardPage } from "../../fixtures/pages/DashboardPage";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

// ============================================================
// Credentials E2E (userId au format DB = U-9999-XXXX)
// ============================================================
const ADMIN_USER_ID = E2E_DB_USER_IDS.admin; // U-9999-0001
const ADMIN_PASSWORD = "Admin@E2E2024!";

// ============================================================
// Tests
// ============================================================

test.describe("Login — Authentification", () => {
  // ----------------------------------------------------------
  // Test 1 : Affichage du formulaire
  // ----------------------------------------------------------
  test("afficher le formulaire de login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.userIdInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Login valide → redirection dashboard
  // ----------------------------------------------------------
  test("login valide → redirection vers /dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(ADMIN_USER_ID, ADMIN_PASSWORD);

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Mauvais mot de passe → toast d'erreur
  // ----------------------------------------------------------
  test("mauvais mot de passe → toast d'erreur visible", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login(ADMIN_USER_ID, "MauvaisMotDePasse!999");

    // Attendre le toast Sonner OU un élément d'erreur générique visible
    // (plusieurs implémentations possibles selon l'état du frontend)
    const errorVisible = await Promise.race([
      loginPage.errorToast
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
      page
        .locator('[role="alert"]')
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
      page
        .locator('[data-testid="login-error"]')
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
    // On reste bien sur /login
    await expect(page).toHaveURL(/\/login/);
  });

  // ----------------------------------------------------------
  // Test 4 : Champs vides → pas d'appel API (validation front-end)
  // ----------------------------------------------------------
  test("champs vides → validation front-end (pas d'appel API)", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Intercepter les appels réseau vers /api/auth/login
    let apiCalled = false;
    await page.route("**/api/auth/login", (route) => {
      apiCalled = true;
      route.continue();
    });

    // Cliquer "Connexion" sans remplir les champs
    await loginPage.submitButton.click();

    // Attendre un court délai pour s'assurer qu'aucun appel n'est parti
    await page.waitForTimeout(500);

    expect(apiCalled).toBe(false);
    // On reste sur /login
    await expect(page).toHaveURL(/\/login/);
  });

  // ----------------------------------------------------------
  // Test 5 : Accès /dashboard sans être connecté → redirect /login
  // ----------------------------------------------------------
  test("accéder à /dashboard sans être connecté → redirection vers /login", async ({
    page,
  }) => {
    // Aller directement sur /dashboard sans être authentifié
    await page.goto("/dashboard");

    // La route protégée doit rediriger vers /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 6 : Accès /login étant connecté → redirect /dashboard
  // Contexte admin créé manuellement (storageState injecté)
  // ----------------------------------------------------------
  test("accéder à /login étant connecté → redirection vers /dashboard", async ({
    browser,
  }) => {
    // Créer un contexte avec le storageState admin
    let context: BrowserContext | null = null;
    try {
      context = await browser.newContext({
        storageState: STORAGE_STATE.admin,
      });
      const page = await context.newPage();

      // Naviguer vers /login en étant déjà connecté
      await page.goto("/login");

      // Le router doit rediriger vers /dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    } finally {
      await context?.close();
    }
  });

  // ----------------------------------------------------------
  // Test 7 : Logout → retour sur /login
  // Contexte admin créé manuellement
  // ----------------------------------------------------------
  test("logout → retour sur /login", async ({ browser }) => {
    let context: BrowserContext | null = null;
    try {
      context = await browser.newContext({
        storageState: STORAGE_STATE.admin,
      });
      const page = await context.newPage();

      // Naviguer vers le dashboard
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

      // Trouver le bouton de déconnexion — plusieurs sélecteurs possibles
      // (selon l'implémentation du layout)
      const logoutBtn = page
        .locator('[data-testid="logout-btn"]')
        .or(page.getByRole("button", { name: /d[eé]connexion|logout/i }))
        .or(page.locator('[data-testid="user-menu-logout"]'))
        .first();

      // Parfois le bouton est dans un menu déroulant — essayer d'ouvrir le menu
      const userMenuTrigger = page
        .locator('[data-testid="user-menu-trigger"]')
        .or(page.locator('[data-testid="avatar-btn"]'))
        .first();

      // Tenter d'ouvrir le menu si présent
      if (
        await userMenuTrigger.isVisible({ timeout: 2_000 }).catch(() => false)
      ) {
        await userMenuTrigger.click();
        await page.waitForTimeout(300);
      }

      await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
      await logoutBtn.click();

      // Après déconnexion, on doit être redirigé vers /login
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    } finally {
      await context?.close();
    }
  });

  // ----------------------------------------------------------
  // Test 8 : Lien "Mot de passe oublié" → /forgot-password
  // ----------------------------------------------------------
  test('lien "Mot de passe oublié" → navigation vers /forgot-password', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.forgotPasswordLink.click();

    await expect(page).toHaveURL(/\/forgot-password/, { timeout: 8_000 });
  });
});
