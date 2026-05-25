/**
 * store.categories.test.ts
 * Tests d'intégration pour /api/store/categories et /api/store/sizes.
 *
 * Règles d'accès :
 *   GET  /categories       — tous authentifiés
 *   GET  /categories/:id   — tous authentifiés
 *   POST /categories       — admin
 *   PUT  /categories/:id   — admin
 *   DELETE /categories/:id — admin
 *   GET  /sizes            — tous authentifiés
 *
 * Membre en lecture → 200.
 * Membre en écriture → 403.
 * Sans token → 401.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  createTestStoreCategory,
  truncateStore,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateStore();
});

// ─── GET /api/store/categories — liste ───────────────────────────────────────

describe('GET /api/store/categories — liste', () => {
  it('200 + tableau pour un membre authentifié', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/store/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/store/categories');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('200 + données après seed d\'une catégorie', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    await createTestStoreCategory({ nom: 'Vêtements', description: 'Tenues de sport' });

    const res = await request(app)
      .get('/api/store/categories')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── POST /api/store/categories — création ───────────────────────────────────

describe('POST /api/store/categories — création', () => {
  it('201 + catégorie créée pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/store/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Équipement', description: 'Protections et casques' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nom');
    expect(res.body.data.nom).toBe('Équipement');
  });

  it('403 pour un membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/store/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative Membre' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 si nom manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/store/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Sans nom' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app)
      .post('/api/store/categories')
      .send({ nom: 'Catégorie sans auth' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/store/categories/:id — détail ──────────────────────────────────

describe('GET /api/store/categories/:id — détail', () => {
  it('200 + shape correcte pour membre', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const catId  = await createTestStoreCategory({ nom: 'Accessoires', description: 'Ceintures et accessoires' });

    const res = await request(app)
      .get(`/api/store/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', catId);
    expect(res.body.data).toHaveProperty('nom');
  });

  it('404 pour un id inexistant', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/store/categories/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/store/categories/:id — mise à jour ─────────────────────────────

describe('PUT /api/store/categories/:id — mise à jour', () => {
  it('200 + catégorie modifiée pour admin', async () => {
    const { token } = await createTestAdmin();
    const catId     = await createTestStoreCategory({ nom: 'Catégorie Avant', description: 'Desc initiale' });

    const res = await request(app)
      .put(`/api/store/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Catégorie Après', description: 'Nouvelle desc' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.nom).toBe('Catégorie Après');
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/store/categories/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fantôme' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const catId = await createTestStoreCategory({ nom: 'Catégorie Protégée' });

    const res = await request(app)
      .put(`/api/store/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative modif membre' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/store/categories/:id — suppression ──────────────────────────

describe('DELETE /api/store/categories/:id — suppression', () => {
  it('200 + catégorie absente après suppression pour admin', async () => {
    const { token } = await createTestAdmin();
    const catId     = await createTestStoreCategory({ nom: 'À Supprimer' });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/store/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : la catégorie n'existe plus
    const user     = await createTestUser({ role_app: 'member' });
    const readTok  = generateAccessToken(user, UserRole.MEMBER);

    const getRes = await request(app)
      .get(`/api/store/categories/${catId}`)
      .set('Authorization', `Bearer ${readTok}`);

    expect(getRes.status).toBe(404);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/store/categories/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/store/sizes — liste des tailles ────────────────────────────────

describe('GET /api/store/sizes — liste des tailles', () => {
  it('200 + tableau pour un membre authentifié', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/store/sizes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/store/sizes');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
