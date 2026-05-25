/**
 * store.orders.test.ts
 * Tests d'intégration pour /api/store/orders.
 *
 * Règles d'accès :
 *   GET  /orders/my        — tous authentifiés
 *   GET  /orders           — admin + professor
 *   GET  /orders/:id       — admin + professor
 *   POST /orders           — tous authentifiés
 *   POST /orders/:id/cancel — propriétaire ou admin
 *
 * Pour POST /orders, on a besoin d'un article + taille + stock.
 * La création de ces données est faite directement en SQL via getTestPool()
 * car il n'existe pas de route publique pour créer un stock initial.
 */

import request from "supertest";
import type { Express } from "express";
import type { ResultSetHeader } from "mysql2/promise";
import createApp from "../../../src/app.js";
import {
  createTestUser,
  createTestAdmin,
  createTestProfessor,
  generateAccessToken,
  truncateAuthTables,
  getTestPool,
  truncateStore,
} from "../setup/dbHelpers.js";
import { UserRole } from "@clubmanager/types";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateStore();
});

// ─── Helpers locaux pour setup article + taille + stock ──────────────────────

/**
 * Crée une taille de test directement en DB. Retourne l'id.
 */
async function insertTestSize(nom = "Taille Test"): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO tailles (nom, ordre) VALUES (?, 0)",
    [nom],
  );
  return result.insertId;
}

/**
 * Crée un article de test directement en DB. Retourne l'id.
 */
async function insertTestArticle(
  nom = "Article Test",
  prix = 25.0,
  categorieId: number | null = null,
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO articles (nom, prix, actif, categorie_id) VALUES (?, ?, 1, ?)",
    [nom, prix, categorieId],
  );
  return result.insertId;
}

/**
 * Crée une entrée de stock directement en DB. Retourne l'id.
 */
async function insertTestStock(
  articleId: number,
  tailleId: number,
  quantite = 10,
): Promise<number> {
  const pool = getTestPool();
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO stocks (article_id, taille_id, quantite, quantite_minimum) VALUES (?, ?, ?, 2)",
    [articleId, tailleId, quantite],
  );
  return result.insertId;
}

// ─── GET /api/store/orders/my ─────────────────────────────────────────────────

describe("GET /api/store/orders/my — mes commandes", () => {
  it("200 + tableau (vide) pour un membre authentifié", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/store/orders/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/store/orders/my");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("200 + tableau pour un admin", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get("/api/store/orders/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/store/orders ────────────────────────────────────────────────────

describe("GET /api/store/orders — liste (admin + professor)", () => {
  it("200 + tableau pour admin", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get("/api/store/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
  });

  it("200 + tableau pour professor", async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get("/api/store/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.orders)).toBe(true);
  });

  it("403 pour un membre", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/store/orders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/store/orders");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/store/orders — créer une commande ─────────────────────────────

describe("POST /api/store/orders — créer une commande", () => {
  it("201 + commande créée pour un membre avec article + taille + stock valides", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    // Setup : article, taille, stock directement en DB
    const articleId = await insertTestArticle("Kimono Adulte", 89.99);
    const tailleId = await insertTestSize("M");
    await insertTestStock(articleId, tailleId, 5);

    const res = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            article_id: articleId,
            taille_id: tailleId,
            quantite: 1,
            prix: 89.99,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
  });

  it("400 si items est un tableau vide", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    const res = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400 si items est absent", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    const res = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400 si stock insuffisant", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    // Stock de 1, on demande 10
    const articleId = await insertTestArticle("Article Stock Faible", 20);
    const tailleId = await insertTestSize("L");
    await insertTestStock(articleId, tailleId, 1);

    const res = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          {
            article_id: articleId,
            taille_id: tailleId,
            quantite: 10,
            prix: 20,
          },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const res = await request(app)
      .post("/api/store/orders")
      .send({
        items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }],
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/store/orders/:id/cancel — annuler une commande ────────────────

describe("POST /api/store/orders/:id/cancel — annuler", () => {
  it("200 + commande annulée par son propriétaire (statut en_attente)", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);

    // Setup : créer une commande valide
    const articleId = await insertTestArticle("Article Annulable", 15);
    const tailleId = await insertTestSize("S");
    await insertTestStock(articleId, tailleId, 3);

    const createRes = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          { article_id: articleId, taille_id: tailleId, quantite: 1, prix: 15 },
        ],
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id as number;

    // Annulation par le propriétaire
    const cancelRes = await request(app)
      .post(`/api/store/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.statut).toBe("annulee");
  });

  it("200 + commande annulée par un admin (commande d'un autre utilisateur)", async () => {
    const member = await createTestUser({ role_app: "member" });
    const memberToken = generateAccessToken(member, UserRole.MEMBER);
    const { token: adminToken } = await createTestAdmin();

    const articleId = await insertTestArticle("Article Admin Cancel", 50);
    const tailleId = await insertTestSize("XL");
    await insertTestStock(articleId, tailleId, 2);

    const createRes = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        items: [
          { article_id: articleId, taille_id: tailleId, quantite: 1, prix: 50 },
        ],
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id as number;

    // Annulation par un admin (pas le propriétaire)
    const cancelRes = await request(app)
      .post(`/api/store/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
  });

  it("404 pour une commande inexistante", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post("/api/store/orders/99999/cancel")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("403 si un membre tente d'annuler la commande d'un autre", async () => {
    const owner = await createTestUser({ role_app: "member" });
    const ownerToken = generateAccessToken(owner, UserRole.MEMBER);
    const intruder = await createTestUser({ role_app: "member" });
    const intToken = generateAccessToken(intruder, UserRole.MEMBER);

    const articleId = await insertTestArticle("Article 403 Cancel", 30);
    const tailleId = await insertTestSize("XXL");
    await insertTestStock(articleId, tailleId, 5);

    const createRes = await request(app)
      .post("/api/store/orders")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        items: [
          { article_id: articleId, taille_id: tailleId, quantite: 1, prix: 30 },
        ],
      });

    expect(createRes.status).toBe(201);
    const orderId = createRes.body.data.id as number;

    // L'intrus (membre différent) tente d'annuler
    const cancelRes = await request(app)
      .post(`/api/store/orders/${orderId}/cancel`)
      .set("Authorization", `Bearer ${intToken}`);

    expect(cancelRes.status).toBe(403);
    expect(cancelRes.body.success).toBe(false);
  });
});
