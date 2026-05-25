/**
 * payments.webhook.test.ts
 * Tests d'intégration pour POST /api/payments/stripe/webhook.
 *
 * La route est PUBLIQUE (pas d'auth JWT).
 * Elle utilise express.raw() pour recevoir le payload brut.
 * La vérification de signature Stripe est faite par StripeService.
 *
 * Scénarios :
 *   - Sans header stripe-signature → 400 (signature manquante)
 *   - Avec une signature invalide  → 400 (signature invalide)
 *
 * Note : On ne peut pas simuler un événement Stripe valide sans la clé
 * secrète webhook réelle. Ces tests vérifient uniquement les rejections.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';

let app: Express;

beforeAll(() => {
  app = createApp();
});

// ─── POST /api/payments/stripe/webhook ───────────────────────────────────────

describe('POST /api/payments/stripe/webhook — webhook Stripe', () => {
  it('400 sans header stripe-signature', async () => {
    const res = await request(app)
      .post('/api/payments/stripe/webhook')
      .set('Content-Type', 'application/json')
      .send(Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' })));

    // La route est publique : pas de 401. Le contrôleur renvoie 400 car
    // la signature est absente.
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/[Ss]ignature/);
  });

  it('400 avec une signature stripe invalide', async () => {
    const payload = Buffer.from(JSON.stringify({ type: 'payment_intent.succeeded' }));

    const res = await request(app)
      .post('/api/payments/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1234567890,v1=invalidsignaturehex')
      .send(payload);

    // StripeService.constructWebhookEvent() lève une erreur → 400
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 avec un header stripe-signature vide', async () => {
    const res = await request(app)
      .post('/api/payments/stripe/webhook')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', '')
      .send(Buffer.from('{}'));

    // Une chaîne vide est falsy → même comportement que l'absence
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('pas de 401 — la route est publique même sans aucune auth', async () => {
    // Vérifie que la route n'est pas protégée par authMiddleware.
    // Sans signature → 400, mais jamais 401 (pas d'auth requise).
    const res = await request(app)
      .post('/api/payments/stripe/webhook')
      .send({});

    expect(res.status).not.toBe(401);
  });
});
