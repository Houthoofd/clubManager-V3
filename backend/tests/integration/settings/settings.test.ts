/**
 * settings.test.ts
 * Integration tests for /api/settings endpoints.
 * Tests the full HTTP stack: routing → controller → use-case → real MySQL DB.
 *
 * Routes couvertes :
 *   GET    /api/settings              — admin + professor
 *   GET    /api/settings/key/:cle     — admin + professor
 *   PUT    /api/settings/key/:cle     — admin seulement
 *   POST   /api/settings/bulk         — admin seulement
 *   DELETE /api/settings/:id          — admin seulement
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
} from '../setup/dbHelpers.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

// ─── GET /api/settings ────────────────────────────────────────────────────────

describe('GET /api/settings', () => {
  it('200 + success + data.data est un tableau pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });

  it('200 + success pour professor', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/settings');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre (rôle insuffisant)', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user);

    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('data.pagination existe et contient page, page_size, total, total_pages', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { pagination } = res.body.data;
    expect(pagination).toBeDefined();
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('page_size');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('total_pages');
  });
});

// ─── GET /api/settings/key/:cle ───────────────────────────────────────────────

describe('GET /api/settings/key/:cle', () => {
  it('200 + data.cle === la clé demandée (créée via PUT avant)', async () => {
    const { token } = await createTestAdmin();
    const key = `test_get_key_${Date.now()}`;

    // Créer la clé via un upsert
    await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'valeur_test' });

    const res = await request(app)
      .get(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cle).toBe(key);
  });

  it('404 pour une clé inexistante', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/settings/key/cle_inexistante_xyz_99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/settings/key/:cle — upsert ──────────────────────────────────────

describe('PUT /api/settings/key/:cle — upsert', () => {
  it('200 + message "Paramètre sauvegardé" pour admin', async () => {
    const { token } = await createTestAdmin();
    const key = `test_put_${Date.now()}`;

    const res = await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'ma_valeur' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Paramètre sauvegardé');
  });

  it('data.cle et data.valeur correspondent à ce qu\'on a envoyé', async () => {
    const { token } = await createTestAdmin();
    const key = `test_put_data_${Date.now()}`;
    const valeur = 'valeur_attendue_42';

    const res = await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur });

    expect(res.status).toBe(200);
    expect(res.body.data.cle).toBe(key);
    expect(res.body.data.valeur).toBe(valeur);
  });

  it('401 sans token', async () => {
    const res = await request(app)
      .put('/api/settings/key/some_key')
      .send({ valeur: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user);

    const res = await request(app)
      .put('/api/settings/key/some_key')
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'test' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 si valeur manquante dans le body', async () => {
    const { token } = await createTestAdmin();
    const key = `test_put_noval_${Date.now()}`;

    const res = await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('mise à jour d\'une valeur existante → 200 + nouvelle valeur', async () => {
    const { token } = await createTestAdmin();
    const key = `test_update_${Date.now()}`;

    // Création initiale
    await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'ancienne_valeur' });

    // Mise à jour de la même clé
    const res = await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'nouvelle_valeur' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.valeur).toBe('nouvelle_valeur');
  });
});

// ─── POST /api/settings/bulk ──────────────────────────────────────────────────

describe('POST /api/settings/bulk', () => {
  it('200 pour admin avec un tableau de 2 settings', async () => {
    const { token } = await createTestAdmin();
    const ts = Date.now();

    const res = await request(app)
      .post('/api/settings/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        informations: [
          { cle: `test_bulk_a_${ts}`, valeur: 'valeur_a' },
          { cle: `test_bulk_b_${ts}`, valeur: 'valeur_b' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
  });

  it('message inclut "2 paramètre(s)"', async () => {
    const { token } = await createTestAdmin();
    const ts = Date.now();

    const res = await request(app)
      .post('/api/settings/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        informations: [
          { cle: `test_bulk_msg_a_${ts}`, valeur: 'v1' },
          { cle: `test_bulk_msg_b_${ts}`, valeur: 'v2' },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('2 paramètre(s)');
  });

  it('400 si informations n\'est pas un tableau', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/settings/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send({ informations: 'pas_un_tableau' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/settings/:id ─────────────────────────────────────────────────

describe('DELETE /api/settings/:id', () => {
  it('200 + message "Paramètre supprimé" après suppression d\'un setting créé', async () => {
    const { token } = await createTestAdmin();
    const key = `test_del_${Date.now()}`;

    // Créer le setting via upsert et récupérer son id dans la réponse
    const putRes = await request(app)
      .put(`/api/settings/key/${key}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ valeur: 'a_supprimer' });

    expect(putRes.status).toBe(200);
    const settingId = putRes.body.data.id as number;

    // Supprimer par id
    const res = await request(app)
      .delete(`/api/settings/${settingId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Paramètre supprimé');
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/settings/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
