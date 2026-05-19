/**
 * courses.sessions.test.ts
 * Tests d'intégration pour les sessions de cours — /api/courses/sessions
 *
 * Routes couvertes :
 *   GET    /api/courses/sessions                     — admin + professor + member
 *   POST   /api/courses/sessions                     — admin
 *   GET    /api/courses/sessions/my-enrollments      — tous (authentifié)
 *   GET    /api/courses/sessions/:id                 — admin + professor + member
 *   GET    /api/courses/sessions/:id/inscriptions    — admin + professor
 *
 * Body POST session : { date_cours, type_cours, heure_debut, heure_fin }
 *
 * NOTE : la route GET /sessions/my-enrollments est déclarée AVANT /sessions/:id
 * dans courseRoutes.ts, elle ne sera donc pas shadowed par le catch-all :id.
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
  createTestCourseRecurrent,
  createTestCourseSession,
  createTestInscription,
  truncateCourses,
} from "../setup/dbHelpers.js";
import { UserRole } from "@clubmanager/types";

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateCourses();
});

// ─── GET /api/courses/sessions — liste ───────────────────────────────────────

describe("GET /api/courses/sessions — liste des sessions", () => {
  it("200 + tableau pour un membre authentifié", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("200 + tableau contenant la session créée (admin)", async () => {
    const { token } = await createTestAdmin();
    const recurrentId = await createTestCourseRecurrent();
    await createTestCourseSession(recurrentId, { type_cours: "karate" });

    const res = await request(app)
      .get("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("200 + tableau pour un professeur", async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/courses/sessions");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/courses/sessions — création (admin) ───────────────────────────

describe("POST /api/courses/sessions — créer une session directe", () => {
  it("201 + session créée (admin)", async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date_cours: "2026-12-15",
        type_cours: "karate",
        heure_debut: "10:00",
        heure_fin: "11:00",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("201 + session liée à un cours récurrent (admin)", async () => {
    const { token } = await createTestAdmin();
    const recurrentId = await createTestCourseRecurrent({ type_cours: "judo" });

    const res = await request(app)
      .post("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cours_recurrent_id: recurrentId,
        date_cours: "2026-12-20",
        type_cours: "judo",
        heure_debut: "14:00",
        heure_fin: "15:00",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post("/api/courses/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date_cours: "2026-12-15",
        type_cours: "karate",
        heure_debut: "10:00",
        heure_fin: "11:00",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const res = await request(app)
      .post("/api/courses/sessions")
      .send({
        date_cours: "2026-12-15",
        type_cours: "karate",
        heure_debut: "10:00",
        heure_fin: "11:00",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/courses/sessions/my-enrollments ────────────────────────────────

describe("GET /api/courses/sessions/my-enrollments — mes inscriptions", () => {
  it("200 + tableau pour un membre sans inscriptions", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/courses/sessions/my-enrollments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("200 + tableau contenant les inscriptions du membre", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });
    await createTestInscription(user.id, sessionId);

    const res = await request(app)
      .get("/api/courses/sessions/my-enrollments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("401 sans token", async () => {
    const res = await request(app).get("/api/courses/sessions/my-enrollments");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/courses/sessions/:id — session par id ──────────────────────────

describe("GET /api/courses/sessions/:id — session par id", () => {
  it("200 + session correcte pour un membre", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    const res = await request(app)
      .get(`/api/courses/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("id", sessionId);
  });

  it("200 + session correcte pour un admin", async () => {
    const { token } = await createTestAdmin();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "judo",
    });

    const res = await request(app)
      .get(`/api/courses/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(sessionId);
  });

  it("404 pour un id inexistant (99999)", async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get("/api/courses/sessions/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const sessionId = await createTestCourseSession(null);

    const res = await request(app).get(`/api/courses/sessions/${sessionId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/courses/sessions/:id/inscriptions ───────────────────────────────

describe("GET /api/courses/sessions/:id/inscriptions — feuille de présence", () => {
  it("200 + tableau pour un admin", async () => {
    const { token } = await createTestAdmin();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    const res = await request(app)
      .get(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // data est un AttendanceSheetDto — inscriptions est le tableau
    expect(Array.isArray(res.body.data.inscriptions)).toBe(true);
  });

  it("200 + liste contenant les inscriptions créées (professeur)", async () => {
    const { token } = await createTestProfessor();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });
    await createTestInscription(user.id, sessionId);

    const res = await request(app)
      .get(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.inscriptions.length).toBeGreaterThanOrEqual(1);
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .get(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const sessionId = await createTestCourseSession(null);

    const res = await request(app).get(
      `/api/courses/sessions/${sessionId}/inscriptions`,
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
