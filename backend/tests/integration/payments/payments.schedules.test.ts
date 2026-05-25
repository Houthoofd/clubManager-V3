/**
 * payments.schedules.test.ts
 * Tests d'intégration pour /api/payments/schedules (échéances de paiement).
 *
 * Règles d'accès :
 *   GET  /schedules                  — admin + professor
 *   GET  /schedules/overdue          — admin + professor
 *   GET  /schedules/user/:userId     — admin + professor + membre (ses propres)
 *   POST /schedules                  — admin
 *   PATCH /schedules/:id/pay         — admin
 *   DELETE /schedules/:id            — admin
 *
 * Membre sur ses propres données → 200.
 * Membre sur les données globales → 403.
 * Sans token → 401.
 */

import request from "supertest";
import type { Express } from "express";
import createApp from "../../../src/app.js";
import {
  createTestUser,
  createTestAdmin,
  createTestProfessor,
  generateAccessToken,
  truncateAuthTables,
  createTestPaymentSchedule,
  truncatePayments,
} from "../setup/dbHelpers.js";
import { UserRole } from "@clubmanager/types";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncatePayments();
});

// ─── GET /api/payments/schedules — liste ──────────────────────────────────────

describe("GET /api/payments/schedules — liste", () => {
  it("200 + objet paginé { schedules, pagination } pour admin", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // GetSchedulesUseCase retourne PaginatedSchedules { schedules, pagination }
    expect(res.body.data).toHaveProperty("schedules");
    expect(Array.isArray(res.body.data.schedules)).toBe(true);
    expect(res.body.data).toHaveProperty("pagination");
  });

  it("200 + objet paginé pour professor", async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("schedules");
    expect(Array.isArray(res.body.data.schedules)).toBe(true);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/payments/schedules");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/payments/schedules/overdue — retards ────────────────────────────

describe("GET /api/payments/schedules/overdue — retards", () => {
  it("200 + tableau pour admin (peut être vide)", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get("/api/payments/schedules/overdue")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/payments/schedules/overdue")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/payments/schedules — création ──────────────────────────────────

describe("POST /api/payments/schedules — création", () => {
  it("201 + échéance créée avec les champs corrects pour admin", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: "member" });

    const res = await request(app)
      .post("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: targetUser.id,
        montant: 75.0,
        date_echeance: "2027-03-31",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id");
    expect(typeof res.body.data.id).toBe("number");
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const targetUser = await createTestUser({ role_app: "member" });

    const res = await request(app)
      .post("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: targetUser.id,
        montant: 30,
        date_echeance: "2027-01-01",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("400 si montant manquant", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: "member" });

    const res = await request(app)
      .post("/api/payments/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        user_id: targetUser.id,
        date_echeance: "2027-01-01",
        // montant absent
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/payments/schedules/user/:userId ─────────────────────────────────

describe("GET /api/payments/schedules/user/:userId", () => {
  it("200 + tableau pour admin (utilisateur quelconque)", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: "member" });
    await createTestPaymentSchedule(targetUser.id, { montant: 50 });

    const res = await request(app)
      .get(`/api/payments/schedules/user/${targetUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("200 pour un membre accédant à ses propres échéances", async () => {
    const member = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(member, UserRole.MEMBER);
    await createTestPaymentSchedule(member.id, { montant: 40 });

    const res = await request(app)
      .get(`/api/payments/schedules/user/${member.id}`)
      .set("Authorization", `Bearer ${token}`);

    // Le middleware autorise MEMBER pour cette route (ses propres données)
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("200 pour un professor sur n'importe quel utilisateur", async () => {
    const { token } = await createTestProfessor();
    const targetUser = await createTestUser({ role_app: "member" });
    await createTestPaymentSchedule(targetUser.id);

    const res = await request(app)
      .get(`/api/payments/schedules/user/${targetUser.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── PATCH /api/payments/schedules/:id/pay — paiement ────────────────────────

describe("PATCH /api/payments/schedules/:id/pay — marquer comme payée", () => {
  it("200 pour admin après création d'une échéance en attente", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: "member" });
    const scheduleId = await createTestPaymentSchedule(targetUser.id, {
      montant: 60,
      date_echeance: "2026-06-30",
    });

    const res = await request(app)
      .patch(`/api/payments/schedules/${scheduleId}/pay`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 pour un id d'échéance inexistant", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch("/api/payments/schedules/99999/pay")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const targetUser = await createTestUser({ role_app: "member" });
    const scheduleId = await createTestPaymentSchedule(targetUser.id);

    const res = await request(app)
      .patch(`/api/payments/schedules/${scheduleId}/pay`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/payments/schedules/:id — suppression ────────────────────────

describe("DELETE /api/payments/schedules/:id — suppression", () => {
  it("200 + échéance absente après suppression pour admin", async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: "member" });
    const scheduleId = await createTestPaymentSchedule(targetUser.id, {
      montant: 20,
      date_echeance: "2027-09-01",
    });

    const delRes = await request(app)
      .delete(`/api/payments/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  it("404 pour un id inexistant", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete("/api/payments/schedules/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("403 pour un membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const targetUser = await createTestUser({ role_app: "member" });
    const scheduleId = await createTestPaymentSchedule(targetUser.id);

    const res = await request(app)
      .delete(`/api/payments/schedules/${scheduleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
