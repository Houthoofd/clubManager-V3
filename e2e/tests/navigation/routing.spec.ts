/**
 * routing.spec.ts
 * Tests E2E — Navigation & Routing (Phase E2)
 *
 * Projets Playwright : chromium-admin, chromium-member
 * Les fixtures `adminPage` / `memberPage` créent des contextes isolés avec
 * les storageStates correspondants, indépendamment du projet qui exécute le test.
 *
 * Comptes de test utilisés :
 *   Admin  : e2e_admin (U-9999-0001) — role_app: admin
 *   Membre : e2e_member (U-9999-0002) — role_app: member
 *
 * Couverture :
 *   - Chargement du dashboard (welcome-banner visible même si stats échouent)
 *   - Navigation sidebar vers /courses, /messages, /alerts
 *   - Navigation via le menu utilisateur vers /profile
 *   - Contrôle d'accès admin → /settings (autorisé)
 *   - Contrôle d'accès member → /settings et /users (RoleGuard → redirect /dashboard)
 *   - Route inconnue → page 404
 *
 * NOTE : On n'utilise PAS waitForLoadState('networkidle') car l'API
 * /api/statistics/dashboard retourne 500 (colonne SQL obsolète), ce qui
 * provoque des retries React Query indéfinis et empêche l'état "networkidle".
 * À la place, chaque test attend l'élément spécifique qu'il veut interagir.
 */

import { test, expect } from "../../fixtures";

test.describe("Navigation & Routing", () => {
  // ----------------------------------------------------------
  // Test 1 : Dashboard chargé — welcome-banner visible
  // WelcomeBanner est toujours rendu, même quand les stats échouent.
  // On attend directement la visibilité du banner sans waitForLoadState.
  // ----------------------------------------------------------
  test("dashboard chargé — welcome-banner visible", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    // Attendre que le welcome-banner apparaisse (layout + auth OK)
    await expect(
      adminPage.locator('[data-testid="welcome-banner"]'),
    ).toBeVisible({ timeout: 15_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Sidebar — navigation vers /courses
  // ----------------------------------------------------------
  test("sidebar — navigation vers /courses", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    // Attendre que le lien sidebar soit visible avant de cliquer
    const navCourses = adminPage.locator('[data-testid="nav-courses"]');
    await navCourses.waitFor({ state: "visible", timeout: 15_000 });
    await navCourses.click();

    await expect(adminPage).toHaveURL(/\/courses/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Sidebar — navigation vers /messages
  // ----------------------------------------------------------
  test("sidebar — navigation vers /messages", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    const navMessages = adminPage.locator('[data-testid="nav-messages"]');
    await navMessages.waitFor({ state: "visible", timeout: 15_000 });
    await navMessages.click();

    await expect(adminPage).toHaveURL(/\/messages/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Sidebar — navigation vers /family
  // Note : nav-alerts est filtré (module non dans ACTIVE_MODULES en DB).
  // On utilise /family dont le module 'families' est bien actif.
  // ----------------------------------------------------------
  test("sidebar — navigation vers /family", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    const navFamily = adminPage.locator('[data-testid="nav-family"]');
    await navFamily.waitFor({ state: "visible", timeout: 15_000 });
    await navFamily.click();

    await expect(adminPage).toHaveURL(/\/family/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 5 : Menu utilisateur — navigation vers /profile
  // Le lien nav-profile se trouve dans le dropdown du menu utilisateur,
  // pas dans la sidebar — il faut d'abord ouvrir le dropdown.
  // ----------------------------------------------------------
  test("user menu — navigation vers /profile", async ({ adminPage }) => {
    await adminPage.goto("/dashboard");

    // Attendre que le trigger du menu soit visible (layout chargé)
    const userMenuTrigger = adminPage.locator(
      '[data-testid="user-menu-trigger"]',
    );
    await userMenuTrigger.waitFor({ state: "visible", timeout: 15_000 });

    // Ouvrir le dropdown du menu utilisateur
    await userMenuTrigger.click();

    // Attendre que le lien de profil soit visible dans le dropdown
    await adminPage
      .locator('[data-testid="nav-profile"]')
      .waitFor({ state: "visible", timeout: 5_000 });

    // Cliquer sur le lien profil
    await adminPage.locator('[data-testid="nav-profile"]').click();

    await expect(adminPage).toHaveURL(/\/profile/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 6 : Admin peut accéder à /settings (rôle suffisant)
  // ----------------------------------------------------------
  test("admin peut accéder à /settings", async ({ adminPage }) => {
    await adminPage.goto("/settings");

    // Attendre que la page soit rendue (titre h2 dans le header du layout)
    await adminPage.waitForLoadState("load");

    // Vérifier qu'il n'y a pas eu de redirection (on est bien sur /settings)
    await expect(adminPage).toHaveURL(/\/settings/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 7 : Member n'a pas accès à /settings → RoleGuard redirige vers /dashboard
  // ----------------------------------------------------------
  test("member n'a pas accès à /settings → redirection /dashboard", async ({
    memberPage,
  }) => {
    await memberPage.goto("/settings");

    // Le RoleGuard côté client redirige — attendre que l'URL reflète le redirect
    await expect(memberPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 8 : Member n'a pas accès à /users → RoleGuard redirige vers /dashboard
  // ----------------------------------------------------------
  test("member n'a pas accès à /users → redirection /dashboard", async ({
    memberPage,
  }) => {
    await memberPage.goto("/users");

    // Le RoleGuard côté client redirige — attendre que l'URL reflète le redirect
    await expect(memberPage).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 9 : Route inconnue → page 404
  // ----------------------------------------------------------
  test("route inconnue → page 404", async ({ adminPage }) => {
    await adminPage.goto("/cette-page-nexiste-pas");
    await adminPage.waitForLoadState("load");

    // L'application doit afficher un composant 404
    const notFound = adminPage.getByText("404");
    await expect(notFound).toBeVisible({ timeout: 10_000 });
  });
});
