/**
 * references.test.ts
 * Integration tests for GET /api/references (and sub-routes).
 * All routes are public — no authentication required.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

// ─── GET /api/references — toutes les données ─────────────────────────────────

describe('GET /api/references — données complètes', () => {
  it('200 + success: true + data non-null', async () => {
    const res = await request(app).get('/api/references');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
  });

  it('data contient toutes les clés de référence attendues', async () => {
    const res = await request(app).get('/api/references');

    expect(res.status).toBe(200);

    const data: Record<string, unknown> = res.body.data;
    const expectedKeys = [
      'genres',
      'roles_utilisateur',
      'roles_familial',
      'methodes_paiement',
      'statuts_paiement',
      'statuts_echeance',
      'statuts_commande',
      'types_cours',
    ];

    for (const key of expectedKeys) {
      expect(data).toHaveProperty(key);
    }
  });

  it('toutes les valeurs retournées sont des tableaux', async () => {
    const res = await request(app).get('/api/references');

    expect(res.status).toBe(200);

    const data: Record<string, unknown> = res.body.data;
    for (const value of Object.values(data)) {
      expect(Array.isArray(value)).toBe(true);
    }
  });

  it('header Cache-Control: public, max-age=3600', async () => {
    const res = await request(app).get('/api/references');

    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=3600');
  });
});

// ─── GET /api/references/genres ──────────────────────────────────────────────

describe('GET /api/references/genres', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/genres');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau non vide', async () => {
    const res = await request(app).get('/api/references/genres');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('chaque item a un id et un nom', async () => {
    const res = await request(app).get('/api/references/genres');

    expect(res.status).toBe(200);
    for (const item of res.body.data as Array<Record<string, unknown>>) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('nom');
      expect(typeof item['id']).toBe('number');
      expect(typeof item['nom']).toBe('string');
    }
  });
});

// ─── GET /api/references/roles-utilisateur ───────────────────────────────────

describe('GET /api/references/roles-utilisateur', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/roles-utilisateur');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau non vide', async () => {
    const res = await request(app).get('/api/references/roles-utilisateur');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

// ─── GET /api/references/methodes-paiement ───────────────────────────────────

describe('GET /api/references/methodes-paiement', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/methodes-paiement');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau (vide ou non)', async () => {
    const res = await request(app).get('/api/references/methodes-paiement');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/references/statuts-paiement ────────────────────────────────────

describe('GET /api/references/statuts-paiement', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/statuts-paiement');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau', async () => {
    const res = await request(app).get('/api/references/statuts-paiement');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/references/statuts-echeance ────────────────────────────────────

describe('GET /api/references/statuts-echeance', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/statuts-echeance');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau', async () => {
    const res = await request(app).get('/api/references/statuts-echeance');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/references/statuts-commande ────────────────────────────────────

describe('GET /api/references/statuts-commande', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/statuts-commande');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau', async () => {
    const res = await request(app).get('/api/references/statuts-commande');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/references/types-cours ─────────────────────────────────────────

describe('GET /api/references/types-cours', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/types-cours');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau', async () => {
    const res = await request(app).get('/api/references/types-cours');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ─── GET /api/references/roles-familial ──────────────────────────────────────

describe('GET /api/references/roles-familial', () => {
  it('200 + success: true', async () => {
    const res = await request(app).get('/api/references/roles-familial');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data est un tableau', async () => {
    const res = await request(app).get('/api/references/roles-familial');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
