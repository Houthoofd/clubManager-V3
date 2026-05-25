/**
 * courses.inscriptions.test.ts
 * Tests d'intégration pour les inscriptions aux sessions — /api/courses
 *
 * Routes couvertes :
 *   POST   /api/courses/sessions/:id/inscriptions    — admin + professor
 *   DELETE /api/courses/inscriptions/:inscriptionId  — admin + professor
 *   PATCH  /api/courses/sessions/:id/presence        — admin + professor
 *
 * Body POST inscription : { user_id }
 * Body PATCH presence   : { presences: Array<{ inscription_id, statut }> }
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

// ─── POST /api/courses/sessions/:id/inscriptions — inscrire un user ───────────

describe("POST /api/courses/sessions/:id/inscriptions — inscrire un utilisateur", () => {
  it("201 + inscription créée (admin)", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    const res = await request(app)
      .post(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/inscription/i);
  });

  it("201 + inscription créée (professeur)", async () => {
    const { token } = await createTestProfessor();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "judo",
    });

    const res = await request(app)
      .post(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("400 — double inscription (même user, même session)", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    // Première inscription (directement en DB)
    await createTestInscription(user.id, sessionId);

    // Deuxième inscription via l'API → doit échouer
    const res = await request(app)
      .post(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user.id });

    // Le controller intercepte ER_DUP_ENTRY et retourne 400 DUPLICATE_INSCRIPTION
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("DUPLICATE_INSCRIPTION");
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .post(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`)
      .send({ user_id: user.id });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const sessionId = await createTestCourseSession(null);
    const user = await createTestUser();

    const res = await request(app)
      .post(`/api/courses/sessions/${sessionId}/inscriptions`)
      .send({ user_id: user.id });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/courses/inscriptions/:inscriptionId — supprimer ─────────────

describe("DELETE /api/courses/inscriptions/:inscriptionId — supprimer une inscription", () => {
  it("200 + inscription supprimée (admin) — absente après suppression", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });
    const inscriptionId = await createTestInscription(user.id, sessionId);

    // Suppression
    const delRes = await request(app)
      .delete(`/api/courses/inscriptions/${inscriptionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : l'inscription n'apparaît plus dans la feuille de présence
    const getRes = await request(app)
      .get(`/api/courses/sessions/${sessionId}/inscriptions`)
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    const ids = (getRes.body.data.inscriptions as Array<{ id: number }>).map(
      (i) => i.id,
    );
    expect(ids).not.toContain(inscriptionId);
  });

  it("200 + inscription supprimée (professeur)", async () => {
    const { token } = await createTestProfessor();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    const inscriptionId = await createTestInscription(user.id, sessionId);

    const res = await request(app)
      .delete(`/api/courses/inscriptions/${inscriptionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);
    const inscriptionId = await createTestInscription(user.id, sessionId);

    const res = await request(app)
      .delete(`/api/courses/inscriptions/${inscriptionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null);
    const inscriptionId = await createTestInscription(user.id, sessionId);

    const res = await request(app).delete(
      `/api/courses/inscriptions/${inscriptionId}`,
    );

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/courses/sessions/:id/presence — maj en masse ─────────────────

describe("PATCH /api/courses/sessions/:id/presence — mise à jour des présences", () => {
  it("200 avec liste vide de présences (admin)", async () => {
    const { token } = await createTestAdmin();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });

    // Envoi d'une mise à jour vide — aucune présence à modifier
    const res = await request(app)
      .patch(`/api/courses/sessions/${sessionId}/presence`)
      .set("Authorization", `Bearer ${token}`)
      .send({ presences: [] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/pr[ée]sence/i);
  });

  it("200 avec une présence à marquer comme présente (admin)", async () => {
    const { token } = await createTestAdmin();
    const user = await createTestUser();
    const sessionId = await createTestCourseSession(null, {
      type_cours: "karate",
    });
    const inscriptionId = await createTestInscription(user.id, sessionId);

    const res = await request(app)
      .patch(`/api/courses/sessions/${sessionId}/presence`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        presences: [{ inscription_id: inscriptionId, statut: "present" }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("403 avec un token membre", async () => {
    const user = await createTestUser({ role_app: "member" });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .patch(`/api/courses/sessions/${sessionId}/presence`)
      .set("Authorization", `Bearer ${token}`)
      .send({ presences: [] });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 sans token", async () => {
    const sessionId = await createTestCourseSession(null);

    const res = await request(app)
      .patch(`/api/courses/sessions/${sessionId}/presence`)
      .send({ presences: [] });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
