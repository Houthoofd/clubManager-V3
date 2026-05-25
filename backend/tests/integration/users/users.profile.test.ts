/**
 * users.profile.test.ts
 * Integration tests for:
 *   GET   /api/users/:id/profile  — propriétaire ou admin
 *   PATCH /api/users/:id/profile  — propriétaire ou admin
 *
 * Règles d'accès (UserController.getProfile / updateProfile) :
 *   - Un utilisateur peut consulter / modifier son propre profil
 *   - L'admin peut consulter / modifier n'importe quel profil
 *   - Un autre membre → 403
 *
 * Response shapes :
 *   GET   → { success, message: "Profil récupéré", data: UserProfileDto }
 *   PATCH → { success, message: "Profil mis à jour", data: UserProfileDto }
 *
 * UserProfileDto clés : id, userId, first_name, last_name, email, role_app, genre, grade, abonnement, status
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
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

// ─── GET /api/users/:id/profile ───────────────────────────────────────────────

describe('GET /api/users/:id/profile — lecture du profil', () => {
  it('200 propriétaire → email présent et correct', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get(`/api/users/${user.id}/profile`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Profil récupéré');
    expect(res.body.data.email).toBe(user.email);
  });

  it('200 propriétaire → shape complète du profil (userId, first_name, last_name, status, genre)', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get(`/api/users/${user.id}/profile`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const data = res.body.data as Record<string, unknown>;
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('userId');
    expect(data).toHaveProperty('first_name');
    expect(data).toHaveProperty('last_name');
    expect(data).toHaveProperty('email');
    expect(data).toHaveProperty('role_app');
    expect(data).toHaveProperty('status');
    // Le hash de mot de passe ne doit jamais être exposé
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
  });

  it('200 admin → peut consulter le profil d\'un autre utilisateur', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser();

    const res = await request(app)
      .get(`/api/users/${target.id}/profile`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(target.email);
  });

  it('403 autre membre → accès au profil d\'un tiers refusé', async () => {
    const target = await createTestUser();
    const other  = await createTestUser();
    const token  = generateAccessToken(other, UserRole.MEMBER);

    const res = await request(app)
      .get(`/api/users/${target.id}/profile`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('refusé');
  });

  it('401 sans token', async () => {
    const target = await createTestUser();

    const res = await request(app).get(`/api/users/${target.id}/profile`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('404 id inexistant → 404 ou 500 selon findProfile', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .get('/api/users/999999/profile')
      .set('Authorization', `Bearer ${token}`);

    // findProfile filtre deleted_at IS NULL — retourne null → throw "Utilisateur introuvable" → 404
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/users/:id/profile ────────────────────────────────────────────

describe('PATCH /api/users/:id/profile — mise à jour du profil', () => {
  it('200 propriétaire → first_name mis à jour dans la réponse', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .patch(`/api/users/${user.id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Modifié', last_name: 'Profil' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Profil mis à jour');
    expect(res.body.data.first_name).toBe('Modifié');
    expect(res.body.data.last_name).toBe('Profil');
  });

  it('200 propriétaire → champs optionnels (telephone, adresse)', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .patch(`/api/users/${user.id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ telephone: '+32470001122', adresse: '1 rue de la Paix, Bruxelles' });

    expect(res.status).toBe(200);
    expect(res.body.data.telephone).toBe('+32470001122');
    expect(res.body.data.adresse).toBe('1 rue de la Paix, Bruxelles');
  });

  it('403 autre membre → ne peut pas modifier le profil d\'un tiers', async () => {
    const target = await createTestUser();
    const other  = await createTestUser();
    const token  = generateAccessToken(other, UserRole.MEMBER);

    const res = await request(app)
      .patch(`/api/users/${target.id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'Pirate' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('200 admin → peut modifier le profil d\'un autre utilisateur', async () => {
    const { token } = await createTestAdmin();
    const target    = await createTestUser();

    const res = await request(app)
      .patch(`/api/users/${target.id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'AdminUpdated', last_name: 'ByAdmin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.first_name).toBe('AdminUpdated');
  });

  it('400 first_name trop court (< 2 chars) → validation rejetée', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .patch(`/api/users/${user.id}/profile`)
      .set('Authorization', `Bearer ${token}`)
      .send({ first_name: 'X' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('prénom');
  });

  it('401 sans token → non authentifié', async () => {
    const target = await createTestUser();

    const res = await request(app)
      .patch(`/api/users/${target.id}/profile`)
      .send({ first_name: 'Ghost' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
