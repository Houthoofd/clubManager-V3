import { test, expect } from "../../fixtures";

test.describe("Boutique — Cas limites et sécurité", () => {
  // Nettoyage avant chaque test
  test.beforeEach(async ({ db }) => {
    await db.query("DELETE FROM stocks WHERE quantite >= 0").catch(() => {});
    await db.query("DELETE FROM tailles WHERE nom = 'Unique'").catch(() => {});
    await db.query("DELETE FROM articles WHERE nom LIKE 'Article Edge%'").catch(() => {});
  });

  // Nettoyage après tous les tests
  test.afterAll(async ({ db }) => {
    await db.query("DELETE FROM stocks WHERE quantite >= 0").catch(() => {});
    await db.query("DELETE FROM tailles WHERE nom = 'Unique'").catch(() => {});
    await db.query("DELETE FROM articles WHERE nom LIKE 'Article Edge%'").catch(() => {});
  });

  test("Sécurité : le backend rejette une commande dont le prix a été manipulé", async ({ memberPage, db }) => {
    // 1. Préparation des données
    const sizeId = await db.insertOne("tailles", { nom: "Unique" });
    const articleId = await db.insertOne("articles", {
      nom: `Article Edge Price ${Date.now()}`,
      prix: 50.00,
      actif: 1,
    });
    await db.insertOne("stocks", {
      article_id: articleId,
      taille_id: sizeId,
      quantite: 10,
    });

    // 2. Interception de la requête de création de commande pour modifier le prix
    await memberPage.route("**/api/store/orders", async (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        const payload = JSON.parse(request.postData() || "{}");
        // Modification frauduleuse du prix
        if (payload.items && payload.items.length > 0) {
          payload.items[0].prix = 1.00;
        }
        await route.continue({ postData: JSON.stringify(payload) });
      } else {
        await route.continue();
      }
    });

    // 3. Navigation et ajout au panier (ou commande rapide)
    await memberPage.goto("/store");
    await memberPage.locator('[data-testid="tab-boutique"]').click();
    
    // Attendre l'article
    const articleCard = memberPage.locator(`[data-testid="article-boutique-${articleId}"]`);
    await articleCard.waitFor({ state: "visible", timeout: 10000 });

    // Clic sur "Commander"
    await memberPage.locator(`[data-testid="btn-order-${articleId}"]`).click();

    // Sélection de la taille
    await memberPage.locator('select#order-taille').selectOption(sizeId.toString());
    
    // On garde la quantité à 1. Le prix affiché est 50.00.
    
    // On s'attend à ce que l'API réponde avec une erreur (400 ou 500) à cause de la validation du prix.
    const [response] = await Promise.all([
      memberPage.waitForResponse("**/api/store/orders"),
      memberPage.locator('button[type="submit"][form="quick-order-form"]').click()
    ]);

    expect(response.status()).not.toBe(201); // Ne doit pas être un succès
    expect(response.status()).toBeGreaterThanOrEqual(400); // Doit être une erreur (400 ou 500)
  });

  test("Stock : ne peut pas acheter un article avec un stock de 0 via l'API", async ({ memberPage, db }) => {
    // 1. Préparation des données (stock = 0)
    const sizeId = await db.insertOne("tailles", { nom: "Unique" });
    const articleId = await db.insertOne("articles", {
      nom: `Article Edge Stock Zero ${Date.now()}`,
      prix: 20.00,
      actif: 1,
    });
    await db.insertOne("stocks", {
      article_id: articleId,
      taille_id: sizeId,
      quantite: 0, // Stock épuisé
    });

    // Au lieu de passer par l'UI qui bloque le bouton, on appelle directement l'API avec le contexte de page.
    const response = await memberPage.request.post('/api/store/orders', {
      data: {
        items: [
          {
            article_id: articleId,
            taille_id: sizeId,
            quantite: 1,
            prix: 20.00
          }
        ]
      }
    });

    // Doit rejeter la demande car pas de stock
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("Panier : impossible de passer commande avec un panier vide via l'API", async ({ memberPage }) => {
    // Appel direct à l'API pour tenter une commande sans articles
    const response = await memberPage.request.post('/api/store/orders', {
      data: {
        items: []
      }
    });

    // Le backend doit valider qu'il y a au moins un article
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });
});
