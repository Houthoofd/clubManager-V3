/**
 * profile.spec.ts
 * Tests E2E — Profil utilisateur / Page de profil (Phase E2)
 *
 * Projet Playwright : chromium-member uniquement
 * (chromium-admin exclut ce fichier pour éviter une data race sur le user partagé)
 *
 * La fixture `memberPage` crée un contexte isolé avec le storageState member.
 *
 * Compte de test utilisé :
 *   Membre : e2e_member (U-9999-0002) — role_app: member, first_name: 'E2E'
 *
 * Couverture :
 *   - Chargement de la page /profile (inputs visibles)
 *   - Pré-remplissage du champ prénom (valeur non vide)
 *   - Annulation d'une modification (retour à la valeur originale)
 *   - Validation inline — prénom vide → erreur affichée
 *   - Sauvegarde d'une modification → toast de succès + restauration de la valeur
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Stratégie de chargement
 * ──────────────────────────────────────────────────────────────────────────
 * On utilise `waitForResponse` (profil API) plutôt que `waitForLoadState('networkidle')`.
 * Raison : `networkidle` peut se déclencher dans la fenêtre de 500 ms qui sépare
 * la fin des assets statiques du premier fetch React Query — avant même que
 * la requête GET /profile soit lancée, la page semble "idle" alors qu'elle est
 * encore en skeleton. `waitForResponse` attend le signal réseau exact dont on a besoin.
 */

import { test, expect } from "../../fixtures";

/** Helper : attend que le backend renvoie les données du profil pour une page donnée. */
async function waitForProfileData(page: import("@playwright/test").Page) {
  await page.waitForResponse(
    (r) => /\/api\/users\/\d+\/profile/.test(r.url()) && r.status() === 200,
    { timeout: 15_000 },
  );
}

test.describe("Profile — Page de profil", () => {
  // ----------------------------------------------------------
  // Test 1 : La page de profil se charge correctement
  // ----------------------------------------------------------
  test("la page de profil se charge correctement", async ({ memberPage }) => {
    const profileResp = waitForProfileData(memberPage);
    await memberPage.goto("/profile");
    await profileResp;

    await expect(
      memberPage.locator('[data-testid="profile-firstname-input"]'),
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      memberPage.locator('[data-testid="profile-save-btn"]'),
    ).toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 2 : Le champ prénom est pré-rempli (valeur non vide)
  // ----------------------------------------------------------
  test("le champ prénom est pré-rempli", async ({ memberPage }) => {
    const profileResp = waitForProfileData(memberPage);
    await memberPage.goto("/profile");
    await profileResp;

    const firstNameInput = memberPage.locator(
      '[data-testid="profile-firstname-input"]',
    );
    await expect(firstNameInput).toBeVisible({ timeout: 5_000 });

    const value = await firstNameInput.inputValue();
    expect(value).not.toBe("");
  });

  // ----------------------------------------------------------
  // Test 3 : Annuler une modification — le champ revient à la valeur originale
  // ----------------------------------------------------------
  test("annuler une modification — le champ revient à la valeur originale", async ({
    memberPage,
  }) => {
    const profileResp = waitForProfileData(memberPage);
    await memberPage.goto("/profile");
    await profileResp;

    const firstNameInput = memberPage.locator(
      '[data-testid="profile-firstname-input"]',
    );
    await expect(firstNameInput).toBeVisible({ timeout: 5_000 });

    const originalValue = await firstNameInput.inputValue();

    await firstNameInput.clear();
    await firstNameInput.fill("NouveauPrenom");

    await memberPage.locator('[data-testid="profile-cancel-btn"]').click();

    await expect(firstNameInput).toHaveValue(originalValue, { timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Validation — prénom vide → erreur inline visible
  // ----------------------------------------------------------
  test("validation — prénom vide → erreur inline", async ({ memberPage }) => {
    const profileResp = waitForProfileData(memberPage);
    await memberPage.goto("/profile");
    await profileResp;

    const firstNameInput = memberPage.locator(
      '[data-testid="profile-firstname-input"]',
    );
    await expect(firstNameInput).toBeVisible({ timeout: 5_000 });

    await firstNameInput.click({ clickCount: 3 });
    await firstNameInput.press("Backspace");

    await memberPage.locator('[data-testid="profile-save-btn"]').click();

    const errorVisible = await Promise.race([
      memberPage
        .locator('[aria-invalid="true"]')
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
      memberPage
        .getByText(/requis|obligatoire|required/i)
        .waitFor({ state: "visible", timeout: 5_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(errorVisible).toBe(true);
  });

  // ----------------------------------------------------------
  // Test 5 : Modifier le prénom et sauvegarder → toast de succès
  // La valeur originale est restaurée à la fin pour garder la DB propre.
  // ----------------------------------------------------------
  test("modifier le prénom et sauvegarder → toast de succès", async ({
    memberPage,
  }) => {
    const profileResp = waitForProfileData(memberPage);
    await memberPage.goto("/profile");
    await profileResp;

    const firstNameInput = memberPage.locator(
      '[data-testid="profile-firstname-input"]',
    );
    await expect(firstNameInput).toBeVisible({ timeout: 5_000 });

    const originalValue = await firstNameInput.inputValue();

    await firstNameInput.click({ clickCount: 3 });
    await firstNameInput.fill("E2E-Test");

    await memberPage.locator('[data-testid="profile-save-btn"]').click();

    const successVisible = await Promise.race([
      memberPage
        .locator('[data-sonner-toast][data-type="success"]')
        .waitFor({ state: "visible", timeout: 10_000 })
        .then(() => true),
      memberPage
        .locator('[role="status"]')
        .waitFor({ state: "visible", timeout: 10_000 })
        .then(() => true),
    ]).catch(() => false);

    expect(successVisible).toBe(true);

    // --- Restauration ---
    await expect(firstNameInput).toBeVisible({ timeout: 5_000 });
    await firstNameInput.click({ clickCount: 3 });
    await firstNameInput.fill(originalValue);

    const restoreResp = memberPage.waitForResponse(
      (r) =>
        r.url().includes("/api/users/") &&
        r.url().includes("/profile") &&
        r.request().method() === "PATCH",
      { timeout: 10_000 },
    );
    await memberPage.locator('[data-testid="profile-save-btn"]').click();
    await restoreResp;
  });
});
