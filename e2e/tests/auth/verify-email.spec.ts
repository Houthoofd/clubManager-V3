/**
 * verify-email.spec.ts
 * Tests E2E — Vérification d'email (/verify-email)
 * Phase E9
 *
 * data-testid utilisés :
 *   verify-email-success, btn-login-now
 *   verify-email-error, btn-resend-email
 *   verify-email-resend-form, input-resend-email, btn-submit-resend
 */

import { test, expect } from '../../fixtures';
import { E2E_DB_USER_IDS } from '../../setup/e2e-credentials';

test.describe('Verify Email — /verify-email', () => {
  // ----------------------------------------------------------
  // Test 1 : Token valide → état succès + bouton login visible
  // ----------------------------------------------------------
  test('token valide → état succès affiché', async ({ page, db }) => {
    const plainToken = `verify-e2e-${Date.now()}`;

    const [memberRow] = await db.query<{ id: number }>(
      'SELECT id FROM utilisateurs WHERE userId = ?',
      [E2E_DB_USER_IDS.member],
    );
    const memberDbId = memberRow.id;

    await db.insertToken({
      type: 'email-verification',
      userId: memberDbId,
      token: plainToken,
      expiresInMinutes: 60,
    });

    try {
      await page.goto(`/verify-email?token=${plainToken}`);

      await expect(
        page.locator('[data-testid="verify-email-success"]'),
      ).toBeVisible({ timeout: 15_000 });
      await expect(
        page.locator('[data-testid="btn-login-now"]'),
      ).toBeVisible();
    } finally {
      await db
        .query('DELETE FROM email_validation_tokens WHERE user_id = ? AND used_at IS NULL', [memberDbId])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 2 : Token invalide → état erreur + bouton renvoyer visible
  // ----------------------------------------------------------
  test('token invalide → état erreur affiché', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-token-xyz-404');

    await expect(
      page.locator('[data-testid="verify-email-error"]'),
    ).toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator('[data-testid="btn-resend-email"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 3 : Clic "Renvoyer" → formulaire email inline visible
  // ----------------------------------------------------------
  test('clic renvoyer email → formulaire inline visible', async ({ page }) => {
    await page.goto('/verify-email?token=invalid-for-resend-test');
    await page.locator('[data-testid="verify-email-error"]').waitFor({ state: 'visible', timeout: 15_000 });

    await page.locator('[data-testid="btn-resend-email"]').click();

    await expect(
      page.locator('[data-testid="verify-email-resend-form"]'),
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.locator('[data-testid="input-resend-email"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="btn-submit-resend"]'),
    ).toBeVisible();
  });
});
