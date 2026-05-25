/**
 * families.admin.test.ts
 * Integration tests for admin-only family endpoints:
 *   GET    /api/families             — admin, liste paginée
 *   GET    /api/families/:id         — admin, détail (FamilyWithCount)
 *   PUT    /api/families/:id         — admin, renommage
 *   DELETE /api/families/:id         — admin, suppression (CASCADE membres)
 *   GET    /api/families/:id/members — admin, liste des membres
 *   POST   /api/families/:id/members — admin, ajout d'un utilisateur existant
 *
 * Response shapes (depuis FamilyController) :
 *   GET /           → { success, message: "Familles récupérées",    data: { families: FamilyWithCount[], pagination } }
 *   GET /:id        → { success, message: "Famille récupérée",      data: FamilyWithCount }
 *   PUT /:id        → { success, message: "Famille mise à jour",    data: FamilyWithCount }
 *   DELETE /:id     → { success, message: "Famille supprimée" }
 *   GET /:id/members→ { success, message: "Membres récupérés",      data: FamilyMemberWithUser[] }
 *   POST /:id/members → { success: 201, message: "Membre ajouté à la famille" }
 *
 * FamilyWithCount : { id, nom, membre_count, created_at, updated_at }
 * Note : GET /:id retourne FamilyWithCount (membre_count), PAS un tableau members.
 *        Pour les membres, utiliser GET /:id/members.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  createTestFamily,
  addFamilyMember,
  truncateFamilies,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateFamilies();
});

// ─── GET /api/families — liste paginée ───────────────────────────────────────

describe('GET /api/families — liste admin', () => {
  it('200 admin → data.families tableau + data.pagination présente', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/families')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Familles récupérées');
    expect(Array.isArray(res.body.data.families)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(typeof res.body.data.pagination.total).toBe('number');
    expect(typeof res.body.data.pagination.page).toBe('number');
    expect(typeof res.body.data.pagination.limit).toBe('number');
  });

  it('200 admin → famille créée apparaît dans la liste avec membre_count', async () => {
    const member    = await createTestUser();
    const { token } = await createTestAdmin();
    await createTestFamily(member.id, 'Famille Visible');

    const res = await request(app)
      .get('/api/families')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const found = (res.body.data.families as Array<{ nom: string; membre_count: number }>).find(
      (f) => f.nom === 'Famille Visible',
    );
    expect(found).toBeDefined();
    expect(found?.membre_count).toBeGreaterThan(0);
  });

  it('403 membre → accès refusé', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/families')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token → non authentifié', async () => {
    const res = await request(app).get('/api/families');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('200 avec ?search=Dupont → filtre actif', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/families?search=Dupont')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.families)).toBe(true);
    // Tous les résultats contiennent "Dupont" dans le nom (ou liste vide si aucun match)
    for (const f of res.body.data.families as Array<{ nom: string }>) {
      expect(f.nom.toLowerCase()).toContain('dupont');
    }
  });
});

// ─── GET /api/families/:id — détail ──────────────────────────────────────────

describe('GET /api/families/:id — détail admin', () => {
  it('200 admin → retourne FamilyWithCount (id, nom, membre_count, created_at, updated_at)', async () => {
    const member    = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(member.id, 'Famille Détail');

    const res = await request(app)
      .get(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Famille récupérée');
    expect(res.body.data.id).toBe(familleId);
    expect(res.body.data.nom).toBe('Famille Détail');
    // Note : la réponse contient membre_count (entier), pas un tableau members.
    // Pour les membres, utiliser GET /:id/members.
    expect(typeof res.body.data.membre_count).toBe('number');
    expect(res.body.data.membre_count).toBeGreaterThan(0);
  });

  it('404 id inexistant → Famille introuvable', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/families/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const member = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(member, UserRole.MEMBER);
    const user2  = await createTestUser();
    const familleId = await createTestFamily(user2.id);

    const res = await request(app)
      .get(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── PUT /api/families/:id — renommage ───────────────────────────────────────

describe('PUT /api/families/:id — renommage admin', () => {
  it('200 admin → nom mis à jour dans la réponse', async () => {
    const member    = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(member.id, 'Ancien Nom');

    const res = await request(app)
      .put(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Nouveau Nom' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Famille mise à jour');
    expect(res.body.data.nom).toBe('Nouveau Nom');
  });

  it('404 famille inexistante → 404', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .put('/api/families/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Fantôme' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const member    = await createTestUser({ role_app: 'member' });
    const token     = generateAccessToken(member, UserRole.MEMBER);
    const owner     = await createTestUser();
    const familleId = await createTestFamily(owner.id);

    const res = await request(app)
      .put(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nom: 'Tentative' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/families/:id — suppression ──────────────────────────────────

describe('DELETE /api/families/:id — suppression admin', () => {
  it('200 admin → famille supprimée, 404 lors du GET suivant', async () => {
    const member    = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(member.id, 'Famille À Supprimer');

    const delRes = await request(app)
      .delete(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
    expect(delRes.body.message).toBe('Famille supprimée');

    // La famille ne doit plus exister
    const getRes = await request(app)
      .get(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(getRes.status).toBe(404);
  });

  it('404 famille inexistante', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .delete('/api/families/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const member    = await createTestUser({ role_app: 'member' });
    const token     = generateAccessToken(member, UserRole.MEMBER);
    const owner     = await createTestUser();
    const familleId = await createTestFamily(owner.id);

    const res = await request(app)
      .delete(`/api/families/${familleId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/families/:id/members — membres ─────────────────────────────────

describe('GET /api/families/:id/members — membres admin', () => {
  it('200 admin → data est un tableau de membres avec les infos utilisateur', async () => {
    const member    = await createTestUser();
    const other     = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(member.id, 'Famille Membres');
    await addFamilyMember(familleId, other.id, { role: 'parent', est_responsable: false });

    const res = await request(app)
      .get(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Membres récupérés');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
    // Chaque membre a les champs de base
    for (const m of res.body.data as Array<Record<string, unknown>>) {
      expect(m).toHaveProperty('user_id');
      expect(m).toHaveProperty('role');
      expect(m).toHaveProperty('est_responsable');
      expect(m).toHaveProperty('user');
    }
  });

  it('404 famille inexistante', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/families/999999/members')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const member    = await createTestUser({ role_app: 'member' });
    const token     = generateAccessToken(member, UserRole.MEMBER);
    const owner     = await createTestUser();
    const familleId = await createTestFamily(owner.id);

    const res = await request(app)
      .get(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/families/:id/members — ajout admin ────────────────────────────

describe('POST /api/families/:id/members — ajout admin d\'un utilisateur existant', () => {
  it('201 admin → utilisateur existant ajouté à la famille', async () => {
    const owner     = await createTestUser();
    const newMember = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(owner.id, 'Famille Admin Add');

    const res = await request(app)
      .post(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id:         newMember.id,
        role:            'parent',
        est_responsable: false,
        est_tuteur_legal: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Membre ajouté à la famille');

    // Vérification : le membre apparaît dans la liste
    const membersRes = await request(app)
      .get(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`);

    expect(membersRes.status).toBe(200);
    const userIds = (membersRes.body.data as Array<{ user_id: number }>).map((m) => m.user_id);
    expect(userIds).toContain(newMember.id);
  });

  it('409 utilisateur déjà membre → conflict', async () => {
    const owner     = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(owner.id);

    // Tenter d'ajouter le responsable qui est déjà dans la famille
    const res = await request(app)
      .post(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: owner.id, role: 'parent' });

    // AdminAddFamilyMemberUseCase → "Cet utilisateur est déjà membre" → 409
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('400 user_id manquant → 400', async () => {
    const owner     = await createTestUser();
    const { token } = await createTestAdmin();
    const familleId = await createTestFamily(owner.id);

    const res = await request(app)
      .post(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'parent' }); // user_id absent

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('404 famille inexistante', async () => {
    const newMember = await createTestUser();
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/families/999999/members')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: newMember.id, role: 'parent' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const member    = await createTestUser({ role_app: 'member' });
    const token     = generateAccessToken(member, UserRole.MEMBER);
    const owner     = await createTestUser();
    const familleId = await createTestFamily(owner.id);

    const res = await request(app)
      .post(`/api/families/${familleId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: member.id, role: 'parent' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
