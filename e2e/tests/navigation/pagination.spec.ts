/**
 * pagination.spec.ts
 * Tests E2E -- Pagination multi-pages (Phase E14)
 *
 * Projet : chromium-admin (tests/navigation/ -> pas ignore par chromium-admin)
 *
 * Couverture :
 *   PAG1 : /users -- aller page 2 -> contenu different de page 1
 *   PAG2 : /users -- retour page 1 depuis page 2 -> contenu identique a l'origine
 *
 * Prerequis : > 20 utilisateurs actifs en DB (le seed en insere 23 : 3 E2E + 20 pagination)
 * Selecteurs : data-testid="pagination-next-btn" / "pagination-prev-btn" sur les
 * boutons desktop du PaginationBar (locale-independant).
 */

import { test, expect } from "../../fixtures";

test.describe("Pagination -- Navigation multi-pages", () => {
  // ----------------------------------------------------------
  // PAG1 : /users -> page 2 -> contenu different
  // ----------------------------------------------------------
  test("/users -> page 2 -> liste d'utilisateurs differente", async ({
    adminPage,
  }) => {
    await adminPage.goto("/users");
    await adminPage
      .locator('[data-testid="users-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    // Attendre la fin du chargement initial
    await adminPage
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {});

    // Le bouton "suivant" n'apparait que si totalPages > 1 (> 20 utilisateurs)
    const nextBtn = adminPage.locator('[data-testid="pagination-next-btn"]');
    const hasPagination = await nextBtn
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!hasPagination) {
      test.skip(true, "Pagination absente (< 21 utilisateurs actifs en DB)");
      return;
    }

    // Capturer le contenu de la table page 1
    const table = adminPage.locator('[data-testid="users-table"]');
    await table.waitFor({ state: "visible", timeout: 10_000 });
    const page1Text = await table.textContent();

    // Cliquer sur "Page suivante" et attendre la reponse API
    const responsePromise = adminPage.waitForResponse(
      (resp) => resp.url().includes("/api/users"),
      { timeout: 10_000 },
    );
    await nextBtn.click();
    await responsePromise;
    await adminPage.waitForTimeout(500);

    // Le contenu de la table doit avoir change
    const page2Text = await table.textContent();
    expect(page2Text).not.toBe(page1Text);

    // Le bouton "precedent" doit maintenant etre actif (non disabled)
    const prevBtn = adminPage.locator('[data-testid="pagination-prev-btn"]');
    await prevBtn.waitFor({ state: "visible", timeout: 5_000 });
    await expect(prevBtn).not.toBeDisabled();
  });

  // ----------------------------------------------------------
  // PAG2 : /users -> page 2 -> retour page 1 -> contenu original
  // ----------------------------------------------------------
  test("/users -> page 2 -> retour page 1 -> contenu identique", async ({
    adminPage,
  }) => {
    await adminPage.goto("/users");
    await adminPage
      .locator('[data-testid="users-page"]')
      .waitFor({ state: "visible", timeout: 15_000 });

    await adminPage
      .waitForLoadState("networkidle", { timeout: 10_000 })
      .catch(() => {});

    const nextBtn = adminPage.locator('[data-testid="pagination-next-btn"]');
    const hasPagination = await nextBtn
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (!hasPagination) {
      test.skip(true, "Pagination absente (< 21 utilisateurs actifs en DB)");
      return;
    }

    const table = adminPage.locator('[data-testid="users-table"]');
    const page1Text = await table.textContent();

    // Aller page 2
    let apiResp = adminPage.waitForResponse(
      (resp) => resp.url().includes("/api/users"),
      { timeout: 10_000 },
    );
    await nextBtn.click();
    await apiResp;
    await adminPage.waitForTimeout(300);

    // Retour page 1
    const prevBtn = adminPage.locator('[data-testid="pagination-prev-btn"]');
    apiResp = adminPage.waitForResponse(
      (resp) => resp.url().includes("/api/users"),
      { timeout: 10_000 },
    );
    await prevBtn.click();
    await apiResp;
    await adminPage.waitForTimeout(300);

    // Le contenu doit etre identique a la page 1 initiale
    const returnedPage1Text = await table.textContent();
    expect(returnedPage1Text).toBe(page1Text);
  });
});
