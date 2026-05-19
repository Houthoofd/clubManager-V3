/**
 * reservations.test.ts
 * Tests d'intégration pour le module réservations — /api/reservations
 *
 * Routes couvertes :
 *   GET    /api/reservations              — tous (membre voit uniquement les siennes)
 *   GET    /api/reservations/my           — toujours ses propres réservations
 *   GET    /api/reservations/course/:id   — admin + professor
 *   POST   /api/reservations              — tous — body: { cours_id, user_id? }
 *   PATCH  /api/reservations/:id/cancel   — tous (membre : seulement les siennes)
 *
 * Comportement contrôleur :
 *   - createReservation : erreur "déjà" → 409
 *   - cancelReservation : erreur "Accès" → 403 si membre tente d'annuler celle d'un autre
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
  createTestCourseSession,
  createTestReservation,
  truncateCourses,
  truncateReservations,
} from "../setup/dbHelpers.js";
import { UserRole } from "@clubmanager/types";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateReservations();
  await truncateCourses();
});

// ─── GET /api/reservations — liste ───────────────────────────────────────────

describe("GET /api/reservations — liste des réservations", () => {
  it("200 + tableau pour un membre authentifié", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // data = { reservations: [], pagination: {} }
    expect(Array.isArray(res.body.data.reservations)).toBe(true);
  });

  it("200 + membre voit uniquement ses propres réservations", async () => {
    // Crée deux membres : A (possède une réservation) et B (teste la liste)
    const userA = await createTestUser();
    const userB = await createTestUser();
    const tokenB = generateAccessToken(userB, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    await createTestReservation(userA.id, sessionId, "confirmee");

    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // userB n'a aucune réservation → tableau vide
    expect(res.body.data.reservations).toHaveLength(0);
  });

  it("200 + admin voit toutes les réservations", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    await createTestReservation(user.id, sessionId, "confirmee");

    const res = await request(app)
      .get("/api/reservations")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reservations.length).toBeGreaterThanOrEqual(1);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/reservations");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/reservations/my — mes réservations ─────────────────────────────

describe("GET /api/reservations/my — mes propres réservations", () => {
  it("200 + tableau pour un membre", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/reservations/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.reservations)).toBe(true);
  });

  it("200 + ne retourne que les réservations de l'utilisateur connecte", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);
    await createTestReservation(user.id, sessionId, "confirmee");

    // Autre membre avec ses propres réservations
    const otherUser = await createTestUser();
    const session2 = await createTestCourseSession(null);
    await createTestReservation(otherUser.id, session2, "confirmee");

    const res = await request(app)
      .get("/api/reservations/my")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Toutes les réservations retournées appartiennent à user
    const userIds = (
      res.body.data.reservations as Array<{ user_id: number }>
    ).map((r) => r.user_id);
    userIds.forEach((id) => expect(id).toBe(user.id));
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/reservations/my");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/reservations — créer une réservation ──────────────────────────

describe("POST /api/reservations — créer une réservation", () => {
  it("201 + réservation créée pour soi-même (membre)", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ cours_id: sessionId });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("201 + admin peut réserver pour un autre utilisateur (user_id dans le body)", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ cours_id: sessionId, user_id: user.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("400 — cours_id manquant", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("403 — membre tente de réserver pour un autre user", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const otherUser = await createTestUser();
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${token}`)
      .send({ cours_id: sessionId, user_id: otherUser.id });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .post("/api/reservations")
      .send({ cours_id: sessionId });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/reservations/:id/cancel — annuler ────────────────────────────

describe("PATCH /api/reservations/:id/cancel — annuler une réservation", () => {
  it("200 — membre annule sa propre réservation", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);
    const reservationId = await createTestReservation(
      user.id,
      sessionId,
      "confirmee",
    );

    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/annul/i);
  });

  it("200 — admin annule la reservation d'un autre utilisateur", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    const reservationId = await createTestReservation(
      user.id,
      sessionId,
      "confirmee",
    );

    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("403 — membre tente d'annuler la reservation d'un autre utilisateur", async () => {
    const userA = await createTestUser();
    const userB = await createTestUser();
    const tokenB = generateAccessToken(userB, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);
    // La réservation appartient à userA
    const reservationId = await createTestReservation(
      userA.id,
      sessionId,
      "confirmee",
    );

    const res = await request(app)
      .patch(`/api/reservations/${reservationId}/cancel`)
      .set("Authorization", `Bearer ${tokenB}`);

    // cancelReservationUC lance "Accès refusé" → 403
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    const reservationId = await createTestReservation(
      user.id,
      sessionId,
      "confirmee",
    );

    const res = await request(app).patch(
      `/api/reservations/${reservationId}/cancel`,
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/reservations/course/:coursId — admin + professor ───────────────

describe("GET /api/reservations/course/:coursId — reservations d'un cours", () => {
  it("200 + tableau pour un admin (par cours)", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    await createTestReservation(user.id, sessionId, "confirmee");

    const res = await request(app)
      .get(`/api/reservations/course/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.reservations)).toBe(true);
    expect(res.body.data.reservations.length).toBeGreaterThanOrEqual(1);
  });

  it("200 + tableau pour un professeur", async () => {
    const { token } = await createTestProfessor();
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .get(`/api/reservations/course/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .get(`/api/reservations/course/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
