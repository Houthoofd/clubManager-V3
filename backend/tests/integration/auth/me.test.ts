/**
 * me.test.ts
 * Integration tests for GET /api/auth/me.
 * Tests the authMiddleware + controller without any DB query
 * (the endpoint reads from the JWT, not the DB).
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  generateAccessToken,
  truncateAuthTables,
} from '../setup/dbHelpers.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
});

describe('GET /api/auth/me — sans authentification', () => {
  it('401 NO_TOKEN — aucun header Authorization', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('401 NO_TOKEN — schéma Basic au lieu de Bearer', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic c29tZXRva2Vu');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('NO_TOKEN');
  });

  it('401 INVALID_TOKEN — token malformé', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer this-is-not-a-jwt');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });

  it('401 INVALID_TOKEN — token avec une mauvaise signature', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MDAwMDAwMDB9.fake-signature-xyz';

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_TOKEN');
  });
});

describe('GET /api/auth/me — avec token valide', () => {
  it('200 — retourne les données utilisateur du token', async () => {
    const user  = await createTestUser({ email_verified: true });
    const token = generateAccessToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.userId).toBe(user.id);
    expect(res.body.data.userIdString).toBe(user.userId);
  });

  it('200 — ne retourne pas le mot de passe', async () => {
    const user  = await createTestUser({ email_verified: true });
    const token = generateAccessToken(user);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
    expect(res.body.data).not.toHaveProperty('password');
  });
});
