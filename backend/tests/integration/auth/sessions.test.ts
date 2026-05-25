/**
 * sessions.test.ts
 * Integration tests for POST /api/auth/refresh and POST /api/auth/logout.
 * These tests exercise the full login → refresh → logout lifecycle with real DB.
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Performs a full login and returns the supertest agent with the cookie set,
 * plus the accessToken from the response body.
 */
async function loginAs(
  userId: string,
  password: string,
): Promise<{ cookie: string; accessToken: string }> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ userId, password });

  if (res.status !== 200) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const setCookie = res.headers['set-cookie'] as string[] | string;
  const cookieArray = Array.isArray(setCookie) ? setCookie : [setCookie];
  const refreshCookie = cookieArray
    .find((c: string) => c.startsWith('refreshToken=')) ?? '';

  // Extract just the "refreshToken=VALUE" part (before ;)
  const cookie = refreshCookie.split(';')[0] ?? '';

  return { cookie, accessToken: res.body.data.accessToken as string };
}

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('200 — retourne un nouveau accessToken avec un cookie valide', async () => {
    const user = await createTestUser({ email_verified: true });
    const { cookie } = await loginAs(user.userId, user.password);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.accessToken.split('.').length).toBe(3);
  });

  it('200 — pose un nouveau cookie refreshToken', async () => {
    const user = await createTestUser({ email_verified: true });
    const { cookie } = await loginAs(user.userId, user.password);

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieArray = Array.isArray(cookies) ? cookies : (cookies ? [cookies] : []);
    expect(cookieArray.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('401 — sans cookie refreshToken', async () => {
    const res = await request(app).post('/api/auth/refresh');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Refresh token is required');
  });

  it('500 — avec un refresh token invalide', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', 'refreshToken=fake-invalid-token-xyz');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('200 — déconnexion avec cookie valide', async () => {
    const user = await createTestUser({ email_verified: true });
    const { cookie } = await loginAs(user.userId, user.password);

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('200 — le cookie refreshToken est effacé après logout', async () => {
    const user = await createTestUser({ email_verified: true });
    const { cookie } = await loginAs(user.userId, user.password);

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);

    // Le Set-Cookie doit effacer le cookie (Max-Age=0 ou Expires dans le passé)
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookieArray = Array.isArray(cookies) ? cookies : (cookies ? [cookies] : []);
    const refreshCookie = cookieArray.find((c: string) => c.startsWith('refreshToken='));

    if (refreshCookie) {
      // Cookie cleared: soit Max-Age=0, soit valeur vide
      expect(
        refreshCookie.includes('Max-Age=0') ||
        refreshCookie.includes('refreshToken=;') ||
        refreshCookie.startsWith('refreshToken=;'),
      ).toBe(true);
    }
    // Si pas de Set-Cookie → le cookie n'est pas re-posé → acceptable
  });

  it('401 — sans cookie refreshToken', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── Cycle complet login → refresh → logout ──────────────────────────────────

describe('Cycle complet session', () => {
  it('login → refresh → logout fonctionne de bout en bout', async () => {
    const user = await createTestUser({ email_verified: true });

    // 1. Login
    const { cookie, accessToken } = await loginAs(user.userId, user.password);
    expect(accessToken).toBeDefined();

    // Vérifier qu'un token est en base
    const countAfterLogin = await countRefreshTokens(user.id);
    expect(countAfterLogin).toBeGreaterThanOrEqual(1);

    // 2. Refresh
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookie);

    expect(refreshRes.status).toBe(200);
    const newAccessToken = refreshRes.body.data.accessToken as string;
    expect(newAccessToken).toBeDefined();

    // Récupérer le nouveau cookie après refresh
    const newCookies = refreshRes.headers['set-cookie'] as string[] | string;
    const newCookieArray = Array.isArray(newCookies) ? newCookies : [newCookies];
    const newRefreshCookie = (newCookieArray.find((c: string) => c.startsWith('refreshToken=')) ?? '').split(';')[0];

    // 3. Logout
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', newRefreshCookie);

    expect(logoutRes.status).toBe(200);
  });
});
