/**
 * groups.test.ts
 * Tests d'intégration pour /api/groups (CRUD + gestion des membres).
 *
 * Auth rules :
 *   GET /                       — admin + professor
 *   POST /                      — admin
 *   GET /:id                    — admin + professor
 *   PUT /:id                    — admin
 *   DELETE /:id                 — admin
 *   GET /:id/members            — admin + professor
 *   POST /:id/members           — admin  (body: { user_id })
 *   DELETE /:id/members/:userId — admin
 *
 * Réponse paginée de GET / :
 *   { success, data: { groups: Group[], pagination: { total, page, limit, totalPages } } }
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
  createTestGroup,
  addGroupMember,
  truncateGroups,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateGroups();
});

// ─── GET /api/groups — liste ──────────────────────────────────────────────────

describe('GET /api/groups — liste', () => {
  it('200 + tableau groups + pagination pour admin', async () => {
    const { token } = await createTestAdmin();
    await createTestGroup({ nom: 'Groupe Liste A' });

    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.groups)).toBe(true);
    expect(res.body.data.groups.length).toBeGreaterThan(0);

    const { pagination } = res.body.data;
    expect(pagination).toBeDefined();
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('totalPages');
  });

  it('chaque groupe retourné a id, nom et membre_count', async () => {
    const { token } = await createTestAdmin();
    await createTestGroup({ nom: 'Groupe Props Check' });

    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    for (const g of res.body.data.groups as Array<Record<string, unknown>>) {
      expect(g).toHaveProperty('id');
      expect(g).toHaveProperty('nom');
      expect(typeof g['id']).toBe('number');
      expect(typeof g['nom']).toBe('string');
    }
  });

  it('200 + tableau groups pour professor', async () => {
    const { token } = await createTestProfessor();
    await createTestGroup({ nom: 'Groupe Professor' });

    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.groups)).toBe(true);
  });

  it('403 pour un membre (rôle insuffisant)', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/groups');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/groups — création ─────────────────────────────────────────────

describe('POST /api/groups — création', () => {
  it('201 + groupe créé avec id et nom pour admin', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Nouveau Groupe', description: 'Description du groupe' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nom', 'Nouveau Groupe');
    expect(typeof res.body.data.id).toBe('number');
  });

  it('data.nom === nom envoyé', async () => {
    const { token } = await createTestAdmin();
    const nomEnvoye = `Groupe Unique ${Date.now()}`;

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nomEnvoye });

    expect(res.status).toBe(201);
    expect(res.body.data.nom).toBe(nomEnvoye);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative création' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 si nom manquant', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Pas de nom' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/groups/:id — par id ────────────────────────────────────────────

describe('GET /api/groups/:id — par id', () => {
  it('200 + id et nom pour admin', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup({ nom: 'Groupe Detail' });

    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', groupId);
    expect(typeof res.body.data.nom).toBe('string');
  });

  it('200 + id et nom pour professor', async () => {
    const { token } = await createTestProfessor();
    const groupId = await createTestGroup({ nom: 'Groupe Prof Detail' });

    const res = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id', groupId);
  });

  it('404 pour un id inexistant (99999)', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/groups/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/groups/:id — mise à jour ───────────────────────────────────────

describe('PUT /api/groups/:id — mise à jour', () => {
  it('200 + nom modifié pour admin', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup({ nom: 'Nom Initial' });
    const nouveauNom = 'Nom Modifié';

    const res = await request(app)
      .put(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: nouveauNom });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nom).toBe(nouveauNom);
  });

  it('200 + description modifiée', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup({ nom: 'Groupe Description', description: 'Ancienne' });

    const res = await request(app)
      .put(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Groupe Description', description: 'Nouvelle description' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const groupId = await createTestGroup({ nom: 'Groupe PUT Test' });

    const res = await request(app)
      .put(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative modif' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/groups/:id — suppression ────────────────────────────────────

describe('DELETE /api/groups/:id — suppression', () => {
  it('200 pour admin + GET → 404 après suppression', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup({ nom: 'Groupe À Supprimer' });

    // Suppression
    const delRes = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : le groupe n'existe plus
    const getRes = await request(app)
      .get(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it('403 pour un membre', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);
    const groupId = await createTestGroup({ nom: 'Groupe DELETE Test' });

    const res = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/groups/:id/members — ajout membre ─────────────────────────────

describe('POST /api/groups/:id/members — ajout membre', () => {
  it('201 + relation présente via GET members', async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: 'member' });
    const groupId = await createTestGroup();

    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: targetUser.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    // Vérifie que le membre apparaît dans la liste
    const membersRes = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(membersRes.status).toBe(200);
    const memberIds = (membersRes.body.data as Array<Record<string, unknown>>)
      .map((m) => m['user_id']);
    expect(memberIds).toContain(targetUser.id);
  });

  it('400 si user_id manquant', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup();

    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/groups/:id/members/:userId — retrait membre ─────────────────

describe('DELETE /api/groups/:id/members/:userId — retrait membre', () => {
  it('200 + relation absente via GET members', async () => {
    const { token } = await createTestAdmin();
    const targetUser = await createTestUser({ role_app: 'member' });
    const groupId = await createTestGroup();

    // Ajouter d'abord le membre
    await addGroupMember(groupId, targetUser.id);

    // Retirer le membre
    const res = await request(app)
      .delete(`/api/groups/${groupId}/members/${targetUser.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Vérifie que le membre n'est plus dans la liste
    const membersRes = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(membersRes.status).toBe(200);
    const memberIds = (membersRes.body.data as Array<Record<string, unknown>>)
      .map((m) => m['user_id']);
    expect(memberIds).not.toContain(targetUser.id);
  });
});

// ─── GET /api/groups/:id/members — liste membres ─────────────────────────────

describe('GET /api/groups/:id/members — liste membres', () => {
  it('200 + tableau vide si aucun membre', async () => {
    const { token } = await createTestAdmin();
    const groupId = await createTestGroup();

    const res = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 + tableau avec membres après ajout', async () => {
    const { token } = await createTestAdmin();
    const member1 = await createTestUser({ role_app: 'member' });
    const member2 = await createTestUser({ role_app: 'member' });
    const groupId = await createTestGroup();

    await addGroupMember(groupId, member1.id);
    await addGroupMember(groupId, member2.id);

    const res = await request(app)
      .get(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
