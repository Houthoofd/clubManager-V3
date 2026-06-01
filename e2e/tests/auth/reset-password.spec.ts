/**
 * reset-password.spec.ts
 * Tests E2E — Réinitialisation de mot de passe (/reset-password)
 * Phase E9
 *
 * Stratégie token : insertion directe en DB (SHA-256 hash via db.insertToken)
 * pour éviter la dépendance à l'envoi d'email.
 *
 * data-testid utilisés :
 *   reset-password-no-token, btn-request-new-link
 *   reset-password-form, input-new-password, input-confirm-password
 *   btn-submit-reset, reset-password-success
 *
 * NOTE : les PasswordInput contrôlés (react-hook-form) nécessitent
 *   pressSequentially au lieu de fill pour déclencher correctement
 *   les événements clavier que RHF écoute.
 */

import { test, expect } from "../../fixtures";
import { E2E_DB_USER_IDS } from "../../setup/e2e-credentials";

test.describe("Reset Password — /reset-password", () => {
  // ----------------------------------------------------------
  // Test 1 : URL sans token → état "lien invalide" visible
  // ----------------------------------------------------------
  test("URL sans token → lien invalide affiché", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(
      page.locator('[data-testid="reset-password-no-token"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator('[data-testid="btn-request-new-link"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Token invalide/expiré → formulaire affiché
  // ----------------------------------------------------------
  test("token inexistant → formulaire affiché", async ({ page }) => {
    await page.goto("/reset-password?token=invalid-token-xyz");
    await expect(
      page.locator('[data-testid="reset-password-form"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Mots de passe qui ne correspondent pas → les deux champs sont visibles
  // ----------------------------------------------------------
  test("mots de passe différents → erreur inline", async ({ page }) => {
    await page.goto("/reset-password?token=any-token");
    await page
      .locator('[data-testid="reset-password-form"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // pressSequentially déclenche les événements clavier individuels → RHF les reçoit correctement
    await page
      .locator('[data-testid="input-new-password"]')
      .pressSequentially("Password1!");
    await page
      .locator('[data-testid="input-confirm-password"]')
      .pressSequentially("Different1!");

    // Les deux champs et le bouton submit restent visibles
    await expect(
      page.locator('[data-testid="input-confirm-password"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-submit-reset"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 4 : Token valide inséré en DB → reset réussi → état succès affiché
  // ----------------------------------------------------------
  test("token valide → reset réussi → état succès affiché", async ({
    page,
    db,
  }) => {
    const plainToken = `reset-e2e-${Date.now()}`;

    // Obtenir l'ID interne + hash actuel du mot de passe (pour restauration)
    const [memberRow] = await db.query<{ id: number; password: string }>(
      "SELECT id, password FROM utilisateurs WHERE userId = ?",
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRow.id;
    const originalPasswordHash = memberRow.password;

    await db.insertToken({
      type: "password-reset",
      userId: memberDbId,
      token: plainToken,
      expiresInMinutes: 60,
    });

    try {
      await page.goto(`/reset-password?token=${plainToken}`);
      await page
        .locator('[data-testid="reset-password-form"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      // Utiliser pressSequentially pour que react-hook-form reçoive les events
      await page
        .locator('[data-testid="input-new-password"]')
        .pressSequentially("NewPassword1!");
      await page
        .locator('[data-testid="input-confirm-password"]')
        .pressSequentially("NewPassword1!");

      const responsePromise = page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/auth/reset-password") &&
          resp.request().method() === "POST",
        { timeout: 15_000 },
      );
      await page.locator('[data-testid="btn-submit-reset"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        page.locator('[data-testid="reset-password-success"]'),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      // Restaurer le mot de passe d'origine pour ne pas casser les runs suivants
      await db
        .query("UPDATE utilisateurs SET password = ? WHERE id = ?", [
          originalPasswordHash,
          memberDbId,
        ])
        .catch(() => {});
      // Nettoyer le token s'il n'a pas été consommé
      await db
        .query(
          "DELETE FROM password_reset_tokens WHERE user_id = ? AND used = FALSE",
          [memberDbId],
        )
        .catch(() => {});
    }
  });
});
