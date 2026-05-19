/**
 * grades.test.ts
 * Integration tests for /api/grades (CRUD).
 *
 * Auth rules:
 *   GET /        — authentifié (tous rôles)
 *   GET /:id     — authentifié (tous rôles)
 *   POST /       — admin seulement
 *   PUT /:id     — admin seulement
 *   DELETE /:id  — admin seulement
 *
 * Seed: grades id 1-5 (Blanche, Bleue, Violette, Marron, Noire).
 * beforeEach: truncateTestGrades() — remet uniquement les seeds, supprime ceux créés par les tests.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  truncateTestGrades,
  insertTestGrade,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateTestGrades();
});

// ─── GET /api/grades — liste ──────────────────────────────────────────────────

describe('GET /api/grades — liste', () => {
  it('200 + liste non vide pour un membre authentifié', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/grades')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('chaque grade retourné a id, nom et ordre', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/grades')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    for (const grade of res.body.data as Array<Record<string, unknown>>) {
      expect(grade).toHaveProperty('id');
      expect(grade).toHaveProperty('nom');
      expect(grade).toHaveProperty('ordre');
      expect(typeof grade['id']).toBe('number');
      expect(typeof grade['nom']).toBe('string');
      expect(typeof grade['ordre']).toBe('number');
    }
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/grades');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/grades/:id — par id ────────────────────────────────────────────

describe('GET /api/grades/:id — par id', () => {
  it('200 + grade correct pour id 1 (seed Blanche)', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/grades/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', 1);
    expect(typeof res.body.data.nom).toBe('string');
  });

  it('404 pour un id inexistant (99999)', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/grades/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/grades/1');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/grades — création (admin) ─────────────────────────────────────

describe('POST /api/grades — création (admin)', () => {
  it('201 + grade créé avec toutes ses propriétés pour un admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Ceinture Or', ordre: 10, couleur: '#FFD700' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nom');
    expect(res.body.data).toHaveProperty('ordre');
    expect(res.body.data).toHaveProperty('couleur');
  });

  it('data.nom === le nom envoyé', async () => {
    const { token } = await createTestAdmin();
    const nomEnvoye = 'Ceinture Argent';

    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nomEnvoye, ordre: 11, couleur: '#C0C0C0' });

    expect(res.status).toBe(201);
    expect(res.body.data.nom).toBe(nomEnvoye);
  });

  it('403 avec un token membre (rôle insuffisant)', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Ceinture Test', ordre: 12 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app)
      .post('/api/grades')
      .send({ nom: 'Ceinture Test', ordre: 12 });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('400 si le nom est manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/grades')
      .set('Authorization', `Bearer ${token}`)
      .send({ ordre: 12 }); // nom absent

    // Le use-case lève "Le nom du grade est requis" → contrôleur → 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/grades/:id — mise à jour (admin) ───────────────────────────────

describe('PUT /api/grades/:id — mise à jour (admin)', () => {
  it('200 + grade modifié avec token admin', async () => {
    const { token } = await createTestAdmin();
    const gradeId    = await insertTestGrade({ nom: 'Ceinture Initiale', ordre: 20 });

    const res = await request(app)
      .put(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Ceinture Modifiée', ordre: 20 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('data.nom === la nouvelle valeur envoyée', async () => {
    const { token }  = await createTestAdmin();
    const gradeId    = await insertTestGrade({ nom: 'Ceinture Avant', ordre: 21 });
    const nouveauNom = 'Ceinture Après';

    const res = await request(app)
      .put(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nouveauNom, ordre: 21 });

    expect(res.status).toBe(200);
    expect(res.body.data.nom).toBe(nouveauNom);
  });

  it('403 avec un token membre', async () => {
    const user    = await createTestUser({ role_app: 'member' });
    const token   = generateAccessToken(user, UserRole.MEMBER);
    const gradeId = await insertTestGrade({ nom: 'Ceinture PUT Test', ordre: 22 });

    const res = await request(app)
      .put(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative modif', ordre: 22 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/grades/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fantôme', ordre: 99 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/grades/:id — suppression (admin) ────────────────────────────

describe('DELETE /api/grades/:id — suppression (admin)', () => {
  it('200 avec token admin + grade absent après suppression', async () => {
    const { token } = await createTestAdmin();
    const gradeId   = await insertTestGrade({ nom: 'Ceinture À Supprimer', ordre: 30 });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le grade n'existe plus
    const user      = await createTestUser();
    const readToken = generateAccessToken(user, UserRole.MEMBER);

    const getRes = await request(app)
      .get(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${readToken}`);

    expect(getRes.status).toBe(404);
  });

  it('403 avec un token membre', async () => {
    const user    = await createTestUser({ role_app: 'member' });
    const token   = generateAccessToken(user, UserRole.MEMBER);
    const gradeId = await insertTestGrade({ nom: 'Ceinture DELETE Test', ordre: 31 });

    const res = await request(app)
      .delete(`/api/grades/${gradeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/grades/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
