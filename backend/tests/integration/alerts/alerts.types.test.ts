/**
 * alerts.types.test.ts
 * Tests d'intégration pour /api/alerts — gestion des types d'alertes (admin).
 *
 * Routes couvertes :
 *   GET    /api/alerts/types       — admin seulement
 *   POST   /api/alerts/types       — admin seulement
 *   PUT    /api/alerts/types/:id   — admin seulement
 *   DELETE /api/alerts/types/:id   — admin seulement
 *   GET    /api/alerts/admin       — admin seulement (vue agrégée)
 *
 * Formes de réponse :
 *   GET /types            → { success, data: AlertType[] }
 *   POST /types           → 201, { success, data: { id, code, nom, priorite, actif, ... } }
 *   PUT /types/:id        → { success, data: AlertType }
 *   DELETE /types/:id     → { success, message } | 404
 *   GET /admin            → { success, data: UserAlert[] }
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  createTestAlertType,
  truncateAlerts,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateAlerts();
});

// ─── GET /api/alerts/types ────────────────────────────────────────────────────

describe('GET /api/alerts/types', () => {
  it('200 + tableau pour admin', async () => {
    const { token } = await createTestAdmin();
    await createTestAlertType({ nom: 'Alerte Bienvenue' });

    const res = await request(app)
      .get('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('chaque type a id, code, nom', async () => {
    const { token } = await createTestAdmin();
    await createTestAlertType({ nom: 'Alerte Props Check' });

    const res = await request(app)
      .get('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    for (const t of res.body.data as Array<Record<string, unknown>>) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('code');
      expect(t).toHaveProperty('nom');
      expect(typeof t['id']).toBe('number');
    }
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/alerts/types');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('?activeOnly=true retourne uniquement les types actifs', async () => {
    const { token } = await createTestAdmin();
    await createTestAlertType({ nom: 'Type Actif' }); // actif = 1 par défaut dans le helper

    const res = await request(app)
      .get('/api/alerts/types?activeOnly=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Tous les types retournés doivent être actifs
    for (const t of res.body.data as Array<Record<string, unknown>>) {
      expect(t['actif']).toBe(true);
    }
  });
});

// ─── POST /api/alerts/types ───────────────────────────────────────────────────

describe('POST /api/alerts/types', () => {
  it('201 + type créé avec id, code, nom pour admin', async () => {
    const { token } = await createTestAdmin();
    const code = `ALERT_CREATE_${Date.now()}`;

    const res = await request(app)
      .post('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ code, nom: 'Alerte Créée', priorite: 'haute' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('code', code);
    expect(res.body.data).toHaveProperty('nom', 'Alerte Créée');
    expect(typeof res.body.data.id).toBe('number');
  });

  it('201 avec priorite par défaut si non précisée', async () => {
    const { token } = await createTestAdmin();
    const code = `ALERT_DEF_${Date.now()}`;

    const res = await request(app)
      .post('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ code, nom: 'Alerte Défaut Priorité' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('400 si code manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Pas de code' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 si nom manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'CODE_SANS_NOM' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'FORBIDDEN', nom: 'Interdit' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/alerts/types/:id ────────────────────────────────────────────────

describe('PUT /api/alerts/types/:id', () => {
  it('200 + type modifié pour admin', async () => {
    const { token } = await createTestAdmin();
    const typeId = await createTestAlertType({ nom: 'Nom Initial' });
    const nouveauNom = 'Nom Modifié';

    const res = await request(app)
      .put(`/api/alerts/types/${typeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nouveauNom });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('nom', nouveauNom);
  });

  it('200 + priorite modifiée', async () => {
    const { token } = await createTestAdmin();
    const typeId = await createTestAlertType({ nom: 'Priorité Test', priorite: 'normale' });

    const res = await request(app)
      .put(`/api/alerts/types/${typeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ priorite: 'haute' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('priorite', 'haute');
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/alerts/types/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fantôme' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const typeId = await createTestAlertType();

    const res = await request(app)
      .put(`/api/alerts/types/${typeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative modif' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/alerts/types/:id ────────────────────────────────────────────

describe('DELETE /api/alerts/types/:id', () => {
  it('200 + type absent après suppression', async () => {
    const { token } = await createTestAdmin();
    const typeId = await createTestAlertType({ nom: 'À Supprimer' });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/alerts/types/${typeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le type supprimé n'apparaît plus dans la liste
    const listRes = await request(app)
      .get('/api/alerts/types')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body.data as Array<Record<string, unknown>>)
      .map((t) => t['id']);
    expect(ids).not.toContain(typeId);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/alerts/types/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const typeId = await createTestAlertType();

    const res = await request(app)
      .delete(`/api/alerts/types/${typeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/alerts/admin ────────────────────────────────────────────────────

describe('GET /api/alerts/admin', () => {
  it('200 + tableau pour admin (peut être vide)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/alerts/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/alerts/admin')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('filtres par statut ne retournent pas d\'erreur', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/alerts/admin?statut=active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
