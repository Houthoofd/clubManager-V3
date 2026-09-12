import { test, expect } from '@playwright/test';

test.describe('Super Admin Dashboard Modals', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[id="identifier"]').fill('superadmin@clubmanager.com');
    await page.locator('input[id="password"]').fill('superadmin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/superadmin');
  });

  test('Can open Edit Club Modal', async ({ page }) => {
    // Click the kebab menu of the first club
    await page.locator('tbody tr').first().locator('button').last().click();
    
    // Click Modifier
    const editBtn = page.getByRole('button', { name: /Modifier/i }).first();
    await editBtn.waitFor({ state: 'visible' });
    await editBtn.click();

    // Verify Modal appears
    await expect(page.getByRole('heading', { name: 'Modifier le club' })).toBeVisible();
  });

  test('Can open Invite Club Modal', async ({ page }) => {
    // Click Inviter un club button
    const inviteBtn = page.getByRole('button', { name: /Inviter un club/i }).first();
    await inviteBtn.click();

    // Verify Modal appears
    await expect(page.getByRole('heading', { name: 'Inviter un Club' })).toBeVisible();
  });

  test('Can open Delete Club Modal', async ({ page }) => {
    // Click the kebab menu of the first club
    await page.locator('tbody tr').first().locator('button').last().click();
    
    // Click Supprimer
    const deleteBtn = page.getByRole('button', { name: /Supprimer/i }).first();
    await deleteBtn.waitFor({ state: 'visible' });
    await deleteBtn.click();

    // Verify Modal appears
    await expect(page.getByRole('heading', { name: /Supprimer le club/i })).toBeVisible();
  });
});
