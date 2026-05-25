/**
 * users.list.test.ts
 * Integration tests for:
 *   GET  /api/users          — admin + professor
 *   GET  /api/users/deleted  — admin
 *   GET  /api/users/:id      — admin + professor
 *
 * Response shapes (from UserController):
 *   GET /        → { success, message, data: { users: UserListItemDto[], pagination: { total, page, limit, totalPages } } }
 *   GET /deleted → { success, data: DeletedUserDto[] }
 *   GET /:id     → { success, message, data: User }
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
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

// ─── GET /api/users ────────────────────────────────────────────────────────────

describe('GET /api/users — liste paginée', () => {
  it('200 admin → data.users est un tableau + pagination présente', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Users retrieved');
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(typeof res.body.data.pagination.total).toBe('number');
    expect(typeof res.body.data.pagination.page).toBe('number');
    expect(typeof res.body.data.pagination.limit).toBe('number');
    expect(typeof res.body.data.pagination.totalPages).toBe('number');
  });

  it('200 admin → la liste contient au moins l\'utilisateur admin créé', async () => {
    const { user: admin, token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const found = (res.body.data.users as Array<{ userId: string }>).some(
      (u) => u.userId === admin.userId,
    );
    expect(found).toBe(true);
  });

  it('200 professor → accès autorisé', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
  });

  it('403 membre → accès refusé', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('200 avec ?search=Test → filtre actif, même si liste vide', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users?search=__aucun_utilisateur_avec_ce_nom__')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    // La pagination est toujours présente même pour une liste vide
    expect(res.body.data.pagination).toBeDefined();
  });

  it('200 avec ?page=1&limit=5 → pagination respectée', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
    expect(res.body.data.users.length).toBeLessThanOrEqual(5);
  });
});

// ─── GET /api/users/deleted ────────────────────────────────────────────────────

describe('GET /api/users/deleted — utilisateurs supprimés', () => {
  it('200 admin → data est un tableau', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('200 admin → un user avec deleted_at apparaît dans la liste', async () => {
    const { token } = await createTestAdmin();
    await createTestUser({ deleted_at: new Date() });

    const res = await request(app)
      .get('/api/users/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Chaque entrée a deleted_at
    for (const u of res.body.data as Array<{ deleted_at: unknown }>) {
      expect(u.deleted_at).toBeTruthy();
    }
  });

  it('403 membre → accès refusé', async () => {
    const user  = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/users/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('403 professor → accès refusé', async () => {
    const { token } = await createTestProfessor();

    const res = await request(app)
      .get('/api/users/deleted')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/users/:id ────────────────────────────────────────────────────────

describe('GET /api/users/:id — par identifiant numérique', () => {
  it('200 admin → userId correct dans data', async () => {
    const { token }  = await createTestAdmin();
    const target     = await createTestUser();

    const res = await request(app)
      .get(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User retrieved');
    expect(res.body.data.userId).toBe(target.userId);
  });

  it('200 professor → accès autorisé', async () => {
    const { token }  = await createTestProfessor();
    const target     = await createTestUser();

    const res = await request(app)
      .get(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser();

    const res = await request(app)
      .get(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 id inexistant → Utilisateur introuvable', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token', async () => {
    const target = await createTestUser();

    const res = await request(app).get(`/api/users/${target.id}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
