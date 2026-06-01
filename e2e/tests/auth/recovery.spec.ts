/**
 * recovery.spec.ts
 * Tests E2E — Demande de récupération de compte (/recovery-request)
 * Phase E9
 *
 * data-testid utilisés :
 *   recovery-request-page, input-recovery-email, textarea-recovery-reason
 *   btn-submit-recovery, recovery-success
 */

import { test, expect } from '../../fixtures';

test.describe('Recovery Request — /recovery-request', () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /recovery-request → formulaire visible
  // ----------------------------------------------------------
  test('charger /recovery-request → formulaire visible', async ({ page }) => {
    await page.goto('/recovery-request');
    await expect(
      page.locator('[data-testid="recovery-request-page"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator('[data-testid="input-recovery-email"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="textarea-recovery-reason"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Raison trop courte → validation inline
  // ----------------------------------------------------------
  test('raison < 10 caractères → erreur validation inline', async ({ page }) => {
    await page.goto('/recovery-request');
    await page.locator('[data-testid="recovery-request-page"]').waitFor({ state: 'visible', timeout: 10_000 });

    await page.locator('[data-testid="input-recovery-email"]').fill('test@example.com');
    await page.locator('[data-testid="textarea-recovery-reason"]').fill('court');
    // Déclenche la validation en sortant du champ (onBlur)
    await page.locator('[data-testid="textarea-recovery-reason"]').blur();

    // L'erreur de validation doit apparaître
    await expect(page.locator('text=/10 caract/i')).toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Soumission valide → message de confirmation
  // ----------------------------------------------------------
  test('soumission valide → état de confirmation affiché', async ({ page }) => {
    await page.goto('/recovery-request');
    await page.locator('[data-testid="recovery-request-page"]').waitFor({ state: 'visible', timeout: 10_000 });

    await page.locator('[data-testid="input-recovery-email"]').fill('e2e-recovery@test.local');
    await page.locator('[data-testid="textarea-recovery-reason"]').fill('Je ne peux plus me connecter à mon compte car je ne me souviens plus de mon email.');

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/recovery') && resp.request().method() === 'POST',
      { timeout: 10_000 },
    );
    await page.locator('[data-testid="btn-submit-recovery"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    await expect(
      page.locator('[data-testid="recovery-success"]'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
