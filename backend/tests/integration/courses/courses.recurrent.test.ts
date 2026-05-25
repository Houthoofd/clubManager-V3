/**
 * courses.recurrent.test.ts
 * Tests d'intégration pour les cours récurrents — /api/courses
 *
 * Routes couvertes :
 *   GET    /api/courses          — admin + professor + member
 *   POST   /api/courses          — admin seulement
 *   GET    /api/courses/:id      — admin + professor + member
 *   PUT    /api/courses/:id      — admin seulement
 *   DELETE /api/courses/:id      — admin seulement
 *
 * Body POST/PUT : { type_cours, jour_semaine, heure_debut, heure_fin }
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  createTestProfessor,
  generateAccessToken,
  truncateAuthTables,
  createTestCourseRecurrent,
  truncateCourses,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateCourses();
});

// ─── GET /api/courses — liste ─────────────────────────────────────────────────

describe('GET /api/courses — liste des cours récurrents', () => {
  it('200 + tableau pour un membre authentifié', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 + tableau pour un admin', async () => {
    const { token } = await createTestAdmin();

    await createTestCourseRecurrent({ type_cours: 'karate', jour_semaine: 1 });

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('200 + tableau pour un professeur', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/courses — création (admin) ─────────────────────────────────────

describe('POST /api/courses — créer un cours récurrent', () => {
  it('201 + cours créé avec toutes ses propriétés (admin)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_cours:   'judo',
        jour_semaine: 2,
        heure_debut:  '09:00',
        heure_fin:    '10:30',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.id).toBe('number');
  });

  it('data.type_cours === la valeur envoyée', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_cours:   'taekwondo',
        jour_semaine: 3,
        heure_debut:  '14:00',
        heure_fin:    '15:00',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.type_cours).toBe('taekwondo');
  });

  it('403 avec un token membre (rôle insuffisant)', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_cours:   'karate',
        jour_semaine: 1,
        heure_debut:  '10:00',
        heure_fin:    '11:00',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('403 avec un token professeur', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_cours:   'karate',
        jour_semaine: 1,
        heure_debut:  '10:00',
        heure_fin:    '11:00',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({ type_cours: 'karate', jour_semaine: 1, heure_debut: '10:00', heure_fin: '11:00' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/courses/:id — par id ───────────────────────────────────────────

describe('GET /api/courses/:id — cours récurrent par id', () => {
  it('200 + objet avec id pour un membre', async () => {
    const user      = await createTestUser();
    const token     = generateAccessToken(user, UserRole.MEMBER);
    const coursId   = await createTestCourseRecurrent({ type_cours: 'karate' });

    const res = await request(app)
      .get(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', coursId);
  });

  it('200 + objet avec id pour un admin', async () => {
    const { token } = await createTestAdmin();
    const coursId   = await createTestCourseRecurrent({ type_cours: 'judo' });

    const res = await request(app)
      .get(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(coursId);
  });

  it('404 pour un id inexistant (99999)', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/courses/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const coursId = await createTestCourseRecurrent();

    const res = await request(app).get(`/api/courses/${coursId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/courses/:id — mise à jour (admin) ───────────────────────────────

describe('PUT /api/courses/:id — mettre à jour un cours récurrent', () => {
  it('200 + cours modifié avec token admin', async () => {
    const { token } = await createTestAdmin();
    const coursId   = await createTestCourseRecurrent({
      type_cours:   'karate',
      jour_semaine: 1,
      heure_debut:  '10:00',
      heure_fin:    '11:00',
    });

    const res = await request(app)
      .put(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_cours:   'judo',
        jour_semaine: 2,
        heure_debut:  '14:00',
        heure_fin:    '15:30',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('403 avec un token membre', async () => {
    const user    = await createTestUser({ role_app: 'member' });
    const token   = generateAccessToken(user, UserRole.MEMBER);
    const coursId = await createTestCourseRecurrent();

    const res = await request(app)
      .put(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ type_cours: 'judo', jour_semaine: 2, heure_debut: '14:00', heure_fin: '15:00' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/courses/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ type_cours: 'judo', jour_semaine: 2, heure_debut: '14:00', heure_fin: '15:00' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/courses/:id — suppression (admin) ───────────────────────────

describe('DELETE /api/courses/:id — supprimer un cours récurrent', () => {
  it('200 + cours absent après suppression (admin)', async () => {
    const { token } = await createTestAdmin();
    const coursId   = await createTestCourseRecurrent({ type_cours: 'boxe' });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le cours n'existe plus
    const user      = await createTestUser();
    const readToken = generateAccessToken(user, UserRole.MEMBER);

    const getRes = await request(app)
      .get(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${readToken}`);

    expect(getRes.status).toBe(404);
  });

  it('403 avec un token membre', async () => {
    const user    = await createTestUser({ role_app: 'member' });
    const token   = generateAccessToken(user, UserRole.MEMBER);
    const coursId = await createTestCourseRecurrent();

    const res = await request(app)
      .delete(`/api/courses/${coursId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const coursId = await createTestCourseRecurrent();

    const res = await request(app).delete(`/api/courses/${coursId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
