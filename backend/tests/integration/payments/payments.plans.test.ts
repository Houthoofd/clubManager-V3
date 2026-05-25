/**
 * payments.plans.test.ts
 * Tests d'intégration pour /api/payments/plans (CRUD plans tarifaires).
 *
 * Règles d'accès :
 *   GET  /plans         — admin + professor
 *   GET  /plans/:id     — admin + professor
 *   POST /plans         — admin
 *   PUT  /plans/:id     — admin
 *   PATCH /plans/:id/toggle — admin
 *   DELETE /plans/:id   — admin
 *
 * Membre → 403 sur toutes les routes.
 * Sans token → 401.
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
  createTestPricingPlan,
  truncatePayments,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncatePayments();
});

// ─── GET /api/payments/plans — liste ─────────────────────────────────────────

describe('GET /api/payments/plans — liste', () => {
  it('200 + tableau + pagination pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 + tableau pour professor', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('403 pour un membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/payments/plans');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/payments/plans — création ─────────────────────────────────────

describe('POST /api/payments/plans — création', () => {
  it('201 + plan créé avec les champs corrects pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Abonnement Annuel', prix: 120, duree_mois: 12 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nom');
    expect(res.body.data).toHaveProperty('prix');
    expect(res.body.data).toHaveProperty('duree_mois');
  });

  it('data.nom === le nom envoyé', async () => {
    const { token } = await createTestAdmin();
    const nomEnvoye = 'Plan Mensuel Test';

    const res = await request(app)
      .post('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nomEnvoye, prix: 30, duree_mois: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.nom).toBe(nomEnvoye);
  });

  it('403 pour un membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Plan Membre', prix: 20, duree_mois: 3 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 si nom manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/payments/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({ prix: 50, duree_mois: 6 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/payments/plans/:id — détail ────────────────────────────────────

describe('GET /api/payments/plans/:id — détail', () => {
  it('200 + shape correcte pour admin', async () => {
    const { token } = await createTestAdmin();
    const planId    = await createTestPricingPlan({ nom: 'Plan Détail Test', prix: 60, duree_mois: 6 });

    const res = await request(app)
      .get(`/api/payments/plans/${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', planId);
    expect(res.body.data).toHaveProperty('nom');
    expect(res.body.data).toHaveProperty('prix');
    expect(res.body.data).toHaveProperty('duree_mois');
    expect(res.body.data).toHaveProperty('actif');
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/payments/plans/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/payments/plans/:id — mise à jour ───────────────────────────────

describe('PUT /api/payments/plans/:id — mise à jour', () => {
  it('200 + plan modifié pour admin', async () => {
    const { token } = await createTestAdmin();
    const planId    = await createTestPricingPlan({ nom: 'Plan Avant', prix: 40, duree_mois: 4 });

    const res = await request(app)
      .put(`/api/payments/plans/${planId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Plan Après', prix: 45 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.nom).toBe('Plan Après');
    expect(Number(res.body.data.prix)).toBe(45);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/payments/plans/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fantôme' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/payments/plans/:id/toggle — activation ───────────────────────

describe('PATCH /api/payments/plans/:id/toggle — activation', () => {
  it('200 + statut inversé pour admin', async () => {
    const { token } = await createTestAdmin();
    const planId    = await createTestPricingPlan({ nom: 'Plan Toggle', prix: 25, duree_mois: 3 });

    const res = await request(app)
      .patch(`/api/payments/plans/${planId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('actif');
    // Le plan était actif (actif=1 à la création), il doit maintenant être inactif
    expect(res.body.data.actif).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch('/api/payments/plans/99999/toggle')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/payments/plans/:id — suppression ────────────────────────────

describe('DELETE /api/payments/plans/:id — suppression', () => {
  it('200 + plan absent après suppression pour admin', async () => {
    const { token } = await createTestAdmin();
    const planId    = await createTestPricingPlan({ nom: 'Plan À Supprimer', prix: 10, duree_mois: 1 });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/payments/plans/${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le plan n'existe plus
    const getRes = await request(app)
      .get(`/api/payments/plans/${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it('403 pour un membre', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const planId = await createTestPricingPlan();

    const res = await request(app)
      .delete(`/api/payments/plans/${planId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/payments/plans/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
