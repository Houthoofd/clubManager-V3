/**
 * notifications.test.ts
 * Tests d'intégration pour /api/notifications.
 *
 * Toutes les routes nécessitent authMiddleware.
 * POST /broadcast : admin uniquement (vérification dans le controller, pas via requireRole).
 *
 * Formes de réponse :
 *   GET /                   → { success, data: Notification[] }
 *   GET /unread-count        → { success, data: { count: number } }
 *   POST /read-all           → { success, message }
 *   POST /broadcast (admin)  → 200, { success, message, data: { sent: number } }
 *   PATCH /:id/read          → { success, message }
 *   DELETE /:id              → { success, message } | 404
 *   DELETE /all              → { success, data: { deleted: number } }
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  createTestAdmin,
  generateAccessToken,
  truncateAuthTables,
  seedNotification,
  truncateNotifications,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateNotifications();
});

// ─── GET /api/notifications ───────────────────────────────────────────────────

describe('GET /api/notifications', () => {
  it('200 + tableau pour utilisateur authentifié (peut être vide)', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('retourne les notifications de l\'utilisateur connecté', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    await seedNotification(user.id, { titre: 'Notification test 1' });
    await seedNotification(user.id, { titre: 'Notification test 2' });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('?unread=true retourne uniquement les non-lues', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    await seedNotification(user.id, { titre: 'Non lue' });

    const res = await request(app)
      .get('/api/notifications?unread=true')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Toutes les notifications seedées sont non-lues par défaut
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('401 sans token', async () => {
    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/notifications/unread-count ─────────────────────────────────────

describe('GET /api/notifications/unread-count', () => {
  it('200 + data.count numérique (≥ 0)', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.count).toBe('number');
    expect(res.body.data.count).toBeGreaterThanOrEqual(0);
  });

  it('data.count augmente après seed', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const before = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    await seedNotification(user.id);

    const after = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(after.status).toBe(200);
    expect(after.body.data.count).toBe(before.body.data.count + 1);
  });
});

// ─── POST /api/notifications/broadcast ───────────────────────────────────────

describe('POST /api/notifications/broadcast', () => {
  it('200 + success pour admin avec tous les champs requis', async () => {
    const { token } = await createTestAdmin();
    // Créer au moins un utilisateur cible pour que le broadcast ait des destinataires
    await createTestUser({ role_app: 'member' });

    const res = await request(app)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titre: 'Annonce importante',
        contenu: 'Contenu de la notification broadcast',
        type: 'info',
        cible: 'tous',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('sent');
    expect(typeof res.body.data.sent).toBe('number');
  });

  it('403 pour un membre (vérification dans le controller)', async () => {
    const user = await createTestUser({ role_app: 'member' });
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titre: 'Tentative broadcast',
        contenu: 'Contenu',
        type: 'info',
        cible: 'tous',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('400 si champs requis manquants', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({ titre: 'Juste un titre' }); // contenu, type, cible manquants

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 si type invalide', async () => {
    const { token } = await createTestAdmin();

    const res = await request(app)
      .post('/api/notifications/broadcast')
      .set('Authorization', `Bearer ${token}`)
      .send({
        titre: 'Test',
        contenu: 'Contenu',
        type: 'invalide',
        cible: 'tous',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/notifications/read-all ────────────────────────────────────────

describe('POST /api/notifications/read-all', () => {
  it('200 + toutes les notifications marquées comme lues', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    await seedNotification(user.id, { titre: 'Non lue 1' });
    await seedNotification(user.id, { titre: 'Non lue 2' });

    const res = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Vérifie que le compteur de non-lues est maintenant 0
    const countRes = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', `Bearer ${token}`);

    expect(countRes.body.data.count).toBe(0);
  });

  it('200 même si aucune notification non lue', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────

describe('PATCH /api/notifications/:id/read', () => {
  it('200 + notification marquée comme lue', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const notifId = await seedNotification(user.id, { titre: 'À lire' });

    const res = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('400 pour un id invalide (NaN)', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .patch('/api/notifications/abc/read')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────

describe('DELETE /api/notifications/:id', () => {
  it('200 + notification absente après suppression', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);
    const notifId = await seedNotification(user.id, { titre: 'À supprimer' });

    const delRes = await request(app)
      .delete(`/api/notifications/${notifId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : la notification n'est plus listée
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    const ids = (listRes.body.data as Array<Record<string, unknown>>)
      .map((n) => n['id']);
    expect(ids).not.toContain(notifId);
  });

  it('404 si notification inexistante ou appartient à un autre utilisateur', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .delete('/api/notifications/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── DELETE /api/notifications/all ───────────────────────────────────────────

describe('DELETE /api/notifications/all', () => {
  it('200 + data.deleted = nombre de notifications supprimées', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    await seedNotification(user.id, { titre: 'Notif 1' });
    await seedNotification(user.id, { titre: 'Notif 2' });
    await seedNotification(user.id, { titre: 'Notif 3' });

    const res = await request(app)
      .delete('/api/notifications/all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('deleted');
    expect(res.body.data.deleted).toBe(3);
  });

  it('200 + data.deleted = 0 si aucune notification', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .delete('/api/notifications/all')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(0);
  });

  it('les notifications de l\'utilisateur sont absentes après DELETE /all', async () => {
    const user = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    await seedNotification(user.id);

    await request(app)
      .delete('/api/notifications/all')
      .set('Authorization', `Bearer ${token}`);

    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(0);
  });

  it('ne supprime pas les notifications des autres utilisateurs', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const token1 = generateAccessToken(user1, UserRole.MEMBER);
    const token2 = generateAccessToken(user2, UserRole.MEMBER);

    await seedNotification(user1.id, { titre: 'User1 notif' });
    await seedNotification(user2.id, { titre: 'User2 notif' });

    // User1 supprime toutes ses notifications
    await request(app)
      .delete('/api/notifications/all')
      .set('Authorization', `Bearer ${token1}`);

    // User2 doit toujours avoir sa notification
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token2}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
  });
});
