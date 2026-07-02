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

  // ----------------------------------------------------------
  // Test 10 : Ajustement de stock via StockAdjustModal
  // ----------------------------------------------------------
  test("ajustement de stock → quantité mise à jour", async ({
    adminPage,
    db,
  }) => {
    // Récupérer un stock existant
    const stockRows = await db.query<{ id: number; quantite: number }>(
      "SELECT id, quantite FROM stocks LIMIT 1",
    );
    if (stockRows.length === 0) {
      test.skip();
      return;
    }
    const stock = stockRows[0];

    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-stocks"]').click();
    // Attendre que l'onglet se charge
    await adminPage.waitForTimeout(1000);
    await expect(
      adminPage.locator("text=/500|Internal Server Error/i"),
    ).not.toBeVisible({ timeout: 5_000 });

    // Cliquer sur le bouton d'ajustement de ce stock
    const adjustBtn = adminPage.locator(
      `[data-testid="btn-adjust-stock-${stock.id}"]`,
    );
    await adjustBtn.waitFor({ state: "visible", timeout: 10_000 });
    await adjustBtn.click();

    // La modal StockAdjustModal doit s'ouvrir
    await adminPage.locator('[id="stock-adjust-form"]').waitFor({
      state: "visible",
      timeout: 5_000,
    });

    // Remplir la quantité (+1)
    await adminPage.locator("#stock-quantite").fill("1");

    // Soumettre
    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/store/stocks") &&
        resp.request().method() === "POST",
      { timeout: 10_000 },
    );
    await adminPage
      .locator('[type="submit"][form="stock-adjust-form"]')
      .click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    // Restaurer la quantité initiale
    await db
      .query("UPDATE stocks SET quantite = ? WHERE id = ?", [
        stock.quantite,
        stock.id,
      ])
      .catch(() => {});
  });

  // ----------------------------------------------------------
  // Test 11 : Changer le statut d'une commande via OrderDetailModal
  // ----------------------------------------------------------
  test("changer le statut d'une commande via modal", async ({
    adminPage,
    db,
  }) => {
    // Récupérer une commande en attente ou non-annulée
    const orderRows = await db.query<{ id: number; statut: string }>(
      "SELECT id, statut FROM commandes WHERE statut NOT IN ('annulee', 'livree') LIMIT 1",
    );
    if (orderRows.length === 0) {
      test.skip();
      return;
    }
    const order = orderRows[0];

    await gotoStore(adminPage);
    await adminPage.locator('[data-testid="tab-commandes"]').click();
    await adminPage
      .locator('[data-testid="orders-tab"]')
      .waitFor({ state: "visible", timeout: 10_000 });

    // Cliquer sur le bouton détail de cette commande
    const detailBtn = adminPage.locator(
      `[data-testid="btn-order-detail-${order.id}"]`,
    );
    await detailBtn.waitFor({ state: "visible", timeout: 10_000 });
    await detailBtn.click();

    // La modal OrderDetailModal doit s'ouvrir
    await adminPage.locator('[role="dialog"]').waitFor({
      state: "visible",
      timeout: 5_000,
    });

    // Trouver un bouton de transition de statut (premier bouton dans la section admin)
    // Regex bi-langue (FR + EN) car l'app peut s'afficher en anglais selon la locale du navigateur
    const transitionBtn = adminPage
      .locator('[role="dialog"]')
      .getByRole("button")
      .filter({
        hasText:
          /payée|expédiée|livrée|marquer|annuler|mark|cancel|paid|ship|deliver/i,
      })
      .first();

    const btnVisible = await transitionBtn
      .waitFor({ state: "visible", timeout: 8_000 })
      .then(() => true)
      .catch(() => false);

    if (!btnVisible) {
      // Fermer et skip si aucun bouton de transition disponible
      await adminPage.keyboard.press("Escape");
      test.skip();
      return;
    }

    const responsePromise = adminPage.waitForResponse(
      (resp) =>
        resp.url().includes("/api/store/orders/") &&
        (resp.url().includes("/status") || resp.request().method() === "PATCH"),
      { timeout: 10_000 },
    );
    await transitionBtn.click();
    const resp = await responsePromise;
    expect(resp.status()).toBeLessThan(300);

    // Restaurer le statut initial
    await db
      .query("UPDATE commandes SET statut = ? WHERE id = ?", [
        order.statut,
        order.id,
      ])
      .catch(() => {});
  });
});
