/**
 * templates.test.ts
 * Tests d'intégration pour le module templates — /api/templates
 *
 * Routes couvertes :
 *   GET    /api/templates/types        — admin + professor
 *   POST   /api/templates/types        — admin + professor — body: { nom, description? }
 *   PUT    /api/templates/types/:id    — admin + professor
 *   DELETE /api/templates/types/:id    — admin
 *   GET    /api/templates              — admin + professor
 *   GET    /api/templates/:id          — admin + professor
 *   POST   /api/templates              — admin + professor — body: { type_id, titre, contenu }
 *   PUT    /api/templates/:id          — admin + professor
 *   PATCH  /api/templates/:id/toggle   — admin + professor
 *   DELETE /api/templates/:id          — admin + professor
 *
 * Règles d'accès :
 *   - Les membres n'ont accès à aucune route templates → 403
 *   - Sans token → 401
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
  createTestTemplate,
  truncateTemplates,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateTemplates();
});

// ─── GET /api/templates — liste ───────────────────────────────────────────────

describe('GET /api/templates — liste des templates', () => {
  it('200 + tableau pour un admin', async () => {
    const { token } = await createTestAdmin();
    await createTestTemplate({ nom: 'Bienvenue', sujet: 'Bienvenue !', contenu: 'Bonjour {{prenom}}' });

    const res = await request(app)
      .get('/api/templates')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('200 + tableau pour un professeur', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/templates')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/templates')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/templates');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/templates/types — liste des types ───────────────────────────────

describe('GET /api/templates/types — liste des types de templates', () => {
  it('200 + tableau pour un admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/templates/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 + tableau pour un professeur', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/templates/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/templates/types')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/templates/types — créer un type ───────────────────────────────

describe('POST /api/templates/types — créer un type de template', () => {
  it('201 + type créé avec id et nom (admin)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/templates/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Notification', description: 'Templates de notifications' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.id).toBe('number');
    expect(res.body.data.nom).toBe('Notification');
  });

  it('201 + type créé sans description (admin)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/templates/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Invitation' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('201 + type créé (professeur)', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .post('/api/templates/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Rappel cours' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/templates/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Test' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app)
      .post('/api/templates/types')
      .send({ nom: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/templates — créer un template ─────────────────────────────────

describe('POST /api/templates — créer un template', () => {
  /** Crée un type via l'API et retourne son id */
  async function createTypeViaApi(token: string): Promise<number> {
    const res = await request(app)
      .post('/api/templates/types')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: `Type-${Date.now()}` });
    return res.body.data.id as number;
  }

  it('201 + template créé (admin)', async () => {
    const { token } = await createTestAdmin();
    const typeId    = await createTypeViaApi(token);

    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_id: typeId,
        titre:   'Bienvenue au club',
        contenu: 'Bonjour {{prenom}}, bienvenue !',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.id).toBe('number');
  });

  it('201 + template créé (professeur)', async () => {
    const { token } = await createTestProfessor();
    const typeId    = await createTypeViaApi(token);

    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type_id: typeId,
        titre:   'Rappel séance',
        contenu: 'N\'oubliez pas votre cours {{date}}',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const { token: adminToken } = await createTestAdmin();
    const typeId                = await createTypeViaApi(adminToken);

    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/templates')
      .set('Authorization', `Bearer ${token}`)
      .send({ type_id: typeId, titre: 'Test', contenu: 'Test contenu' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/templates/:id — par id ─────────────────────────────────────────

describe('GET /api/templates/:id — template par id', () => {
  it('200 + template correct pour un admin', async () => {
    const { token }    = await createTestAdmin();
    const templateId   = await createTestTemplate({ nom: 'Test GET', sujet: 'Sujet test', contenu: 'Contenu test' });

    const res = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', templateId);
  });

  it('200 + template correct pour un professeur', async () => {
    const { token }  = await createTestProfessor();
    const templateId = await createTestTemplate();

    const res = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(templateId);
  });

  it('404 pour un id inexistant (99999)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/templates/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 avec un token membre', async () => {
    const user       = await createTestUser({ role_app: 'member' });
    const token      = generateAccessToken(user, UserRole.MEMBER);
    const templateId = await createTestTemplate();

    const res = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/templates/:id — mise à jour ────────────────────────────────────

describe('PUT /api/templates/:id — mettre à jour un template', () => {
  it('200 + template modifié (admin)', async () => {
    const { token }  = await createTestAdmin();
    const templateId = await createTestTemplate({ nom: 'Avant', sujet: 'Avant', contenu: 'Contenu avant' });

    const res = await request(app)
      .put(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titre: 'Template mis à jour', contenu: 'Nouveau contenu' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('200 + template modifié (professeur)', async () => {
    const { token }  = await createTestProfessor();
    const templateId = await createTestTemplate({ nom: 'Prof Template', sujet: 'Sujet', contenu: 'Contenu' });

    const res = await request(app)
      .put(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titre: 'Prof Template Modifié', contenu: 'Nouveau contenu prof' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user       = await createTestUser({ role_app: 'member' });
    const token      = generateAccessToken(user, UserRole.MEMBER);
    const templateId = await createTestTemplate();

    const res = await request(app)
      .put(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ titre: 'Tentative membre', contenu: 'Contenu' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/templates/:id/toggle — activer/désactiver ────────────────────

describe('PATCH /api/templates/:id/toggle — activer ou désactiver un template', () => {
  it('200 + actif basculé (admin)', async () => {
    const { token }  = await createTestAdmin();
    const templateId = await createTestTemplate({ nom: 'Toggle Test', sujet: 'Sujet', contenu: 'Contenu' });

    const res = await request(app)
      .patch(`/api/templates/${templateId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Le toggle change l'état actif — la réponse inclut la valeur mise à jour
    expect(res.body.data).toBeDefined();
  });

  it('200 + actif basculé (professeur)', async () => {
    const { token }  = await createTestProfessor();
    const templateId = await createTestTemplate();

    const res = await request(app)
      .patch(`/api/templates/${templateId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user       = await createTestUser({ role_app: 'member' });
    const token      = generateAccessToken(user, UserRole.MEMBER);
    const templateId = await createTestTemplate();

    const res = await request(app)
      .patch(`/api/templates/${templateId}/toggle`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 pour un id inexistant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .patch('/api/templates/99999/toggle')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/templates/:id — suppression ─────────────────────────────────

describe('DELETE /api/templates/:id — supprimer un template', () => {
  it('200 + template absent après suppression (admin)', async () => {
    const { token }  = await createTestAdmin();
    const templateId = await createTestTemplate({ nom: 'À Supprimer', sujet: 'Sujet', contenu: 'Contenu' });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le template n'existe plus
    const getRes = await request(app)
      .get(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it('200 + template supprimé (professeur)', async () => {
    const { token }  = await createTestProfessor();
    const templateId = await createTestTemplate();

    const res = await request(app)
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 avec un token membre', async () => {
    const user       = await createTestUser({ role_app: 'member' });
    const token      = generateAccessToken(user, UserRole.MEMBER);
    const templateId = await createTestTemplate();

    const res = await request(app)
      .delete(`/api/templates/${templateId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const templateId = await createTestTemplate();

    const res = await request(app).delete(`/api/templates/${templateId}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
