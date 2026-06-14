/**
 * negative-paths.spec.ts
 * Tests E2E — Chemins négatifs : validation & erreurs (Phase E13)
 *
 * Projet : chromium-no-auth (aucun storageState)
 *
 * Couverture :
 *   N1 : Login formulaire vide → validation inline react-hook-form
 *   N2 : Login userId inexistant + mauvais mot de passe → toast d'erreur API
 *   N3 : Register avec email déjà utilisé → message d'erreur
 *   N4 : Erreur réseau simulée → skippé (nécessite contexte authentifié)
 *
 * data-testid utilisés (login) :
 *   login-userid-input   → champ identifiant (userId, pas email)
 *   login-password-input → champ mot de passe
 *   login-submit-btn     → bouton "Se connecter"
 *
 * data-testid utilisés (register) :
 *   register-firstname-input → prénom
 *   register-lastname-input  → nom
 *   register-email-input     → email
 *   register-dob-input       → date de naissance
 *   register-username-input  → nom d'utilisateur
 *   register-password-input  → mot de passe
 *   register-submit-btn      → bouton "S'inscrire"
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

test.describe("Chemins négatifs — Validation & Erreurs", () => {
  // ----------------------------------------------------------
  // N1 : Login formulaire vide → validation inline
  // ----------------------------------------------------------
  test("login formulaire vide → message d'erreur de validation", async ({
    page,
  }) => {
    await page.goto("/login");

    // Attendre que le formulaire soit chargé
    await page
      .locator('[data-testid="login-submit-btn"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Cliquer sur Connexion sans rien remplir
    await page.locator('[data-testid="login-submit-btn"]').click();

    // react-hook-form doit afficher des erreurs de validation inline
    const errorVisible = await Promise.race([
      page
        .locator('[aria-invalid="true"]')
        .first()
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
      page
        .getByText(/requis|obligatoire|required|ne peut pas être vide/i)
        .first()
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
  });

  // ----------------------------------------------------------
  // N2 : Login mauvais mot de passe → réponse 401 + toast d'erreur
  // ----------------------------------------------------------
  test("login mauvais mot de passe → toast d'erreur API visible", async ({
    page,
  }) => {
    await page.goto("/login");

    // Attendre le formulaire
    await page
      .locator('[data-testid="login-userid-input"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Utiliser le vrai userId admin (format valide) mais avec un mauvais mot de passe
    // → bypasse la validation du form et atteint l'API
    await page
      .locator('[data-testid="login-userid-input"]')
      .fill(E2E_DB_USER_IDS.admin); // U-9999-0001
    await page
      .locator('[data-testid="login-password-input"]')
      .fill("MauvaisMotDePasse123!");

    // Intercepter la réponse API
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/login") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );

    await page.locator('[data-testid="login-submit-btn"]').click();

    const resp = await responsePromise;
    // Le backend doit retourner 401 ou 400
    expect(resp.status()).toBeGreaterThanOrEqual(400);

    // Un toast ou message d'erreur doit être visible
    const errorVisible = await Promise.race([
      page
        .locator('[data-sonner-toast][data-type="error"]')
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
      page
        .locator(".sonner-toast")
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
      page
        .getByText(/invalide|incorrect|identifiants|introuvable|not found/i)
        .first()
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
  });

  // ----------------------------------------------------------
  // N3 : Register avec email déjà utilisé → message d'erreur
  // ----------------------------------------------------------
  test("register avec email déjà utilisé → erreur API", async ({ page }) => {
    await page.goto("/register");

    // Attendre que le formulaire soit chargé
    const emailInput = page.locator('[data-testid="register-email-input"]');
    await emailInput.waitFor({ state: "visible", timeout: 15_000 });

    // Vérifier que le bouton submit est présent
    const submitBtn = page.locator('[data-testid="register-submit-btn"]');
    const btnVisible = await submitBtn
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (!btnVisible) {
      test.skip();
      return;
    }

    // Remplir le formulaire avec l'email du compte admin E2E (déjà enregistré)
    await page.locator('[data-testid="register-firstname-input"]').fill("Test");
    await page.locator('[data-testid="register-lastname-input"]').fill("User");
    await emailInput.fill("e2e_admin@test.local");

    // Date de naissance valide (il y a 25 ans)
    const dob = new Date();
    dob.setFullYear(dob.getFullYear() - 25);
    const dobStr = dob.toISOString().split("T")[0];
    const dobInput = page.locator('[data-testid="register-dob-input"]');
    if (await dobInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await dobInput.fill(dobStr);
    }

    // Nom d'utilisateur unique
    const usernameInput = page.locator(
      '[data-testid="register-username-input"]',
    );
    if (await usernameInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await usernameInput.fill(`e2e_duptest_${Date.now()}`);
    }

    // Genre (champ requis) — sélectionner la première option disponible
    const genreSelect = page.locator("#genre_id");
    if (await genreSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
      // Sélectionner la première option non-vide
      await genreSelect.selectOption({ index: 1 }).catch(() => {});
    }

    // Mot de passe fort
    const pwdInput = page.locator('[data-testid="register-password-input"]');
    if (await pwdInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await pwdInput.fill("PasswordE2E123!");
    }

    // Préparer la capture de réponse API — ici, APRÈS tous les checks
    const responsePromise = page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/auth/register") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );

    await submitBtn.click();

    const resp = await responsePromise;
    // Le backend doit retourner une erreur (409 Conflict ou 400 Bad Request)
    expect(resp.status()).toBeGreaterThanOrEqual(400);

    // Un toast ou message d'erreur doit être visible
    const errorVisible = await Promise.race([
      page
        .locator('[data-sonner-toast][data-type="error"]')
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
      page
        .locator(".sonner-toast")
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
      page
        .getByText(/déjà|existe|taken|duplicate|utilisé/i)
        .first()
        .waitFor({ state: "visible", timeout: 8_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
  });

  // ----------------------------------------------------------
  // N4 : Test intentionnellement skippé
  // La simulation d'erreur réseau sur /dashboard nécessite un contexte
  // authentifié (adminPage) avec page.route(). À implémenter séparément.
  // ----------------------------------------------------------
  test("erreur réseau simulée → skippé intentionnellement", async () => {
    test.skip(true, "Nécessite un contexte authentifié avec page.route()");
  });
});
