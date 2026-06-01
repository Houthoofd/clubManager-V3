/**
 * confirm-email-change.spec.ts
 * Tests E2E — Confirmation du changement d'email (/confirm-email-change)
 * Phase E9
 *
 * Stratégie token : insertion directe en DB via db.insertToken
 *
 * data-testid utilisés :
 *   confirm-email-change-page
 *   confirm-email-change-success, new-email-display, btn-back-profile
 *   confirm-email-change-error
 */

import { test, expect } from '../../fixtures';
import { E2E_DB_USER_IDS } from '../../setup/e2e-credentials';

test.describe('Confirm Email Change — /confirm-email-change', () => {
  // ----------------------------------------------------------
  // Test 1 : Token invalide → état erreur affiché
  // ----------------------------------------------------------
  test('token invalide → état erreur + bouton retour profil visible', async ({ page }) => {
    await page.goto('/confirm-email-change?token=invalid-token-xyz');

    await page.locator('[data-testid="confirm-email-change-page"]').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(
      page.locator('[data-testid="confirm-email-change-error"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator('[data-testid="btn-back-profile"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Token valide → état succès + nouvelle adresse email affichée
  // ----------------------------------------------------------
  test('token valide → état succès + nouvelle adresse affichée', async ({ page, db }) => {
    const plainToken = `email-change-e2e-${Date.now()}`;
    const newEmail = `new-email-e2e-${Date.now()}@test.local`;

    const [memberRow] = await db.query<{ id: number }>(
      'SELECT id FROM utilisateurs WHERE userId = ?',
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRow.id;

    await db.insertToken({
      type: 'email-change',
      userId: memberDbId,
      token: plainToken,
      email: newEmail,
      expiresInMinutes: 60,
    });

    try {
      await page.goto(`/confirm-email-change?token=${plainToken}`);
      await page.locator('[data-testid="confirm-email-change-page"]').waitFor({ state: 'visible', timeout: 15_000 });

      await expect(
        page.locator('[data-testid="confirm-email-change-success"]'),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.locator('[data-testid="new-email-display"]'),
      ).toContainText(newEmail, { timeout: 5_000 });
      await expect(
        page.locator('[data-testid="btn-back-profile"]'),
      ).toBeVisible();
    } finally {
      // Remettre l'ancien email du membre (il a été changé par le backend)
      await db
        .query('UPDATE utilisateurs SET email = ? WHERE id = ?', ['e2e_member@test.local', memberDbId])
        .catch(() => {});
    }
  });
});
