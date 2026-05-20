/**
 * auth.fixture.ts
 * Fixtures Playwright fournissant des pages pré-authentifiées pour chaque rôle.
 *
 * Usage dans un test :
 *   import { test, expect } from '@e2e/fixtures';
 *
 *   test('admin voit le dashboard', async ({ adminPage }) => {
 *     await adminPage.goto('/dashboard');
 *     ...
 *   });
 */

import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';

// ============================================================
// Types
// ============================================================
export type AuthFixtures = {
  /** Page pré-authentifiée en tant qu'admin (role_app: admin) */
  adminPage: Page;
  /** Page pré-authentifiée en tant que membre (role_app: member) */
  memberPage: Page;
  /** Page pré-authentifiée en tant que professeur (role_app: professor) */
  professorPage: Page;
};

// ============================================================
// Extension du test Playwright avec les fixtures auth
// ============================================================
export const test = base.extend<AuthFixtures>({
  // ----------------------------------------------------------
  // adminPage — contexte isolé avec storageState admin
  // ----------------------------------------------------------
  adminPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: STORAGE_STATE.admin,
    });
    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ----------------------------------------------------------
  // memberPage — contexte isolé avec storageState member
  // ----------------------------------------------------------
  memberPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: STORAGE_STATE.member,
    });
    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ----------------------------------------------------------
  // professorPage — contexte isolé avec storageState professor
  // ----------------------------------------------------------
  professorPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: STORAGE_STATE.professor,
    });
    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
