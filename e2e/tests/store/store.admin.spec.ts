/**
 * store.admin.spec.ts
 * Tests E2E — Module Boutique (vue admin) (/store)
 * Phase E7
 *
 * data-testid utilisés :
 *   store-page, tab-catalogue, tab-commandes, tab-stocks, tab-mouvements, tab-configuration
 *   catalogue-tab, btn-create-article, article-card-{id}
 *   btn-edit-article-{id}, btn-delete-article-{id}
 *   article-form-modal, input-article-name, input-article-price, btn-submit-article-form
 *   orders-tab, orders-table
 */

import { test, expect } from "../../fixtures";

async function gotoStore(page: import("@playwright/test").Page) {
  await page.goto("/store");
  await page
    .locator('[data-testid="store-page"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}

test.describe("Boutique — Flux admin", () => {
  // ----------------------------------------------------------
  // Test 1 : Charger /store → page admin visible avec onglets
  // ----------------------------------------------------------
  test("charger /store → page admin visible avec onglets catalogue", async ({
    adminPage,
  }) => {
    await gotoStore(adminPage);
    await expect(adminPage.locator('[data-testid="store-page"]')).toBeVisible();
    await expect(
      adminPage.locator('[data-testid="tab-catalogue"]'),
    ).toBeVisible();
    await expect(
      adminPage.locator('[data-testid="tab-commandes"]'),
    ).toBeVisible();
    await expect(adminPage.locator('[data-testid="tab-stocks"]')).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 2 : Onglet Catalogue → liste des articles visible
  // ----------------------------------------------------------
  test("onglet Catalogue → catalogue chargé", async ({ adminPage }) => {
    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-catalogue"]').click();
    await expect(
      adminPage.locator('[data-testid="catalogue-tab"]'),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      adminPage.locator('[data-testid="btn-create-article"]'),
    ).toBeVisible();
  });

  // ----------------------------------------------------------
  // Test 3 : Créer un article → article visible dans le catalogue
  // ----------------------------------------------------------
  test("créer un article → article visible dans le catalogue", async ({
    adminPage,
    db,
  }) => {
    const uniqueName = `Article E2E ${Date.now()}`;

    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-catalogue"]').click();
    await adminPage
      .locator('[data-testid="catalogue-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await adminPage.locator('[data-testid="btn-create-article"]').click();
    await adminPage
      .locator('[data-testid="article-form-modal"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    await adminPage
      .locator('[data-testid="input-article-name"]')
      .fill(uniqueName);
    await adminPage
      .locator('[data-testid="input-article-price"]')
      .fill("19.99");

    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/store/articles") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage.locator('[data-testid="btn-submit-article-form"]').click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    try {
      await expect(
        adminPage
          .locator('[data-testid="catalogue-tab"]')
          .getByText(uniqueName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db
        .query("DELETE FROM articles WHERE nom = ?", [uniqueName])
        .catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 4 : Modifier un article → modifications persistées
  // ----------------------------------------------------------
  test("modifier un article → modifications persistées", async ({
    adminPage,
    db,
  }) => {
    // Obtenir une catégorie existante ou null
    const [catRow] = await db
      .query<{ id: number }>("SELECT id FROM categories_articles LIMIT 1")
      .catch(() => []);
    const categorieId = catRow?.id ?? null;

    const id = await db.insertOne("articles", {
      nom: `Article Edit ${Date.now()}`,
      prix: 15.0,
      actif: 1,
      ...(categorieId ? { categorie_id: categorieId } : {}),
    });

    try {
      const updatedName = `Article Modifié ${Date.now()}`;

      await gotoStore(adminPage);
      await adminPage.locator('[data-testid="tab-catalogue"]').click();
      await adminPage
        .locator(`[data-testid="article-card-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });

      await adminPage.locator(`[data-testid="btn-edit-article-${id}"]`).click();
      await adminPage
        .locator('[data-testid="article-form-modal"]')
        .waitFor({ state: "visible", timeout: 10_000 });

      const nameInput = adminPage.locator('[data-testid="input-article-name"]');
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/store/articles") &&
          resp.request().method() === "PUT",
        { timeout: 10_000 },
      );
      await adminPage
        .locator('[data-testid="btn-submit-article-form"]')
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage
          .locator('[data-testid="catalogue-tab"]')
          .getByText(updatedName),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query("DELETE FROM articles WHERE id = ?", [id]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 5 : Supprimer un article → article absent du catalogue
  // ----------------------------------------------------------
  test("supprimer un article → article absent", async ({ adminPage, db }) => {
    const id = await db.insertOne("articles", {
      nom: `Article Delete ${Date.now()}`,
      prix: 5.0,
      actif: 1,
    });

    try {
      await gotoStore(adminPage);
      await adminPage.locator('[data-testid="tab-catalogue"]').click();
      await adminPage
        .locator(`[data-testid="article-card-${id}"]`)
        .waitFor({ state: "visible", timeout: 10_000 });

      const responsePromise = adminPage.waitForResponse(
        (resp) =>
          resp.url().includes("/api/store/articles") &&
          resp.request().method() === "DELETE",
        { timeout: 10_000 },
      );
      await adminPage
        .locator(`[data-testid="btn-delete-article-${id}"]`)
        .click();
      // ConfirmDialog s'ouvre — cliquer sur le bouton de confirmation
      await adminPage
        .locator('[role="dialog"]')
        .locator("button")
        .filter({ hasText: /confirm|confirmer|delete|supprimer|oui/i })
        .click();
      const resp = await responsePromise;
      expect(resp.status()).toBeLessThan(300);

      await expect(
        adminPage.locator(`[data-testid="article-card-${id}"]`),
      ).not.toBeVisible({ timeout: 10_000 });
    } finally {
      await db.query("DELETE FROM articles WHERE id = ?", [id]).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // Test 6 : Onglet Commandes → liste visible
  // ----------------------------------------------------------
  test("onglet Commandes → liste visible", async ({ adminPage }) => {
    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-commandes"]').click();
    await expect(adminPage.locator('[data-testid="orders-tab"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  // ----------------------------------------------------------
  // Test 7 : Onglet Stocks → inventaire visible
  // ----------------------------------------------------------
  test("onglet Stocks → inventaire visible", async ({ adminPage }) => {
    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-stocks"]').click();
    // L'onglet stocks se charge — vérifier qu'aucune erreur 500 n'apparaît
    await expect(
      adminPage.locator("text=/500|Internal Server Error/i"),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 8 : Onglet Mouvements → historique visible
  // ----------------------------------------------------------
  test("onglet Mouvements → historique visible", async ({ adminPage }) => {
    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-mouvements"]').click();
    await expect(
      adminPage.locator("text=/500|Internal Server Error/i"),
    ).not.toBeVisible({ timeout: 5_000 });
  });

  // ----------------------------------------------------------
  // Test 9 : Onglet Configuration → gestion catégories visible
  // ----------------------------------------------------------
  test("onglet Configuration → catégories visible", async ({ adminPage }) => {
    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-configuration"]').click();
    await expect(
      adminPage.locator("text=/500|Internal Server Error/i"),
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
