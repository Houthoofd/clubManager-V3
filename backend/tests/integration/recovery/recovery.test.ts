/**
 * recovery.test.ts
 * Integration tests for /api/recovery endpoints.
 * Tests the full HTTP stack: routing → controller → use-case → real MySQL DB.
 *
 * Routes couvertes :
 *   POST   /api/recovery/public  — PUBLIC (sans auth)
 *   GET    /api/recovery          — admin seulement
 *   PATCH  /api/recovery/:id      — admin seulement
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  getTestPool,
} from '../setup/dbHelpers.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  // Nettoyer les demandes de récupération entre chaque test pour garantir
  // un état prévisible (table distincte, non couverte par truncateAuthTables)
  const pool = getTestPool();
  await pool.query('TRUNCATE TABLE manual_recovery_requests');
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Soumet une demande de récupération publique, puis récupère son id via GET /admin.
 * Retourne l'id numérique de la première demande dans la liste.
 */
async function createPendingRequest(
  adminToken: string,
  email = `recovery_${Date.now()}@test.com`,
  reason = 'Raison valide de longueur suffisante pour passer la validation',
): Promise<number> {
  await request(app)
    .post('/api/recovery/public')
    .send({ email, reason });

  const listRes = await request(app)
    .get('/api/recovery')
    .set('Authorization', `Bearer ${adminToken}`);

  return (listRes.body.data.requests[0] as { id: number }).id;
}

// ─── POST /api/recovery/public — soumission publique ─────────────────────────

describe('POST /api/recovery/public — soumission publique', () => {
  it('201 + success: true + message "Demande de récupération soumise" (sans auth)', async () => {
    const res = await request(app)
      .post('/api/recovery/public')
      .send({
        email: 'public_user@example.com',
        reason: 'Mon compte a été piraté et je ne peux plus y accéder depuis une semaine.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Demande de récupération soumise');
  });

  it('400 pour un email invalide (sans @)', async () => {
    const res = await request(app)
      .post('/api/recovery/public')
      .send({
        email: 'pas-un-email-valide',
        reason: 'Raison valide de longueur suffisante pour le test',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 si la raison est trop courte (< 10 caractères)', async () => {
    const res = await request(app)
      .post('/api/recovery/public')
      .send({
        email: 'valid@example.com',
        reason: 'Court',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/recovery — liste admin ──────────────────────────────────────────

describe('GET /api/recovery — liste admin', () => {
  it('200 + success + data.requests est un tableau pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/recovery')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.requests)).toBe(true);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/recovery');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user);

    const res = await request(app)
      .get('/api/recovery')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('data.pagination existe et contient total, page, limit, totalPages', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/recovery')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const { pagination } = res.body.data;
    expect(pagination).toBeDefined();
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('totalPages');
  });
});

// ─── PATCH /api/recovery/:id — traitement ─────────────────────────────────────

describe('PATCH /api/recovery/:id — traitement', () => {
  it('200 — approuver une demande pending → message contient "approuvée"', async () => {
    const { token } = await createTestAdmin();
    const id = await createPendingRequest(token);

    const res = await request(app)
      .patch(`/api/recovery/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('approuvée');
  });

  it('200 — rejeter une demande pending → message contient "rejetée"', async () => {
    const { token } = await createTestAdmin();
    const id = await createPendingRequest(token, `reject_${Date.now()}@test.com`);

    const res = await request(app)
      .patch(`/api/recovery/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('rejetée');
  });

  it('200 avec admin_note → message contient la note', async () => {
    const { token } = await createTestAdmin();
    const id = await createPendingRequest(token, `note_${Date.now()}@test.com`);
    const note = 'Identité vérifiée par téléphone';

    const res = await request(app)
      .patch(`/api/recovery/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved', admin_note: note });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain(note);
  });

  it('409 si on retente un traitement sur une demande déjà traitée', async () => {
    const { token } = await createTestAdmin();
    const id = await createPendingRequest(token, `dup_${Date.now()}@test.com`);

    // Premier traitement (OK)
    await request(app)
      .patch(`/api/recovery/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    // Deuxième traitement sur la même demande → 409
    const res = await request(app)
      .patch(`/api/recovery/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Cette demande a déjà été traitée');
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch('/api/recovery/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'approved' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Demande introuvable');
  });

  it('400 si status est absent du body', async () => {
    const { token } = await createTestAdmin();

    // Le contrôleur valide le status avant tout appel à la DB
    // → un id quelconque (format valide) suffit pour déclencher la validation
    const res = await request(app)
      .patch('/api/recovery/1')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 si status est invalide', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch('/api/recovery/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'invalid_status' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
