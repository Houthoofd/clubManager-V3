/**
 * health.test.ts
 * Integration tests for basic health/info endpoints.
 * These tests do NOT require any database state.
 */

import request from 'supertest';
import createApp from '../../src/app.js';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with success:true and API info', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('ClubManager API is running');
    expect(res.body.environment).toBe('test');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('GET /api', () => {
  it('returns 200 with version 3.0.0', async () => {
    const res = await request(app).get('/api');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.version).toBe('3.0.0');
    expect(res.body.name).toBe('ClubManager API');
  });
});

describe('GET /api/auth/health', () => {
  it('returns 200 with success:true', async () => {
    const res = await request(app).get('/api/auth/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Auth API is healthy');
  });
});

describe('404 handler', () => {
  it('returns 404 with success:false for unknown routes', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.path).toBeDefined();
  });

  it('returns 404 for unknown nested routes', async () => {
    const res = await request(app).get('/api/auth/unknown-endpoint-xyz');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
