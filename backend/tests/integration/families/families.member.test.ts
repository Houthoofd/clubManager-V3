/**
 * families.member.test.ts
 * Integration tests for authenticated (non-admin) family endpoints:
 *   GET    /api/families/my-family       — tout utilisateur authentifié
 *   POST   /api/families/members         — tout utilisateur authentifié (crée un NOUVEL enfant)
 *   DELETE /api/families/members/:userId — responsable de famille seulement
 *
 * Notes comportementales importantes :
 *   - POST /members crée un nouvel utilisateur enfant (sans email/mot de passe)
 *     et l'ajoute à la famille du parent connecté (créée si inexistante).
 *     Body requis : { first_name, last_name, date_of_birth, genre_id, role }
 *   - DELETE /members/:userId : le :userId accepte le userId string (U-YYYY-XXXX)
 *     OU l'id numérique en string.
 *   - Les erreurs métier (non-responsable, hors famille) passent par next(error)
 *     → global error handler → 500. Voir TODO ci-dessous.
 */

import request from 'supertest';
import type { Express } from 'express';
import createApp from '../../../src/app.js';
import {
  createTestUser,
  generateAccessToken,
  truncateAuthTables,
  createTestFamily,
  addFamilyMember,
  truncateFamilies,
} from '../setup/dbHelpers.js';
import { UserRole } from '@clubmanager/types';

let app: Express;

beforeAll(() => {
  app = createApp();
});

beforeEach(async () => {
  await truncateAuthTables();
  await truncateFamilies();
});

// ─── GET /api/families/my-family ──────────────────────────────────────────────

