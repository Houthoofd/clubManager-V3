/**
 * alerts.user.test.ts
 * Tests d'intégration pour /api/alerts — alertes utilisateurs.
 *
 * Routes couvertes :
 *   GET    /api/alerts/me              — tous (ownership via JWT)
 *   POST   /api/alerts/admin           — admin (body: { user_id: number, alerte_type_id: number })
 *   PATCH  /api/alerts/admin/:id/resolve — admin
 *   PATCH  /api/alerts/admin/:id/ignore  — admin
 *   GET    /api/alerts/admin/:id/actions — admin
 *   POST   /api/alerts/admin/:id/actions — admin
 *
 * Formes de réponse :
 *   GET /me                    → { success, data: UserAlert[] }
 *   POST /admin                → 201, { success, data: { id, user_id, alerte_type_id, ... } }
 *   PATCH /admin/:id/resolve   → { success, data: UserAlert }
 *   PATCH /admin/:id/ignore    → { success, data: UserAlert }
 *   GET /admin/:id/actions     → { success, data: Action[] }
 *   POST /admin/:id/actions    → 201, { success, data: Action }
 *
 * Note: user_id dans POST /admin doit être un nombre entier (typeof === 'number').
 *       alerte_type_id doit également être un nombre entier.
 */

import request from "supertest";
import type { Express } from "express";
import createApp from "../../../src/app.js";
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  createTestAlertType,
  createTestUserAlert,
  truncateAlerts,
} from "../setup/dbHelpers.js";
import { UserRole } from "@clubmanager/types";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateAlerts();
});

// ─── GET /api/alerts/me ───────────────────────────────────────────────────────

describe("GET /api/alerts/me", () => {
  it("200 + tableau vide pour utilisateur sans alertes", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/alerts/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("200 + tableau avec alertes après création via helper", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const typeId = await createTestAlertType({ nom: "Alerte Visible" });

    await createTestUserAlert(user.id, typeId);

    const res = await request(app)
      .get("/api/alerts/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("ne retourne que les alertes de l'utilisateur connecté", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const token1 = generateAccessToken(user1, UserRole.MEMBER);
    const typeId = await createTestAlertType();

    // Alerte pour user2, pas pour user1
    await createTestUserAlert(user2.id, typeId);

    const res = await request(app)
      .get("/api/alerts/me")
      .set("Authorization", `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/alerts/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/alerts/admin — création d'alerte pour un utilisateur ──────────

describe("POST /api/alerts/admin", () => {
  it("201 + alerte créée avec id pour admin", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType({ nom: "Alerte Admin Créée" });

    const res = await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: targetUser.id, alerte_type_id: typeId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(typeof res.body.data.id).toBe("number");
  });

  it("alerte visible dans GET /me de l'utilisateur concerné", async () => {
    const { token: adminToken } = await createTestAdmin();
    const targetUser = await createTestUser();
    const targetToken = generateAccessToken(targetUser, UserRole.MEMBER);
    const typeId = await createTestAlertType({ nom: "Alerte Visible Me" });

    // Admin crée une alerte pour targetUser
    await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ user_id: targetUser.id, alerte_type_id: typeId });

    // targetUser voit l'alerte dans son GET /me
    const res = await request(app)
      .get("/api/alerts/me")
      .set("Authorization", `Bearer ${targetToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("201 + notes optionnelles enregistrées", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType();

    const res = await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: targetUser.id,
        alerte_type_id: typeId,
        notes: "Note de test",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // TODO: vérifier res.body.data.notes si le repository expose le champ
  });

  it("400 si user_id manquant", async () => {
    const { token } = await createTestAdmin();
    const typeId = await createTestAlertType();

    const res = await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({ alerte_type_id: typeId });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400 si alerte_type_id manquant", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();

    const res = await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: targetUser.id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const typeId = await createTestAlertType();

    const res = await request(app)
      .post("/api/alerts/admin")
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user.id, alerte_type_id: typeId });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/alerts/admin/:id/resolve ─────────────────────────────────────

describe("PATCH /api/alerts/admin/:id/resolve", () => {
  it("200 + data de l'alerte résolue", async () => {
    const { user: admin, token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType({ nom: "Alerte À Résoudre" });
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    const res = await request(app)
      .patch(`/api/alerts/admin/${alertId}/resolve`)
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "Problème résolu" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", alertId);
    // TODO: vérifier res.body.data.statut === 'resolu' si le repository expose le champ
  });

  it("404 pour un id inexistant", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch("/api/alerts/admin/999999/resolve")
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const typeId = await createTestAlertType();
    const alertId = await createTestUserAlert(user.id, typeId);

    const res = await request(app)
      .patch(`/api/alerts/admin/${alertId}/resolve`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/alerts/admin/:id/ignore ──────────────────────────────────────

describe("PATCH /api/alerts/admin/:id/ignore", () => {
  it("200 + data de l'alerte ignorée", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType({ nom: "Alerte À Ignorer" });
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    const res = await request(app)
      .patch(`/api/alerts/admin/${alertId}/ignore`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", alertId);
    // TODO: vérifier res.body.data.statut === 'ignore' si le repository expose le champ
  });

  it("404 pour un id inexistant", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch("/api/alerts/admin/999999/ignore")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/alerts/admin/:id/actions ───────────────────────────────────────

describe("GET /api/alerts/admin/:id/actions", () => {
  it("200 + tableau d'actions (vide si aucune action)", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType();
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    const res = await request(app)
      .get(`/api/alerts/admin/${alertId}/actions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── POST /api/alerts/admin/:id/actions ──────────────────────────────────────

describe("POST /api/alerts/admin/:id/actions", () => {
  it("201 + action ajoutée à l'alerte", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType();
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    const res = await request(app)
      .post(`/api/alerts/admin/${alertId}/actions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action_type: "autre", description: "Prise en charge" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
  });

  it("400 si action_type manquant", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType();
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    const res = await request(app)
      .post(`/api/alerts/admin/${alertId}/actions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "Sans action_type" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("l'action ajoutée apparaît dans GET /actions", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser();
    const typeId = await createTestAlertType();
    const alertId = await createTestUserAlert(targetUser.id, typeId);

    await request(app)
      .post(`/api/alerts/admin/${alertId}/actions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ action_type: "autre", description: "Action visible" });

    const actionsRes = await request(app)
      .get(`/api/alerts/admin/${alertId}/actions`)
      .set("Authorization", `Bearer ${token}`);

    expect(actionsRes.status).toBe(200);
    expect(actionsRes.body.data.length).toBeGreaterThan(0);
  });
});
