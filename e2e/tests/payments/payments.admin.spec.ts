/**
 * payments.admin.spec.ts
 * Tests E2E — Module Paiements (vue admin) (/payments)
 * Phase E6
 *
 * data-testid utilisés :
 *   payments-page, tab-payments, tab-schedules, tab-plans
 *   payments-tab, btn-record-payment, payments-table
 *   schedules-tab
 *   plans-tab, btn-create-plan, plan-card-{id}
 *   btn-edit-plan-{id}, btn-delete-plan-{id}, btn-confirm-delete-plan-{id}
 *   plan-form-modal, input-plan-name, input-plan-price, input-plan-duration
 *   btn-submit-plan-form, btn-cancel-plan-form
 */

import { test, expect } from '../../fixtures';

async function gotoPayments(page: import('@playwright/test').Page) {
  await page.goto('/payments');
  await page.locator('[data-testid="payments-page"]').waitFor({ state: 'visible', timeout: 15_000 });
}

test.describe('Paiements — Flux admin', () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /payments → page visible
  // ----------------------------------------------------------
  test('charger /payments → page visible (admin)', async ({ adminPage }) => {
    await gotoPayments(adminPage);
    await expect(adminPage.locator('[data-testid="payments-page"]')).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Paiements → table ou état vide visible
  // ----------------------------------------------------------
  test('onglet Paiements → table ou état vide visible', async ({ adminPage }) => {
    await gotoPayments(adminPage);
    await adminPage.locator('[data-testid="tab-payments"]').click();

    await adminPage.locator('[data-testid="payments-tab"]').waitFor({ state: 'visible', timeout: 10_000 });

    const table = adminPage.locator('[data-testid="payments-table"]');
    const empty = adminPage.locator('.text-center').filter({ hasText: /aucun|no payment/i });
    await expect(table.or(empty)).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 3 : Onglet Plans tarifaires → liste ou état vide visible
  // ----------------------------------------------------------
  test('onglet Plans tarifaires → liste visible', async ({ adminPage }) => {
    await gotoPayments(adminPage);
    await adminPage.locator('[data-testid="tab-plans"]').click();
    await expect(
      adminPage.locator('[data-testid="plans-tab"]'),
    ).toBeVisible({ timeout: 10_000 });
  });

  // ----------------------------------------------------------
  // Test 4 : Créer un plan tarifaire → plan visible dans la liste
  // ----------------------------------------------------------
  test('créer un plan tarifaire → plan visible dans la liste', async ({ adminPage, db }) => {
    const uniqueName = `Plan E2E ${Date.now()}`;

    await gotoPayments(adminPage);
    await adminPage.locator('[data-testid="tab-plans"]').click();
    await adminPage.locator('[data-testid="plans-tab"]').waitFor({ state: 'visible', timeout: 10_000 });

    await adminPage.locator('[data-testid="btn-create-plan"]').click();
    await adminPage.locator('[data-testid="plan-form-modal"]').waitFor({ state: 'visible', timeout: 10_000 });

    await adminPage.locator('[data-testid="input-plan-name"]').fill(uniqueName);
    await adminPage.locator('[data-testid="input-plan-price"]').fill('49.99');
    await adminPage.locator('[data-testid="input-plan-duration"]').fill('12');

    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes('/api/payments/plans') && resp.request().method() === 'POST',
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="btn-submit-plan-form"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    try {
      await expect(
        adminPage.locator('[data-testid="plans-tab"]').getByText(uniqueName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query('DELETE FROM plans_tarifaires WHERE nom = ?', [uniqueName])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Modifier un plan tarifaire → modifications persistées
  // ----------------------------------------------------------
  test('modifier un plan tarifaire → modifications persistées', async ({ adminPage, db }) => {
    const id = await db.insertOne('plans_tarifaires', {
      nom: `Plan Edit ${Date.now()}`,
      prix: 25.0,
      duree_mois: 1,
      actif: 1,
    });

    try {
      const updatedName = `Plan Modifié ${Date.now()}`;

      await gotoPayments(adminPage);
      await adminPage.locator('[data-testid="tab-plans"]').click();
      await adminPage.locator(`[data-testid="plan-card-${id}"]`).waitFor({ state: 'visible', timeout: 10_000 });

      await adminPage.locator(`[data-testid="btn-edit-plan-${id}"]`).click();
      await adminPage.locator('[data-testid="plan-form-modal"]').waitFor({ state: 'visible', timeout: 10_000 });

      const nameInput = adminPage.locator('[data-testid="input-plan-name"]');
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/payments/plans') && resp.request().method() === 'PUT',
        { timeout: 10_000 },
      );
      await adminPage.locator('[data-testid="btn-submit-plan-form"]').click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator('[data-testid="plans-tab"]').getByText(updatedName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query('DELETE FROM plans_tarifaires WHERE id = ?', [id]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 6 : Supprimer un plan tarifaire → plan absent
  // ----------------------------------------------------------
  test('supprimer un plan tarifaire → plan absent', async ({ adminPage, db }) => {
    const id = await db.insertOne('plans_tarifaires', {
      nom: `Plan Delete ${Date.now()}`,
      prix: 10.0,
      duree_mois: 1,
      actif: 1,
    });

    try {
      await gotoPayments(adminPage);
      await adminPage.locator('[data-testid="tab-plans"]').click();
      await adminPage.locator(`[data-testid="plan-card-${id}"]`).waitFor({ state: 'visible', timeout: 10_000 });

      // Première étape : clic sur icône supprimer → confirmation inline
      await adminPage.locator(`[data-testid="btn-delete-plan-${id}"]`).click();

      // Deuxième étape : confirmer la suppression
      const responsePromise = adminPage.waitForResponse(
        (resp) => resp.url().includes('/api/payments/plans') && resp.request().method() === 'DELETE',
        { timeout: 10_000 },
      );
      await adminPage.locator(`[data-testid="btn-confirm-delete-plan-${id}"]`).click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator(`[data-testid="plan-card-${id}"]`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query('DELETE FROM plans_tarifaires WHERE id = ?', [id]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 7 : Onglet Échéances → liste ou état vide visible
  // ----------------------------------------------------------
  test('onglet Échéances → liste ou état vide visible', async ({ adminPage }) => {
    await gotoPayments(adminPage);
    await adminPage.locator('[data-testid="tab-schedules"]').click();
    await expect(
      adminPage.locator('[data-testid="schedules-tab"]'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
