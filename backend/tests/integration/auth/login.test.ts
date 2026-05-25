/**
 * login.test.ts
 * Integration tests for POST /api/auth/login.
 * Tests the full HTTP stack: routing → controller → use-case → real MySQL DB.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  truncateAuthTables,
  countRefreshTokens,
} from '../setup/dbHelpers.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

describe('POST /api/auth/login — succès', () => {
  it('200 — retourne accessToken + user (sans password)', async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(user.email);
    expect(res.body.data.user.userId).toBe(user.userId);
    // Le hash bcrypt ne doit jamais être exposé
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
  });

  it('200 — pose le cookie httpOnly refreshToken', async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieArray = Array.isArray(cookies) ? cookies : (cookies ? [cookies] : []);
    const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='));

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
    expect(refreshCookie).toContain('SameSite=Strict');
  });

  it('200 — le refresh token est stocké en base', async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(200);

    const count = await countRefreshTokens(user.id);
    expect(count).toBe(1);
  });

  it("200 — l'accessToken est un JWT valide (3 parties)", async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(200);

    const token = res.body.data.accessToken as string;
    expect(token.split('.').length).toBe(3);
  });

  it('200 — expiresIn est présent dans la réponse', async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(200);
    expect(typeof res.body.data.expiresIn).toBe('number');
    expect(res.body.data.expiresIn).toBeGreaterThan(0);
  });
});

describe("POST /api/auth/login — erreurs d'authentification", () => {
  it('403 EMAIL_NOT_VERIFIED — email non vérifié', async () => {
    const user = await createTestUser({ email_verified: false });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('403 DIRECT_LOGIN_DISABLED — compte enfant (peut_se_connecter = false)', async () => {
    const child = await createTestUser({
      email_verified:    true,
      peut_se_connecter: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: child.userId, password: child.password });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('DIRECT_LOGIN_DISABLED');
  });

  it('500 — mauvais mot de passe', async () => {
    const user = await createTestUser({ email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: 'completely-wrong-password' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Identifiant ou mot de passe invalide');
  });

  it('500 — userId inexistant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: 'U-9999-9999', password: 'any-password' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 — compte inactif', async () => {
    const user = await createTestUser({ active: false, email_verified: true });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Account is disabled');
  });

  it('500 — compte supprimé (soft delete) — traité comme inexistant', async () => {
    const user = await createTestUser({
      email_verified: true,
      deleted_at:     new Date(),
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: user.password });

    // findUserByUserId filtre les deleted_at IS NOT NULL → null → "not found"
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/auth/login — validation d'entrée", () => {
  it('500 — userId manquant dans le body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'some-password' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 — password manquant dans le body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: 'U-2024-0001' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 — format userId invalide (pas U-YYYY-XXXX)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ userId: 'john.doe@example.com', password: 'some-password' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 — body vide', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login — sécurité', () => {
  it("les messages d'erreur ne révèlent pas si l'userId existe", async () => {
    const user = await createTestUser({ email_verified: true });

    const notFoundRes = await request(app)
      .post('/api/auth/login')
      .send({ userId: 'U-9999-9999', password: 'any-password' });

    const wrongPassRes = await request(app)
      .post('/api/auth/login')
      .send({ userId: user.userId, password: 'wrong-password' });

    // Les deux retournent 500 avec le même message
    expect(notFoundRes.status).toBe(500);
    expect(wrongPassRes.status).toBe(500);
    expect(notFoundRes.body.message).toBe(wrongPassRes.body.message);
  });
});