describe('GET /api/families/my-family — ma famille', () => {
  it('200 utilisateur sans famille → data null + message "Aucune famille trouvée"', async () => {
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .get('/api/families/my-family')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Aucune famille trouvée');
    expect(res.body.data).toBeNull();
  });

  it('200 utilisateur avec famille → data contient famille_id, nom et membres', async () => {
    const user      = await createTestUser();
    const token     = generateAccessToken(user, UserRole.MEMBER);
    const familleId = await createTestFamily(user.id, 'Famille Dupont');

    const res = await request(app)
      .get('/api/families/my-family')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).not.toBeNull();
    expect(res.body.data.famille_id).toBe(familleId);
    expect(res.body.data.nom).toBe('Famille Dupont');
    expect(Array.isArray(res.body.data.membres)).toBe(true);
    expect(res.body.data.membres.length).toBeGreaterThan(0);
  });

  it('401 sans token → non authentifié', async () => {
    const res = await request(app).get('/api/families/my-family');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/families/members ───────────────────────────────────────────────

describe('POST /api/families/members — ajout d\'un enfant', () => {
  it('201 → enfant créé et ajouté à la famille, data contient famille_id et membre', async () => {
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Lucas',
        last_name:     'Parent',
        date_of_birth: '2013-06-15', // ~12 ans → valide pour role "enfant"
        genre_id:      1,
        role:          'enfant',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('famille_id');
    expect(res.body.data).toHaveProperty('membre');
    expect(typeof res.body.data.famille_id).toBe('number');
    expect(res.body.data.membre.first_name).toBe('Lucas');
    expect(res.body.data.membre.role).toBe('enfant');
    expect(res.body.data.membre.est_responsable).toBe(false);
  });

  it('201 → deuxième appel ajoute à la même famille (famille déjà existante)', async () => {
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    // Premier enfant
    const first = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Emma',
        last_name:     'Parent',
        date_of_birth: '2015-01-10',
        genre_id:      1,
        role:          'enfant',
      });
    expect(first.status).toBe(201);

    // Deuxième enfant
    const second = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Tom',
        last_name:     'Parent',
        date_of_birth: '2017-03-20',
        genre_id:      1,
        role:          'enfant',
      });
    expect(second.status).toBe(201);

    // Les deux enfants doivent être dans la même famille
    expect(second.body.data.famille_id).toBe(first.body.data.famille_id);
  });

  it('500 champs obligatoires manquants → erreur de validation via next(error)', async () => {
    // TODO: Les erreurs de validation AddFamilyMemberUseCase passent par next(error) → 500.
    // Idéalement, le contrôleur devrait retourner 400.
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({}); // body vide

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 âge invalide pour rôle enfant (trop vieux) → erreur de validation', async () => {
    // TODO: Validation d'âge via next(error) → 500. Idéalement 400.
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    const res = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Adulte',
        last_name:     'Parent',
        date_of_birth: '1990-01-01', // > 17 ans pour rôle enfant → erreur
        genre_id:      1,
        role:          'enfant',
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token → non authentifié', async () => {
    const res = await request(app)
      .post('/api/families/members')
      .send({ first_name: 'Ghost', last_name: 'User', date_of_birth: '2015-01-01', genre_id: 1, role: 'enfant' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/families/my-family après ajout membre ──────────────────────────

describe('GET /api/families/my-family — après ajout d\'un membre', () => {
  it('famille visible avec le(s) membre(s) après POST /members', async () => {
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    // Ajouter un enfant
    const addRes = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Léa',
        last_name:     'Martin',
        date_of_birth: '2014-07-22',
        genre_id:      1,
        role:          'enfant',
      });
    expect(addRes.status).toBe(201);

    // Consulter ma famille
    const familyRes = await request(app)
      .get('/api/families/my-family')
      .set('Authorization', `Bearer ${token}`);

    expect(familyRes.status).toBe(200);
    expect(familyRes.body.data).not.toBeNull();
    expect(familyRes.body.data.membres.length).toBeGreaterThanOrEqual(2); // parent + enfant
    const childFound = (familyRes.body.data.membres as Array<{ first_name: string }>).some(
      (m) => m.first_name === 'Léa',
    );
    expect(childFound).toBe(true);
  });
});

// ─── DELETE /api/families/members/:userId ────────────────────────────────────

describe('DELETE /api/families/members/:userId — retrait d\'un membre', () => {
  it('200 responsable → enfant retiré de la famille', async () => {
    const parent = await createTestUser();
    const token  = generateAccessToken(parent, UserRole.MEMBER);

    // Créer la famille avec l'enfant via l'API (nécessaire pour que userId de l'enfant soit connu)
    const addRes = await request(app)
      .post('/api/families/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name:    'Enfant',
        last_name:     'ASupprimer',
        date_of_birth: '2016-03-10',
        genre_id:      1,
        role:          'enfant',
      });
    expect(addRes.status).toBe(201);

    const childUserId = addRes.body.data.membre.userId as string; // ex: "U-2024-0002"

    const delRes = await request(app)
      .delete(`/api/families/members/${childUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    // Vérification : la famille n'a plus que le parent
    const familyRes = await request(app)
      .get('/api/families/my-family')
      .set('Authorization', `Bearer ${token}`);

    const membres = familyRes.body.data.membres as Array<{ userId: string }>;
    expect(membres.some((m) => m.userId === childUserId)).toBe(false);
  });

  it('500 utilisateur sans famille → erreur "Vous n\'appartenez à aucune famille"', async () => {
    // TODO: L'erreur métier RemoveFamilyMemberUseCase passe par next(error) → 500.
    // Idéalement, ce cas devrait retourner 403 ou 404.
    const user  = await createTestUser();
    const token = generateAccessToken(user, UserRole.MEMBER);

    const res = await request(app)
      .delete('/api/families/members/U-9999-9999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('500 membre non responsable → ne peut pas retirer un autre membre', async () => {
    // TODO: L'erreur "Vous devez être responsable" passe par next(error) → 500.
    // Idéalement, ce cas devrait retourner 403.
    const responsible = await createTestUser();
    const nonResponsible = await createTestUser();
    const tokenNonResp   = generateAccessToken(nonResponsible, UserRole.MEMBER);

    // Créer famille avec responsible comme responsable
    const familleId = await createTestFamily(responsible.id);
    // Ajouter nonResponsible comme simple membre (est_responsable = false)
    await addFamilyMember(familleId, nonResponsible.id, { role: 'parent', est_responsable: false });

    const res = await request(app)
      .delete(`/api/families/members/${responsible.userId}`)
      .set('Authorization', `Bearer ${tokenNonResp}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('401 sans token → non authentifié', async () => {
    const res = await request(app).delete('/api/families/members/U-2024-0001');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
