/**
 * users.admin.test.ts
 * Integration tests for admin-only user management endpoints:
 *   PATCH  /api/users/:id/role       — admin (ne peut pas changer son propre rôle)
 *   PATCH  /api/users/:id/status     — admin
 *   DELETE /api/users/:id            — admin (soft delete, requires reason >= 5 chars, ne peut pas se supprimer soi-même)
 *   POST   /api/users/:id/restore    — admin
 *   POST   /api/users/:id/anonymize  — admin (user doit d'abord être soft-deleted)
 *
 * Vérifications DB directes via getTestPool() pour confirmer l'état après mutation.
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
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

// ─── PATCH /api/users/:id/role ────────────────────────────────────────────────

describe('PATCH /api/users/:id/role — mise à jour du rôle', () => {
  it('200 admin → rôle mis à jour sur un autre utilisateur', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser({ role_app: 'member' });

    const res = await request(app)
      .patch(`/api/users/${target.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role_app: 'professor' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Rôle mis à jour');
  });

  it('400 admin → ne peut pas modifier son propre rôle', async () => {
    const { user: admin, token } = await createTestAdmin();

    const res = await request(app)
      .patch(`/api/users/${admin.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role_app: 'member' });

    // UpdateUserRoleUseCase → "Vous ne pouvez pas modifier votre propre rôle" → 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser();

    const res = await request(app)
      .patch(`/api/users/${target.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role_app: 'admin' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 rôle invalide → rejeté par le use case', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser();

    const res = await request(app)
      .patch(`/api/users/${target.id}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role_app: 'superadmin' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/users/:id/status ─────────────────────────────────────────────

describe('PATCH /api/users/:id/status — mise à jour du statut', () => {
  it('200 admin → statut mis à jour', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser();

    // status_id = 2 (doit exister dans les seeds)
    const res = await request(app)
      .patch(`/api/users/${target.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Statut mis à jour');
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser();

    const res = await request(app)
      .patch(`/api/users/${target.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status_id: 2 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/users/:id — soft delete ─────────────────────────────────────

describe('DELETE /api/users/:id — suppression logique (soft delete)', () => {
  it('200 admin → deleted_at IS NOT NULL en base', async () => {
    const { user: admin, token } = await createTestAdmin();
    // L'admin ne peut pas se supprimer lui-même → créer un utilisateur cible distinct
    const target = await createTestUser();

    const res = await request(app)
      .delete(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Compte inactif depuis plus de 12 mois' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Utilisateur supprimé');

    // Vérification directe en DB
    const pool  = getTestPool();
    const [rows] = await pool.query<any[]>(
      'SELECT deleted_at FROM utilisateurs WHERE id = ?',
      [target.id],
    );
    expect(rows[0]?.deleted_at).not.toBeNull();

    // Supprimer la variable admin pour éviter le lint warning (utilisée implicitement pour le contexte)
    void admin;
  });

  it('400 admin → ne peut pas se supprimer lui-même', async () => {
    const { user: admin, token } = await createTestAdmin();

    const res = await request(app)
      .delete(`/api/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Auto-suppression test' });

    // SoftDeleteUserUseCase → "Vous ne pouvez pas supprimer votre propre compte" → 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 raison absente ou trop courte (< 5 chars)', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser();

    const res = await request(app)
      .delete(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'ok' }); // < 5 chars

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser();

    const res = await request(app)
      .delete(`/api/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Tentative suppression membre' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/users/:id/restore ─────────────────────────────────────────────

describe('POST /api/users/:id/restore — restauration', () => {
  it('200 admin → utilisateur supprimé restauré, deleted_at IS NULL en base', async () => {
    const { token } = await createTestAdmin();
    // Créer un utilisateur déjà soft-deleted
    const target    = await createTestUser({ deleted_at: new Date() });

    const res = await request(app)
      .post(`/api/users/${target.id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Utilisateur restauré');

    // Vérification directe en DB
    const pool  = getTestPool();
    const [rows] = await pool.query<any[]>(
      'SELECT deleted_at FROM utilisateurs WHERE id = ?',
      [target.id],
    );
    expect(rows[0]?.deleted_at).toBeNull();
  });

  it('200 admin → utilisateur non supprimé (no-op) — RestoreUserUseCase ne vérifie pas deleted_at', async () => {
    // TODO: RestoreUserUseCase ne vérifie pas si l'utilisateur est déjà actif.
    // Comportement actuel : 200 même si deleted_at était déjà NULL (restauration inutile mais silencieuse).
    const { token } = await createTestAdmin();
    const target    = await createTestUser(); // pas de deleted_at

    const res = await request(app)
      .post(`/api/users/${target.id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('404 id inexistant → Utilisateur introuvable', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/users/999999/restore')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser({ deleted_at: new Date() });

    const res = await request(app)
      .post(`/api/users/${target.id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/users/:id/anonymize ───────────────────────────────────────────

describe('POST /api/users/:id/anonymize — anonymisation RGPD', () => {
  it('200 admin → utilisateur soft-deleted anonymisé avec succès', async () => {
    const { token } = await createTestAdmin();
    // L'utilisateur doit d'abord être soft-deleted (AnonymizeUserUseCase vérifie deleted_at IS NOT NULL)
    const target    = await createTestUser({ deleted_at: new Date() });

    const res = await request(app)
      .post(`/api/users/${target.id}/anonymize`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Utilisateur anonymisé');
  });

  it('400 admin → utilisateur non supprimé (doit d\'abord être soft-deleted)', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser(); // pas de deleted_at

    const res = await request(app)
      .post(`/api/users/${target.id}/anonymize`)
      .set('Authorization', `Bearer ${token}`);

    // AnonymizeUserUseCase → "L'utilisateur doit d'abord être supprimé..." → 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('403 membre → accès refusé', async () => {
    const user   = await createTestUser({ role_app: 'member' });
    const token  = generateAccessToken(user, UserRole.MEMBER);
    const target = await createTestUser({ deleted_at: new Date() });

    const res = await request(app)
      .post(`/api/users/${target.id}/anonymize`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('404 id inexistant → Utilisateur introuvable', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/users/999999/anonymize')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
