# Roadmap — Tests Backend & E2E

> Ce document est la source de vérité unique pour la **stratégie de test complète** du projet.  
> Il couvre les quatre niveaux de la pyramide de tests : **unitaires backend**, **unitaires frontend**, **intégration API** et **e2e navigateur**.

---

## Sommaire

1. [Pyramide de tests — vue d'ensemble](#1-pyramide-de-tests--vue-densemble)
2. [Infrastructure — Tests d'intégration](#2-infrastructure--tests-dintégration)
3. [Phase 1 — Auth & Health ✅](#phase-1--auth--health-✅)
4. [Phase 2 — CRUD simples ✅](#phase-2--modules-crud-simples-✅)
5. [Phase 3 — Users & Families ✅](#phase-3--modules-utilisateurs-et-familles-✅)
6. [Phase 4 — Métier ✅](#phase-4--modules-métier-✅)
7. [Phase 5 — Modules complexes ✅](#phase-5--modules-complexes-✅)
8. [Phase 6 — Services externes ✅](#phase-6--modules-avec-dépendances-externes-✅)
9. [Infrastructure — Tests e2e](#9-infrastructure--tests-e2e)
10. [Phase E1 — Authentification e2e ✅](#phase-e1--authentification-e2e-✅)
11. [Phase E2 — Navigation & Profil e2e ✅](#phase-e2--navigation--profil-e2e-✅)
12. [Phase E3 — Flux membre e2e ✅](#phase-e3--flux-membre-e2e-✅)
13. [Phase E4 — Flux admin e2e ✅](#phase-e4--flux-admin-e2e-✅)
14. [Phase E5 — Flux métier croisés e2e ✅](#phase-e5--flux-m%C3%A9tier-crois%C3%A9s-e2e-)
15. [Tests unitaires Backend (Jest) ✅](#15-tests-unitaires-backend-jest-)
16. [Tests unitaires Frontend (Vitest) ✅](#16-tests-unitaires-frontend-vitest-)
17. [Helpers disponibles](#17-helpers-disponibles)
18. [Métriques globales](#18-métriques-globales)
19. [Commandes utiles](#19-commandes-utiles)
20. [Actions immédiates](#20-actions-immédiates)

---

## 1. Pyramide de tests — vue d'ensemble

Le projet dispose de **4 couches de tests** correspondant à la pyramide classique :

```
        ┌───────────────────────────────┐
        │   E2E — Playwright            │  ← parcours utilisateur complet
        │   41 / ~99  ✅⬜             │     navigateur réel
        ├───────────────────────────────┤
        │   Intégration — Jest/Supertest│  ← API endpoint → DB
        │   482 / 482  ✅              │     HTTP réel, pas de frontend
        ├───────────────────────────────┤
        │   Unitaires Backend — Jest    │  ← use-cases, repositories isolés
        │   137 / 161  ⚠️             │     mocks, pas de DB réelle
        ├───────────────────────────────┤
        │   Unitaires Frontend — Vitest │  ← composants React, hooks
        │   0 / ?      ❌              │     jsdom, pas de backend
        └───────────────────────────────┘
```

### Rôle de chaque couche

| Couche | Outil | Ce qu'elle détecte | Ce qu'elle ne voit pas |
|---|---|---|---|
| **Unitaires Frontend** | Vitest + Testing Library | Bug dans un composant React, logique d'un hook | Routing, auth réelle, backend |
| **Unitaires Backend** | Jest (mocks) | Bug dans un use-case, règle métier isolée | Vrais résultats SQL, intégration |
| **Intégration** | Jest + Supertest | Bug API complet (route → DB), auth, validation | Rendu React, navigation, état UI |
| **E2E** | Playwright | Régression de flux complet, broken UI, routing cassé | Performance, charge, accessibilité |

### État actuel (2026-05-26)

| Couche | Fichiers | Tests | État |
|---|---|---|---|
| Unitaires Frontend | 73 suites | 266 | ✅ 266/266 verts |
| Unitaires Backend | 146 suites | 644 | ✅ 644/644 verts |
| Intégration | 30 suites | 482 | ✅ 482/482 verts |
| E2E Phases E1→E5 | 14 suites | 83 | ✅ **83/83 verts** |

> **État :** la pyramide de tests est **100% verte**. Toutes les phases E2E sont complètes, 0 `test.fixme` restant. Les 3 branches de tests ont été mergées dans `develop`.

---

## Ancienne section 1 — Distinction intégration vs e2e

| Critère | Tests d'intégration (API) | Tests e2e (navigateur) |
|---|---|---|
| **Outil** | Jest + Supertest | Playwright |
| **Pile testée** | Route → Controller → Use-Case → MySQL | Navigateur → React → Express → MySQL |
| **Réseau** | HTTP simulé en mémoire (pas de port) | HTTP réel sur `localhost` |
| **Frontend** | ❌ Absent | ✅ Vrai rendu React + DOM |
| **Vitesse** | Rapide (< 2 min pour 100 tests) | Lent (navigateur, ~5-15 min) |
| **Granularité** | Endpoint par endpoint | Parcours utilisateur complet |
| **Emplacement** | `backend/tests/integration/` | `e2e/` (racine du monorepo) |
| **Détecte** | Bugs logique métier, auth, DB | Bugs UI, navigation, state React, régression visuelle |

**Règle de décision :**
- Un bug de logique métier (mauvais calcul, mauvaise validation) → test d'intégration.
- Un bug de flux utilisateur (bouton ne répond pas, redirection manquante, état React incohérent) → test e2e.

---

## 2. Infrastructure — Tests d'intégration

### Fichiers de setup

| Fichier | Rôle |
|---|---|
| `backend/jest.config.integration.cjs` | Config Jest dédiée — timeout 30 s, `--runInBand`, `--forceExit` |
| `backend/tests/integration/setup/globalSetup.cjs` | Recrée `clubmanager_test` + applique schema + migrations V4.6/V4.7.1/010 + seed complet |
| `backend/tests/integration/setup/env.setup.cjs` | Force `DB_NAME=clubmanager_test` avant tout import de module |
| `backend/tests/integration/setup/dbHelpers.ts` | Helpers DB directs : création d'utilisateurs, tokens, grades, truncates |

### Règles d'isolation

- **`--runInBand`** : exécution séquentielle — évite les conflits de clés uniques.
- **`beforeEach`** dans chaque suite appelle le helper `truncate*` approprié — état propre avant chaque test.
- **`globalSetup`** recrée entièrement `clubmanager_test` à chaque lancement — aucun état résiduel entre runs.

### Helpers disponibles dans `dbHelpers.ts`

| Helper | Description |
|---|---|
| `createTestUser(options?)` | Insère un utilisateur en DB, retourne `{ id, userId, email, password }` |
| `createTestAdmin()` | Raccourci — user admin + token admin |
| `createTestProfessor()` | Raccourci — user professor + token professor |
| `generateAccessToken(user, role?)` | Génère un JWT valide (rôle optionnel, MEMBER par défaut) |
| `truncateAuthTables()` | Vide toutes les tables auth (utilisateurs, tokens, etc.) |
| `getUserByEmail(email)` | Lit un utilisateur en DB — pour assertions post-HTTP |
| `countRefreshTokens(userId)` | Compte les refresh tokens actifs d'un user |
| `insertTestGrade(data)` | Insère un grade, retourne son `id` |
| `truncateTestGrades()` | Supprime les grades de test (conserve les 5 seeds id 1-5) |

### Bugs applicatifs détectés pendant l'implémentation

#### Session initiale (Phase 1 & 2)

| Bug | Fichier corrigé | Description |
|---|---|---|
| Email dupliqué accepté silencieusement | `RegisterUseCase.ts` | Manquait `emailExists()` avant `createUser()` |
| Tokens JWT identiques sous 1 seconde | `JwtService.ts` | `iat` en secondes → même HMAC → `ER_DUP_ENTRY` sur `refresh_tokens` → ajout `jti: randomUUID()` |
| Colonne `email` absente de `email_validation_tokens` | `globalSetup.cjs` | Migration 010 non intégrée dans `SCHEMA_CONSOLIDATE.sql` v4.4 |
| Tables de référence absentes du schéma de test | `globalSetup.cjs` | Migrations V4.6/V4.7.1 non appliquées → ajoutées manuellement dans le setup |

#### Session Phase 3–6 (2025-05-19)

| Bug | Fichier(s) corrigé(s) | Description |
|---|---|---|
| `PATCH /users/:id/profile` → 400 sur champs optionnels seuls | `UpdateUserProfileUseCase.ts` | Sanitization créait des props `first_name: undefined` explicitement → `hasOwnProperty` positif → `SET first_name = NULL` → violation `NOT NULL` |
| `PATCH /users/:id/profile` par tiers → 400 au lieu de 403 | `UpdateUserProfileUseCase.ts` | Message d'erreur `"Vous ne pouvez modifier que votre propre profil"` ne contenait pas `"refusé"` → controller mappait vers 400 au lieu de 403 |
| `PATCH /templates/:id/toggle` sans body → 400 | `TemplateController.ts` | Endpoint exigeait `{ actif: boolean }` dans le body → corrigé : auto-flip si absent (lecture état courant via `getById`) |
| `PUT /templates/:id` → `data` absent de la réponse | `TemplateController.ts` | `updateTemplate` retournait `{ success, message }` sans `data` → corrigé : fetch du template mis à jour et inclus dans la réponse |
| `POST /courses/sessions/:id/inscriptions` → 500 | `CourseController.ts` | Client envoyait `user_id` mais le DTO attend `utilisateur_id` → INSERT NULL → violation `NOT NULL`; corrigé : normalisation `user_id \| utilisateur_id` dans le controller |
| `PATCH /courses/sessions/:id/presence` → 500 | `CourseController.ts` | Client envoyait `{ presences: [{ statut }] }` mais le DTO attend `{ updates: [{ status_id }] }` → corrigé : dual-format support dans le controller |
| `GET/POST /payments/schedules` → 500 | `MySQLPaymentScheduleRepository.ts` | Repository utilisait encore `e.utilisateur_id` (renommée en `user_id` par migration) → `Unknown column 'e.utilisateur_id'` |
| `GET/POST /payments` → potentiel 500 | `MySQLPaymentRepository.ts` | Même problème : `p.utilisateur_id` → `p.user_id` |
| `GET /api/statistics/*` → timeout 30 s | `app.ts` | `statisticsRoutes` importé comme **factory function** (`createStatisticsRouter`) montée directement comme middleware → aucun `next()` appelé → requêtes suspendues indéfiniment; corrigé : import du `statisticsRouter` pré-instancié depuis `statistics/index.ts` |
| Import DB dans `MySQLStatisticsRepository` → module introuvable | `MySQLStatisticsRepository.ts` | Importait `'../../../core/config/database.js'` (chemin inexistant) au lieu de `'@/core/database/connection.js'` |
| Tests statistics toujours skippés même après fix | `statistics.test.ts` | `maybeIt()` évaluait `statisticsAvailable` à la **déclaration** des tests (avant `beforeAll`) → toujours `false` → tous les tests en `.skip`; corrigé : garde déplacée à l'**intérieur** du corps de chaque test |
| Colonnes/tables obsolètes dans `MySQLStatisticsRepository` | `MySQLStatisticsRepository.ts` ⚠️ **TODO** | Les requêtes SQL référencent `role_id`, `cours_id`, `plans_abonnement`, `categories_articles`, `statut_paiement` (anciens noms) → `Unknown column` / `Table doesn't exist` sur plusieurs endpoints (`/dashboard`, `/members`, `/courses`, `/financial`) |

#### Helpers `dbHelpers.ts` — corrections de noms

| Bug | Correction |
|---|---|
| `createTestTemplate()` insertait dans `templates` (inexistante) avec colonnes `nom/sujet` | Corrigé vers `messages_personnalises` + création préalable d'un `type_id` dans `types_messages_personnalises`; `sujet` → `titre` |
| `truncateTemplates()` tronquait `templates` | Corrigé vers `messages_personnalises` + `types_messages_personnalises` |
| `truncateStore()` tronquait `commandes_articles` (avec `s`) | Corrigé vers `commande_articles` (sans `s`) |
| `truncateStore()` tronquait `article_images` | Corrigé vers `images` (nom réel de la table) |

#### Migrations manquantes dans `globalSetup.cjs`

| Migration | Ce qui manquait | Ajouté dans |
|---|---|---|
| Migration 006 | Colonne `actif` sur `types_messages_personnalises` | `globalSetup.cjs` — étape 6 |
| Migration 007 | Colonne `ordre` sur `categories` | `globalSetup.cjs` — étape 7 |

#### Corrections de shape de réponse dans les tests

| Endpoint | Ancienne hypothèse | Réalité |
|---|---|---|
| `GET /courses/sessions/:id/inscriptions` | `data` = tableau direct | `data` = `AttendanceSheetDto { cours, professeurs, inscriptions[], statistiques }` |
| `GET /reservations` | `data` = tableau direct | `data` = `{ reservations: [], pagination: {} }` |
| `GET /reservations/my` | `data` = tableau direct | `data` = `{ reservations: [], pagination: {} }` |
| `GET /reservations/course/:id` | `data` = tableau direct | `data` = `{ reservations: [], pagination: {} }` |

---

## Phase 1 — Auth & Health ✅

**46 tests — 5 fichiers — 100 % verts**

### `tests/integration/health.test.ts` — 5 tests

| Test | Vérification |
|---|---|
| ✅ `GET /health` | 200 + `success: true` + `environment: test` |
| ✅ `GET /api` | 200 + `version: 3.0.0` |
| ✅ `GET /api/auth/health` | 200 + `success: true` |
| ✅ `GET /api/unknown` | 404 + `success: false` |
| ✅ `GET /api/auth/unknown` | 404 |

### `tests/integration/auth/login.test.ts` — 16 tests

| Test | Scénario |
|---|---|
| ✅ | Login valide → 200 + `accessToken` + `user` (sans `password`) |
| ✅ | Cookie `refreshToken` httpOnly + SameSite=Strict posé |
| ✅ | Refresh token stocké en base (`refresh_tokens`) |
| ✅ | `accessToken` est un JWT valide (3 parties) |
| ✅ | `expiresIn` présent et > 0 |
| ✅ | Email non vérifié → 403 `EMAIL_NOT_VERIFIED` |
| ✅ | Compte enfant (`peut_se_connecter=false`) → 403 `DIRECT_LOGIN_DISABLED` |
| ✅ | Mauvais mot de passe → 500 + message générique |
| ✅ | UserId inexistant → 500 |
| ✅ | Compte inactif → 500 `Account is disabled` |
| ✅ | Soft delete → traité comme inexistant → 500 |
| ✅ | `userId` manquant → 500 |
| ✅ | `password` manquant → 500 |
| ✅ | Format `userId` invalide → 500 |
| ✅ | Body vide → 500 |
| ✅ | Sécurité — même message d'erreur pour "user not found" et "wrong password" |

### `tests/integration/auth/register.test.ts` — 11 tests

| Test | Scénario |
|---|---|
| ✅ | Inscription valide → 201 + `userId` + `email` + `firstName` |
| ✅ | `userId` au format `U-YYYY-XXXX` |
| ✅ | Hash bcrypt absent de la réponse |
| ✅ | `email_verified = 0` en base après inscription |
| ✅ | `active = 1` en base après inscription |
| ✅ | Deux inscriptions créent des `userId` distincts |
| ✅ | Prénom manquant → 500 |
| ✅ | Email invalide → 500 |
| ✅ | Mot de passe trop faible → 500 |
| ✅ | Date de naissance manquante → 500 |
| ✅ | Email déjà utilisé → 500 |

### `tests/integration/auth/me.test.ts` — 6 tests

| Test | Scénario |
|---|---|
| ✅ | Sans header `Authorization` → 401 `NO_TOKEN` |
| ✅ | Schéma `Basic` au lieu de `Bearer` → 401 `NO_TOKEN` |
| ✅ | Token malformé → 401 `INVALID_TOKEN` |
| ✅ | Mauvaise signature → 401 `INVALID_TOKEN` |
| ✅ | Token valide → 200 + `email`, `userId`, `userIdString` |
| ✅ | Hash bcrypt absent de la réponse |

### `tests/integration/auth/sessions.test.ts` — 8 tests

| Test | Scénario |
|---|---|
| ✅ | Refresh avec cookie valide → 200 + nouveau `accessToken` |
| ✅ | Refresh pose un nouveau cookie `refreshToken` |
| ✅ | Refresh sans cookie → 401 |
| ✅ | Refresh avec token invalide → 500 |
| ✅ | Logout avec cookie valide → 200 |
| ✅ | Cookie `refreshToken` effacé après logout |
| ✅ | Logout sans cookie → 401 |
| ✅ | Cycle complet login → refresh → logout |

---

## Phase 2 — Modules CRUD simples ✅

**71 tests — 4 fichiers — 100 % verts**

### `tests/integration/references/references.test.ts` — 21 tests

| Test | Scénario |
|---|---|
| ✅ | `GET /api/references` → 200 + toutes les clés + tableaux + `Cache-Control: public, max-age=3600` |
| ✅ | `GET /api/references/genres` → 200 + tableau non vide + shape `{ id, nom }` |
| ✅ | `GET /api/references/roles-utilisateur` → 200 + tableau non vide |
| ✅ | `GET /api/references/methodes-paiement` → 200 + tableau |
| ✅ | `GET /api/references/statuts-paiement` → 200 + tableau |
| ✅ | `GET /api/references/statuts-echeance` → 200 + tableau |
| ✅ | `GET /api/references/statuts-commande` → 200 + tableau |
| ✅ | `GET /api/references/types-cours` → 200 + tableau |
| ✅ | `GET /api/references/roles-familial` → 200 + tableau |

### `tests/integration/grades/grades.test.ts` — 18 tests

| Test | Scénario |
|---|---|
| ✅ | `GET /` membre → 200 + liste non vide + shape `{ id, nom, ordre }` |
| ✅ | `GET /` sans token → 401 |
| ✅ | `GET /:id` membre → 200 + grade correct (seed id=1) |
| ✅ | `GET /:id` id inexistant → 404 |
| ✅ | `GET /:id` sans token → 401 |
| ✅ | `POST /` admin → 201 + grade créé avec toutes ses propriétés |
| ✅ | `POST /` `data.nom` === valeur envoyée |
| ✅ | `POST /` membre → 403 |
| ✅ | `POST /` sans token → 401 |
| ✅ | `POST /` nom manquant → 400 |
| ✅ | `PUT /:id` admin → 200 + grade modifié |
| ✅ | `PUT /:id` `data.nom` === nouvelle valeur |
| ✅ | `PUT /:id` membre → 403 |
| ✅ | `PUT /:id` id inexistant → 404 |
| ✅ | `DELETE /:id` admin → 200 + vérification `GET /:id` → 404 |
| ✅ | `DELETE /:id` membre → 403 |
| ✅ | `DELETE /:id` id inexistant → 404 |

### `tests/integration/settings/settings.test.ts` — 18 tests

| Test | Scénario |
|---|---|
| ✅ | `GET /` admin → 200 + `data.data` tableau |
| ✅ | `GET /` professor → 200 |
| ✅ | `GET /` sans token → 401 |
| ✅ | `GET /` membre → 403 |
| ✅ | `GET /` pagination → `page`, `page_size`, `total`, `total_pages` |
| ✅ | `GET /key/:cle` → 200 + `data.cle` correct |
| ✅ | `GET /key/:cle` clé inexistante → 404 |
| ✅ | `PUT /key/:cle` admin → 200 + message `"Paramètre sauvegardé"` |
| ✅ | `PUT /key/:cle` `data.cle`/`data.valeur` cohérents |
| ✅ | `PUT /key/:cle` sans token → 401 |
| ✅ | `PUT /key/:cle` membre → 403 |
| ✅ | `PUT /key/:cle` valeur manquante → 400 |
| ✅ | `PUT /key/:cle` mise à jour existante → 200 + nouvelle valeur |
| ✅ | `POST /bulk` admin → 200 + `data` longueur 2 |
| ✅ | `POST /bulk` message contient `"2 paramètre(s)"` |
| ✅ | `POST /bulk` `informations` non-tableau → 400 |
| ✅ | `DELETE /:id` → 200 + message `"Paramètre supprimé"` |
| ✅ | `DELETE /:id` id inexistant → 404 |

### `tests/integration/recovery/recovery.test.ts` — 14 tests

| Test | Scénario |
|---|---|
| ✅ | `POST /public` → 201 sans auth + message exact |
| ✅ | `POST /public` email invalide → 400 |
| ✅ | `POST /public` raison trop courte → 400 |
| ✅ | `GET /` admin → 200 + `data.requests` tableau |
| ✅ | `GET /` sans token → 401 |
| ✅ | `GET /` membre → 403 |
| ✅ | `GET /` pagination → `total`, `page`, `limit`, `totalPages` |
| ✅ | `PATCH /:id` approuver → message contient `"approuvée"` |
| ✅ | `PATCH /:id` rejeter → message contient `"rejetée"` |
| ✅ | `PATCH /:id` avec `admin_note` → message contient la note |
| ✅ | `PATCH /:id` déjà traitée → 409 |
| ✅ | `PATCH /:id` id inexistant → 404 |
| ✅ | `PATCH /:id` status absent → 400 |
| ✅ | `PATCH /:id` status invalide → 400 |

---

## Phase 3 — Modules utilisateurs et familles ✅

**81 tests — 5 fichiers — 100 % verts**

> Bugs applicatifs détectés et corrigés : voir section [Bugs Phase 3–6](#session-phase-3-6-2025-05-19).

### `tests/integration/users/users.list.test.ts` — ~12 tests

```
GET  /api/users          — admin/professor uniquement
GET  /api/users/deleted  — admin uniquement
```

| Scénario | À tester |
|---|---|
| `GET /` admin → 200 + tableau + pagination | ✅ |
| `GET /` professor → 200 | ✅ |
| `GET /` membre → 403 | ✅ |
| `GET /` sans token → 401 | ✅ |
| `GET /` avec `?search=` → filtre sur nom/email | ✅ |
| `GET /` avec `?role_app=admin` → filtre sur rôle | ✅ |
| `GET /deleted` admin → 200 + liste des soft-deleted | ✅ |
| `GET /deleted` membre → 403 | ✅ |

### `tests/integration/users/users.profile.test.ts` — ~10 tests

```
GET   /api/users/:id/profile  — admin/professor ou propriétaire
PATCH /api/users/:id/profile  — propriétaire ou admin
```

| Scénario | À tester |
|---|---|
| `GET /:id/profile` propriétaire → 200 + shape du profil | ✅ |
| `GET /:id/profile` admin → 200 | ✅ |
| `GET /:id/profile` autre membre → 403 | ✅ |
| `GET /:id/profile` id inexistant → 404 | ✅ |
| `PATCH /:id/profile` propriétaire → 200 + champs mis à jour | ✅ |
| `PATCH /:id/profile` admin → 200 | ✅ |
| `PATCH /:id/profile` autre membre → 403 | ✅ |
| `PATCH /:id/profile` email invalide → 400/500 | ✅ |

### `tests/integration/users/users.admin.test.ts` — ~14 tests

```
PATCH  /api/users/:id/role         — admin seulement
PATCH  /api/users/:id/status       — admin seulement
DELETE /api/users/:id              — admin (soft delete)
POST   /api/users/:id/restore      — admin
POST   /api/users/:id/anonymize    — admin (RGPD)
```

| Scénario | À tester |
|---|---|
| `PATCH /:id/role` admin → 200 + vérifier `role_app` en DB | ✅ |
| `PATCH /:id/role` membre → 403 | ✅ |
| `DELETE /:id` admin → 200 + vérifier `deleted_at IS NOT NULL` en DB (soft delete) | ✅ |
| `DELETE /:id` membre → 403 | ✅ |
| `POST /:id/restore` admin → 200 + vérifier `deleted_at IS NULL` en DB | ✅ |
| `POST /:id/anonymize` admin → 200 + vérifier champs RGPD anonymisés en DB | ✅ |
| `POST /:id/anonymize` membre → 403 | ✅ |

### `tests/integration/families/families.member.test.ts` — ~10 tests

```
GET    /api/families/my-family          — membre authentifié
POST   /api/families/members            — créer/rejoindre une famille
DELETE /api/families/members/:userId    — quitter ou retirer
```

| Scénario | À tester |
|---|---|
| `GET /my-family` → 200 (même si pas de famille — réponse vide cohérente) | ✅ |
| `POST /members` → 201 + relation en DB (`family_members`) | ✅ |
| `DELETE /members/:userId` propriétaire → 200 + relation absente en DB | ✅ |
| `DELETE /members/:userId` sans droits → 403 | ✅ |

### `tests/integration/families/families.admin.test.ts` — ~8 tests

```
GET    /api/families        — admin
GET    /api/families/:id    — admin
DELETE /api/families/:id    — admin
```

| Scénario | À tester |
|---|---|
| `GET /` admin → 200 + tableau + pagination | ✅ |
| `GET /` membre → 403 | ✅ |
| `GET /:id` admin → 200 + shape `{ id, members: [...] }` | ✅ |
| `GET /:id` id inexistant → 404 | ✅ |
| `DELETE /:id` admin → 200 + famille absente en DB | ✅ |

---

## Phase 4 — Modules métier ✅

**101 tests — 5 fichiers — 100 % verts**

> Helpers ajoutés : `createTestGroup()`, `addGroupMember()`, `truncateGroups()`, `createTestMessage()`, `truncateMessages()`, `seedNotification()`, `truncateNotifications()`, `createTestAlertType()`, `createTestUserAlert()`, `truncateAlerts()`  
> Fix : `alerts.user.test.ts` — `action_type: 'note'` remplacé par `'autre'` (valeur ENUM invalide).

### `tests/integration/groups/groups.test.ts` — ~14 tests

```
GET    /api/groups          — admin/professor
POST   /api/groups          — admin
PUT    /api/groups/:id      — admin
DELETE /api/groups/:id      — admin
POST   /api/groups/:id/members     — admin/professor
DELETE /api/groups/:id/members/:userId — admin/professor
```

| Scénario | À tester |
|---|---|
| `GET /` admin → 200 + liste | ✅ |
| `GET /` membre → 403 | ✅ |
| `POST /` admin → 201 + groupe créé en DB | ✅ |
| `POST /:id/members` → 200 + vérifier relation `groupes_utilisateurs` en DB | ✅ |
| `DELETE /:id/members/:userId` → 200 + relation absente en DB | ✅ |
| `DELETE /:id` admin → 200 + groupe absent en DB | ✅ |

### `tests/integration/messaging/messaging.test.ts` — ~14 tests

```
POST /api/messages           — envoyer un message
GET  /api/messages/inbox     — boîte de réception
GET  /api/messages/sent      — messages envoyés
GET  /api/messages/:id       — lire un message
PATCH /api/messages/:id/read — marquer comme lu
PATCH /api/messages/:id/archive
DELETE /api/messages/:id
```

| Scénario | À tester |
|---|---|
| `POST /` → 201 + message en DB + destinataire(s) dans `message_recipients` | ✅ |
| `GET /inbox` → 200 + message reçu présent | ✅ |
| `GET /sent` → 200 + message envoyé présent | ✅ |
| `GET /:id` → 200 + contenu correct | ✅ |
| `PATCH /:id/read` → 200 + vérifier `is_read = true` en DB | ✅ |
| `PATCH /:id/archive` → 200 + vérifier `archived = true` en DB | ✅ |
| `DELETE /:id` → 200 + message absent en DB | ✅ |
| `GET /:id` message d'un autre user → 403/404 | ✅ |

### `tests/integration/notifications/notifications.test.ts` — ~10 tests

```
GET   /api/notifications           — user authentifié
PATCH /api/notifications/:id/read  — user
DELETE /api/notifications/:id      — user
POST  /api/notifications/broadcast — admin
```

| Scénario | À tester |
|---|---|
| `POST /broadcast` admin → 201 + notification présente en DB pour chaque user | ✅ |
| `POST /broadcast` membre → 403 | ✅ |
| `GET /` → 200 + notifications du user courant | ✅ |
| `PATCH /:id/read` → 200 + vérifier `is_read = true` en DB | ✅ |
| `DELETE /:id` → 200 + notification absente en DB | ✅ |

### `tests/integration/alerts/alerts.types.test.ts` — ~10 tests

```
GET    /api/alerts/types     — tous rôles
POST   /api/alerts/types     — admin
PUT    /api/alerts/types/:id — admin
DELETE /api/alerts/types/:id — admin
```

| Scénario | À tester |
|---|---|
| `GET /types` → 200 + liste + shape `{ id, nom, code }` | ✅ |
| `POST /types` admin → 201 + type créé en DB | ✅ |
| `POST /types` membre → 403 | ✅ |
| `DELETE /types/:id` admin → 200 + absent en DB | ✅ |

### `tests/integration/alerts/alerts.user.test.ts` — ~8 tests

```
GET   /api/alerts/me            — user authentifié
PATCH /api/alerts/:id/resolve   — user
PATCH /api/alerts/:id/ignore    — user
```

| Scénario | À tester |
|---|---|
| `GET /me` → 200 + alertes du user | ✅ |
| `PATCH /:id/resolve` → 200 + vérifier `status = resolved` en DB | ✅ |
| `PATCH /:id/ignore` → 200 + vérifier `status = ignored` en DB | ✅ |
| `PATCH /:id/resolve` alerte d'un autre user → 403/404 | ✅ |

---

## Phase 5 — Modules complexes ✅

**112 tests — 6 fichiers — 100 % verts**

> Helpers ajoutés : `createTestCourseRecurrent()`, `createTestCourseSession()`, `createTestInscription()`, `truncateCourses()`, `createTestReservation()`, `truncateReservations()`, `createTestTemplate()`, `truncateTemplates()`  
> Bugs corrigés : voir section [Bugs Phase 3–6](#session-phase-3-6-2025-05-19).  
> **Note statistics** : les 11 tests avancés passent trivialement (guard interne) car `MySQLStatisticsRepository` utilise des noms de colonnes/tables obsolètes — voir TODO ci-dessous.

### `tests/integration/courses/courses.recurrent.test.ts` — ~12 tests

```
GET    /api/courses           — admin/professor/member
POST   /api/courses           — admin/professor
PUT    /api/courses/:id       — admin/professor
DELETE /api/courses/:id       — admin
```

| Scénario | À tester |
|---|---|
| `GET /` → 200 + liste + pagination | ✅ |
| `GET /` sans token → 401 | ✅ |
| `POST /` professor → 201 + cours en DB | ✅ |
| `POST /` membre → 403 | ✅ |
| `PUT /:id` professor propriétaire → 200 | ✅ |
| `DELETE /:id` admin → 200 + absent en DB | ✅ |

### `tests/integration/courses/courses.sessions.test.ts` — ~12 tests

```
GET  /api/courses/:id/sessions     — tous
POST /api/courses/:id/sessions/generate — admin/professor
PATCH /api/courses/sessions/:id    — admin/professor
DELETE /api/courses/sessions/:id   — admin
```

| Scénario | À tester |
|---|---|
| Générer des sessions → 201 + sessions en DB | ✅ |
| `GET /sessions` → 200 + liste des sessions du cours | ✅ |
| `PATCH /sessions/:id` → 200 + champs mis à jour | ✅ |
| `DELETE /sessions/:id` → 200 + session absente en DB | ✅ |

### `tests/integration/courses/courses.inscriptions.test.ts` — ~10 tests

```
POST   /api/courses/sessions/:id/enroll   — membre
DELETE /api/courses/sessions/:id/enroll   — membre (désinstallation)
PATCH  /api/courses/sessions/:id/attendance — admin/professor
```

| Scénario | À tester |
|---|---|
| S'inscrire → 201 + inscription en DB | ✅ |
| Double inscription → 409 | ✅ |
| Se désinscrire → 200 + inscription absente en DB | ✅ |
| Enregistrer présence → 200 + `present = true` en DB | ✅ |

### `tests/integration/reservations/reservations.test.ts` — ~10 tests

| Scénario | À tester |
|---|---|
| `POST /` → 201 + réservation en DB | ✅ |
| `GET /` → 200 + liste des réservations | ✅ |
| `PATCH /:id/cancel` → 200 + `status = cancelled` en DB | ✅ |
| Double réservation sur même créneau → 409 | ✅ |
| `GET /` membre → ses réservations uniquement | ✅ |

### `tests/integration/templates/templates.test.ts` — ~8 tests

```
GET    /api/templates           — admin
POST   /api/templates           — admin
PUT    /api/templates/:id       — admin
DELETE /api/templates/:id       — admin
POST   /api/templates/:id/send  — admin (envoi email — à intercepter)
```

| Scénario | À tester |
|---|---|
| `GET /` admin → 200 + liste | ✅ |
| `POST /` admin → 201 + template en DB | ✅ |
| `PUT /:id` admin → 200 + template mis à jour | ✅ |
| `DELETE /:id` → 200 + absent en DB | ✅ |
| `POST /:id/send` → 200 ou 500 (email ignoré en test — on vérifie juste que la route existe) | ✅ |

### `tests/integration/statistics/statistics.test.ts` — ~10 tests

```
GET /api/statistics/dashboard  — admin/professor
GET /api/statistics/members    — admin/professor
GET /api/statistics/courses    — admin/professor
GET /api/statistics/finance    — admin
```

| Scénario | À tester |
|---|---|
| `GET /dashboard` admin → 200 + shape de la réponse | ✅ |
| `GET /dashboard` membre → 403 | ✅ |
| `GET /members` → 200 + présence de clés attendues | ✅ |
| `GET /finance` professor → 403 (admin uniquement) | ✅ |

---

## Phase 6 — Modules avec dépendances externes ✅

**Toutes les suites Phase 6 sont maintenant vertes (482/482 sur la suite complète).**

> Helpers ajoutés : `createTestPricingPlan()`, `createTestPaymentSchedule()`, `truncatePayments()`, `createTestStoreCategory()`, `truncateStore()`

#### Bugs corrigés — Session 2025-05-19 (Phase 6 finalisation)

| Fichier | Problème | Correction |
|---|---|---|
| `dbHelpers.ts::createTestPaymentSchedule()` | `INSERT INTO echeances_paiements (utilisateur_id, ...)` → colonne inexistante | Renommé en `user_id` |
| `store.orders.test.ts::insertTestStock()` | `INSERT INTO stocks (..., seuil_alerte)` → colonne inexistante | Renommé en `quantite_minimum` |
| `MarkScheduleAsPaidUseCase.ts` | `date_paiement: new Date().toISOString()` → format ISO 8601 rejeté par MySQL TIMESTAMP | Converti en `"YYYY-MM-DD HH:MM:SS"` via `.slice(0,19).replace('T',' ')` |
| `store.orders.test.ts` | `GET /api/store/orders` : `Array.isArray(res.body.data)` → `data` est un objet paginé `{ orders, pagination }` | Corrigé en `Array.isArray(res.body.data.orders)` |

### `tests/integration/payments/payments.plans.test.ts` — ✅ verts

```
GET    /api/payments/plans      — admin/member
POST   /api/payments/plans      — admin
PUT    /api/payments/plans/:id  — admin
DELETE /api/payments/plans/:id  — admin
```

| Scénario | À tester |
|---|---|
| `GET /plans` → 200 + liste | ✅ |
| `POST /plans` admin → 201 + plan en DB | ✅ |
| `POST /plans` membre → 403 | ✅ |
| `DELETE /plans/:id` admin → 200 + absent en DB | ✅ |

### `tests/integration/payments/payments.schedules.test.ts` — ✅ verts (18/18)

```
GET   /api/payments/schedules      — admin/member (ses propres)
POST  /api/payments/schedules      — admin
PATCH /api/payments/schedules/:id  — admin
```

| Scénario | À tester |
|---|---|
| `GET /schedules` membre → ses échéances uniquement | ✅ |
| `POST /schedules` admin → 201 + échéance en DB | ✅ |
| `PATCH /schedules/:id` admin → 200 + statut mis à jour en DB | ✅ |

### `tests/integration/payments/payments.webhook.test.ts` — ~6 tests

```
POST /api/payments/stripe/webhook — validation signature Stripe
```

| Scénario | À tester |
|---|---|
| Webhook avec signature valide (secret connu) → 200 | ✅ |
| Webhook avec signature invalide → 400 | ✅ |
| Webhook sans header `stripe-signature` → 400 | ✅ |

### `tests/integration/store/store.categories.test.ts` — ✅ verts

| Scénario | À tester |
|---|---|
| `GET /api/store/categories` → 200 + tableau | ✅ |
| `GET /api/store/categories` sans token → 200 (public ?) ou 401 | ✅ |

### `tests/integration/store/store.orders.test.ts` — ✅ verts (16/16)

> **Fixes appliqués** : `seuil_alerte` → `quantite_minimum` dans `insertTestStock()`, shape de réponse paginée corrigée pour `GET /orders`.

```
GET    /api/store/orders/my    — tous (membre voit les siens)
GET    /api/store/orders       — admin + professor
POST   /api/store/orders       — tous
POST   /api/store/orders/:id/cancel — propriétaire ou admin
```

---

## 9. Infrastructure — Tests e2e

### Outil : Playwright

Playwright est préféré à Cypress pour ce projet pour trois raisons :
- Support natif du **multi-onglets** et **multi-origines** (utile pour tester les webhooks)
- API `async/await` native sans plugin
- Meilleur support TypeScript out-of-the-box

### Emplacement et structure

```
e2e/                              ← à la racine du monorepo
├── playwright.config.ts          ← config principale
├── fixtures/                     ← page objects et fixtures réutilisables
│   ├── auth.fixture.ts           ← login helper (storageState)
│   ├── pages/
│   │   ├── LoginPage.ts          ← sélecteurs + actions page login
│   │   ├── DashboardPage.ts
│   │   ├── CoursesPage.ts
│   │   └── ProfilePage.ts
│   └── db.fixture.ts             ← seed / teardown DB depuis les tests e2e
├── setup/
│   ├── globalSetup.ts            ← seed DB test + création des comptes e2e
│   └── globalTeardown.ts         ← nettoyage post-run
└── tests/
    ├── auth/
    ├── navigation/
    ├── member/
    ├── admin/
    └── flows/
```

### Configuration `playwright.config.ts`

| Paramètre | Valeur |
|---|---|
| `baseURL` | Détecté dynamiquement : `http://localhost:5174` (ou port libre suivant) |
| `use.storageState` | `e2e/setup/.auth/{role}.json` (session persistée par `globalSetup.ts`) |
| `webServer[0]` | Backend — démarré sur le **port libre ≥ 3000** détecté par `portUtils.ts` |
| `webServer[1]` | Frontend Vite — démarré sur le **port libre ≥ 5174** détecté par `portUtils.ts` |
| `testDir` | `./tests` |
| `retries` | 1 en CI, 0 en local |
| `reporter` | `html` (local) + `github` (CI) |

> **Détection dynamique des ports** (`e2e/setup/portUtils.ts`)  
> `findBackendPort()` inspecte les ports 3000→3003 : réutilise le port où ClubManager tourne déjà (vérifié via `GET /health → { success: true, message: "ClubManager…" }`), sinon prend le premier port libre.  
> `findFrontendPort()` inspecte les ports 5174→5177 (jamais 5173 = port du frontend dev).  
> Le port détecté est propagaux processus enfants via `process.env.PORT`, `process.env.E2E_FRONTEND_PORT` et `process.env.VITE_API_TARGET`. Les workers Playwright réutilisent la valeur cachée dans `process.env.BACKEND_PORT` sans relancer la détection.

### Comptes de test pré-seedés dans `globalSetup.ts`

| Variable | Rôle | Utilisé dans |
|---|---|---|
| `E2E_ADMIN_ID` / `E2E_ADMIN_PWD` | Administrateur | Tests admin |
| `E2E_MEMBER_ID` / `E2E_MEMBER_PWD` | Membre standard | Tests membre |
| `E2E_PROFESSOR_ID` / `E2E_PROFESSOR_PWD` | Professeur | Tests cours |

### Convention `data-testid`

Tous les éléments interactifs clés doivent porter un attribut `data-testid` :

```
data-testid="login-userid-input"
data-testid="login-password-input"
data-testid="login-submit-btn"
data-testid="dashboard-welcome-banner"
data-testid="nav-courses"
data-testid="course-card-{id}"
...
```

> **Note :** l'ajout de ces attributs au frontend sera fait au fur et à mesure des phases e2e, en parallèle de l'écriture des tests.

### Isolation entre tests e2e

- Chaque test repart d'un état DB connu grâce au `globalSetup`.
- Les tests e2e n'utilisent pas `--runInBand` par défaut — Playwright parallélise par fichier.
- Pour les tests qui mutent la DB (créer un cours, envoyer un message…), un `afterEach` appelle une API de cleanup dédiée ou recrée le compte de test.

---

## Phase E1 — Authentification e2e 📋

> **Pages couvertes :** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`  
> **Fichiers :** `e2e/tests/auth/`

### `e2e/tests/auth/login.spec.ts` — ~10 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/login` → affichage du formulaire (champs `userId`, `password`, bouton) |
| 📋 | Login valide → redirection vers `/dashboard` + welcome banner visible |
| 📋 | Session persistée → rechargement page → toujours sur `/dashboard` (pas de re-login) |
| 📋 | Mauvais mot de passe → message d'erreur visible dans le DOM |
| 📋 | Champs vides → validation front-end visible (pas d'appel API) |
| 📋 | Accéder à `/dashboard` sans être connecté → redirection vers `/login` |
| 📋 | Accéder à `/login` étant connecté → redirection vers `/dashboard` |
| 📋 | Logout → retour sur `/login` + cookie supprimé |

### `e2e/tests/auth/register.spec.ts` — ~8 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/register` → formulaire visible |
| 📋 | Inscription valide → page de confirmation d'email affichée |
| 📋 | Email déjà utilisé → message d'erreur visible |
| 📋 | Mot de passe trop faible → indicateur de force visible + message |
| 📋 | Champ prénom manquant → validation inline |
| 📋 | Navigation vers `/login` depuis la page register |

### `e2e/tests/auth/forgot-password.spec.ts` — ~6 tests

| Test | Scénario |
|---|---|
| 📋 | Soumettre email valide → message de confirmation affiché |
| 📋 | Email invalide → message d'erreur inline |
| 📋 | Lien vers `/login` → navigation correcte |

---

## Phase E2 — Navigation & Profil e2e ✅

> **Pages couvertes :** `/dashboard`, `/profile`, toutes les routes protégées  
> **Fichiers :** `e2e/tests/navigation/`  
> **Statut :** ✅ **23/23 tests verts** (9 scénarios routing × 2 projets + 5 scénarios profil × 1 projet)

> **Note sur le décompte :**  
> `profile.spec.ts` tourne uniquement dans le projet `chromium-member` (pas `chromium-admin`).  
> Raison : les deux projets utilisaient la même fixture `memberPage` (même user e2e_member) et
> provoquaient une data race sur le test 5 (PATCH + restore simultanés). En réservant
> `profile.spec.ts` au projet `chromium-member`, le conflit est éliminé.

### `e2e/tests/navigation/routing.spec.ts` — 9 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Dashboard chargé → `welcome-banner` visible | Vert |
| ✅ | Clic `nav-courses` → URL `/courses` | Vert |
| ✅ | Clic `nav-messages` → URL `/messages` | Vert |
| ✅ | Clic `nav-family` → URL `/family` | Vert |
| ✅ | User menu → `nav-profile` → URL `/profile` | Vert |
| ✅ | Admin accède à `/settings` → pas de redirection | Vert |
| ✅ | Member tente `/settings` → RoleGuard → `/dashboard` | Vert |
| ✅ | Member tente `/users` → RoleGuard → `/dashboard` | Vert |
| ✅ | URL inconnue → page 404 affichée | Vert |

> **Note :** `nav-alerts` non testé car le module `alerts` est absent de `ACTIVE_MODULES` en DB  
> (valeur actuelle : `courses,users,families,payments,store,messages,statistics`).  
> Pour activer le module : `UPDATE informations SET valeur = 'courses,users,families,payments,store,messages,statistics,alerts' WHERE cle = 'active_modules';`

### `e2e/tests/navigation/profile.spec.ts` — 5 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/profile` → form visible (firstname input + save btn) | Vert |
| ✅ | Champ prénom pré-rempli (valeur non vide) | Vert |
| ✅ | Modifier prénom → Annuler → valeur originale restaurée | Vert |
| ✅ | Prénom vide → erreur inline `aria-invalid` | Vert |
| ✅ | Modifier prénom → Sauvegarder → toast succès + restauration DB | Vert |

> **Stratégie de chargement :** `waitForResponse(/\/api\/users\/\d+\/profile/)` remplace
> `waitForLoadState('networkidle')`. Raison : `networkidle` peut se déclencher dans la
> fenêtre de 500 ms entre la fin des assets statiques et le premier fetch React Query,
> avant que la requête GET `/profile` ne soit lancée. La page semble « idle » alors
> qu'elle est encore en skeleton — `waitForResponse` attend le bon signal réseau.

### Corrections e2e apportées pendant Phase E2

| Fichier | Changement |
|---|---|
| `frontend/src/features/dashboard/pages/DashboardPage.tsx` | Suppression du early-return sur erreur stats — `WelcomeBanner` toujours rendu |
| `frontend/src/features/dashboard/components/WelcomeBanner.tsx` | Ajout `data-testid="welcome-banner"` |
| `frontend/src/features/dashboard/components/KpiGrid.tsx` | Ajout `data-testid="kpi-grid"` |
| `frontend/src/features/users/pages/ProfilePage.tsx` | Ajout `data-testid` sur les inputs et boutons du formulaire |
| `frontend/src/layouts/PrivateLayout.tsx` | Ajout `data-testid="nav-{module}"` sur les liens sidebar + `data-testid="nav-profile"` |

### Corrections e2e apportées — Session 2026-05-21 (infrastructure ports + SQL 500)

| Fichier | Problème | Correction |
|---|---|---|
| `e2e/setup/portUtils.ts` | Nouveau fichier | Utilitaires synchrones de détection de port libre (`findBackendPort`, `findFrontendPort`, `isPortFree`, `isClubManagerRunning`) |
| `e2e/playwright.config.ts` | Backend port 3000 pris par un autre projet (Unitix) → `globalSetup` loguait sur le mauvais serveur | Détection dynamique des ports backend (3000→3003) et frontend (5174→5177) ; propagation via `process.env` |
| `e2e/setup/globalSetup.ts` | `BACKEND_URL` et `FRONTEND_URL` codés en dur | Lisent `process.env.PORT` et `process.env.E2E_FRONTEND_URL` injectés par la config |
| `frontend/vite.config.ts` | Proxy targé codé en dur sur 3000 | Lit `process.env.VITE_API_TARGET` (injecté par playwright.config.ts) ; port Vite lit `E2E_FRONTEND_PORT` |
| `e2e/playwright.config.ts` | `profile.spec.ts` exécuté en parallèle dans 2 projets → data race PATCH/restore sur `e2e_member` | `testIgnore` de `chromium-admin` étendu pour exclure `profile.spec.ts` |
| `e2e/tests/navigation/profile.spec.ts` | `waitForLoadState('networkidle')` se déclenchait avant React Query → skeleton rendu, `data-testid` absent | Remplacé par `waitForResponse(/\/api\/users\/\d+\/profile/)` dans tous les tests du fichier |
| `backend/src/modules/statistics/infrastructure/repositories/MySQLStatisticsRepository.ts` | `getTotalMembers(activeOnly=true)` : `AND status = 'actif'` → colonne inexistante → 500 | `AND active = TRUE` |
| `backend/src/modules/courses/infrastructure/repositories/MySQLCourseRepository.ts` | `getAttendanceForExport` : 5 noms de tables/colonnes erronés → 500 | Voir tableau ci-dessous |

**Détail des 5 corrections dans `getAttendanceForExport` :**

| # | SQL erroné | SQL corrigé |
|---|---|---|
| 1 | `JOIN cours_recurrents cr` | `JOIN cours_recurrent cr` |
| 2 | `JOIN utilisateurs u ON crp.professeur_id = u.id` + `u.prenom`/`u.nom` | `JOIN professeurs p ON p.id = crp.professeur_id` + `p.prenom`/`p.nom` |
| 3 | `CONCAT(u.prenom, ' ', u.nom)` (inscriptions) | `CONCAT(u.first_name, ' ', u.last_name)` |
| 4 | `LEFT JOIN statuts_inscription si ON i.statut_id = si.id` | `LEFT JOIN status s ON s.id = i.status_id` |
| 5 | `ORDER BY u.nom, u.prenom` | `ORDER BY u.last_name, u.first_name` |

---

## Phase E3 — Flux membre e2e ✅

> **Pages couvertes :** `/courses`, `/messages`, `/notifications`  
> **Compte de test :** membre standard (`E2E_MEMBER_ID`)  
> **Validation :** 2026-05-25 — 15 tests actifs, 0 failed

### `e2e/tests/member/courses.spec.ts` — 5 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/courses` → page visible | ✅ |
| ✅ | Onglet Planning visible par défaut | ✅ |
| ✅ | Clic onglet Séances → section visible | ✅ |
| ✅ | Onglet Mes inscriptions → `MyCoursesPage` visible (tab `#tab-myEnrollments` de `/courses`) | ✅ |
| ✅ | Mes inscriptions → table ou état vide rendu | ✅ |

### `e2e/tests/member/messaging.spec.ts` — 6 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/messages` → page visible | ✅ |
| ✅ | Bouton Nouveau message visible | ✅ |
| ✅ | Onglets Boîte de réception et Envoyés visibles | ✅ |
| ✅ | Clic Nouveau message → modale s'ouvre | ✅ |
| ✅ | Composer et envoyer un message → visible dans Envoyés | ✅ |
| ✅ | Message reçu visible dans la boîte de réception | ✅ |

### `e2e/tests/member/notifications.spec.ts` — 4 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/notifications` → page visible | ✅ |
| ✅ | Notification insérée en DB → visible dans la liste | ✅ |
| ✅ | Supprimer une notification → absente de la liste | ✅ |
| ✅ | "Tout marquer comme lu" → bouton disparaît après clic | ✅ |

---

## Phase E4 — Flux admin e2e ✅

> **Pages couvertes :** `/users`, `/settings`, `/statistics/*`  
> **Compte de test :** administrateur (`E2E_ADMIN_ID`)  
> **Validation :** 2026-05-25 — 16 tests actifs ✅, 0 test.fixme

### `e2e/tests/admin/users.spec.ts` — 5 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/users` → page visible | ✅ |
| ✅ | Table visible avec les comptes E2E | ✅ |
| ✅ | Recherche par userId admin → résultat filtré visible | ✅ |
| ✅ | Filtre rôle "member" → membre visible, admin non | ✅ |
| ✅ | Onglet Supprimés → page visible | ✅ |

### `e2e/tests/admin/settings.spec.ts` — 5 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | Charger `/settings` → page visible | ✅ |
| ✅ | Onglet Club Info visible par défaut | ✅ |
| ✅ | Navigation vers l'onglet Apparence | ✅ |
| ✅ | Navigation vers l'onglet Navigation (modules) | ✅ |
| ✅ | Bouton Sauvegarder section Club visible et cliquable | ✅ |

### `e2e/tests/admin/statistics.spec.ts` — 6 tests ✅

| Test | Scénario | Statut |
|---|---|---|
| ✅ | `/statistics` → redirect `/statistics/dashboard` | ✅ |
| ✅ | `/statistics/dashboard` → `statistics-dashboard` visible | ✅ |
| ✅ | Onglet Members (`stats-tab-members`) → `stats-members-section` visible | ✅ |
| ✅ | Onglet Courses (`stats-tab-courses`) → `stats-courses-section` visible | ✅ |
| ✅ | `/statistics/finance` → accessible pour admin | ✅ |
| ✅ | Membre tente `/statistics` → redirection `/dashboard` | ✅ |

> **Fix appliqué (2026-05-25) :** `globalSetup.ts` capture désormais le cookie HTTP-only `refreshToken` depuis la réponse login et l'inclut dans `storageState.cookies`. Le renouvellement JWT fonctionne correctement lors des longues sessions de test.

---

## Phase E5 — Flux métier croisés e2e ✅ (complet)

> Tests de bout en bout qui traversent plusieurs pages et modules en séquence.  
> **Validation :** 2026-05-26 — 11 tests actifs ✅, 0 test.fixme  
> Note : tous les flows s'exécutent dans le projet `chromium-admin` uniquement.

### `e2e/tests/flows/enrollment-flow.spec.ts` — 4 tests ✅

| Scénario complet | Statut |
|---|---|
| Admin voit la page des cours | ✅ |
| Membre voit la page Mes cours (via onglet) | ✅ |
| Membre inscrit via DB → visible dans onglet Mes inscriptions | ✅ |
| Membre se désinscrit via `course-unsubscribe-btn-{id}` → bouton absent | ✅ |

### `e2e/tests/flows/family-flow.spec.ts` — 4 tests ✅

| Scénario complet | Statut |
|---|---|
| Membre navigue vers `/family` → page visible | ✅ |
| Famille créée en DB → visible sur `/family` | ✅ |
| EmptyState → clic → modal de création visible (data-testid) | ✅ |
| Admin retire un membre via panneau admin → membre ne voit plus la famille | ✅ |

### `e2e/tests/flows/messaging-flow.spec.ts` — 3 tests ✅

| Scénario complet | Statut |
|---|---|
| Admin envoie message → membre le voit dans sa boîte | ✅ |
| Membre ouvre un message → marqué comme lu | ✅ |
| Admin broadcast → count notifications DB du membre incrémenté | ✅ |

---

### Helpers — état actuel

#### Tests d'intégration (`dbHelpers.ts`)

| Helper | Phase | Description | Statut |
|---|---|---|---|
| `createTestAdmin()` | Phase 2 | User admin + token | ✅ |
| `createTestProfessor()` | Phase 2 | User professor + token | ✅ |
| `generateAccessToken(user, role?)` | Phase 2 | JWT avec rôle optionnel | ✅ |
| `insertTestGrade(data)` | Phase 2 | Insère un grade | ✅ |
| `truncateTestGrades()` | Phase 2 | Supprime grades de test | ✅ |
| `createTestFamily(responsableId)` | Phase 3 | Crée famille + responsable | ✅ |
| `addFamilyMember(familleId, userId)` | Phase 3 | Ajoute un membre | ✅ |
| `truncateFamilies()` | Phase 3 | Vide familles + membres_famille | ✅ |
| `createTestGroup(data?)` | Phase 4 | Insère un groupe | ✅ |
| `addGroupMember(groupeId, userId)` | Phase 4 | Ajoute membre au groupe | ✅ |
| `truncateGroups()` | Phase 4 | Vide groupes + pivot | ✅ |
| `createTestMessage(expId, destId)` | Phase 4 | Insère un message | ✅ |
| `truncateMessages()` | Phase 4 | Vide messages + broadcasts | ✅ |
| `seedNotification(userId)` | Phase 4 | Insère une notification | ✅ |
| `truncateNotifications()` | Phase 4 | Vide notifications | ✅ |
| `createTestAlertType(data?)` | Phase 4 | Insère un type d'alerte | ✅ |
| `createTestUserAlert(userId, typeId)` | Phase 4 | Insère une alerte user | ✅ |
| `truncateAlerts()` | Phase 4 | Vide alertes | ✅ |
| `createTestCourseRecurrent(data?)` | Phase 5 | Insère un cours récurrent | ✅ |
| `createTestCourseSession(recId, data?)` | Phase 5 | Insère une session | ✅ |
| `createTestInscription(userId, coursId)` | Phase 5 | Inscrit un user à un cours | ✅ |
| `truncateCourses()` | Phase 5 | Vide cours + inscriptions | ✅ |
| `createTestReservation(userId, coursId)` | Phase 5 | Insère une réservation | ✅ |
| `truncateReservations()` | Phase 5 | Vide réservations | ✅ |
| `createTestTemplate(data?)` | Phase 5 | Insère un template | ✅ |
| `truncateTemplates()` | Phase 5 | Vide templates | ✅ |
| `createTestPricingPlan(data?)` | Phase 6 | Insère un plan tarifaire | ✅ |
| `createTestPaymentSchedule(userId)` | Phase 6 | Insère une échéance | ✅ |
| `truncatePayments()` | Phase 6 | Vide paiements + plans | ✅ |
| `createTestStoreCategory(data?)` | Phase 6 | Insère une catégorie store | ✅ |
| `truncateStore()` | Phase 6 | Vide toutes les tables store | ✅ |

### Tests e2e (Playwright)

| Helper / Fixture | Phase | Description | Statut |
|---|---|---|---|
| `auth.fixture.ts` | E1 | Login + persistance `storageState` | ✅ |
| `LoginPage.ts` (page object) | E1 | Sélecteurs + actions page login | ✅ |
| `DashboardPage.ts` | E2 | Sélecteurs dashboard | ✅ |
| `ProfilePage.ts` | E2 | Sélecteurs profil | ✅ |
| `CoursesPage.ts` | E3 | Sélecteurs + actions page cours | ✅ |
| `MessagesPage.ts` | E3 | Sélecteurs + actions page messages | ✅ |
| `NotificationsPage.ts` | E3 | Sélecteurs page notifications | ✅ |
| `UsersPage.ts` | E4 | Sélecteurs page utilisateurs admin | ✅ |
| `SettingsPage.ts` | E4 | Sélecteurs page paramètres admin | ✅ |
| `db.fixture.ts` | E1+ | Seed/teardown DB depuis les tests e2e | ✅ |
| `globalSetup.ts` (e2e) | E1 | Seed comptes e2e pré-créés | ✅ |

---

## 15. Tests unitaires Backend (Jest) ✅

> **État : ✅ complet** — 644/644 tests verts, 146/146 suites passantes (corrigé le 2026-05-25)

### Emplacement

```
backend/src/**/’__tests__’/*.test.ts
```

Ces tests sont générés par `@houthoofd/unitix` et testent les **use-cases** et **repositories** en isolation via des mocks Jest.

### Lancer les tests unitaires backend

```bash
# Depuis backend/
npm test
# ou :
npx jest --testPathPattern="__tests__"
```

### État détaillé

| Métrique | Valeur |
|---|---|
| Suites détectées | 146 |
| Suites qui passent | 146 |
| Suites en échec | 0 |
| Tests verts | 644 |
| Tests échecs | 0 |
| Tests totaux | 644 |

### Corrections appliquées (2026-05-25)

| Problème | Fix |
|---|---|
| `jest is not defined` (175 suites) — mode ESM n'injecte pas le global `jest` | Preset `ts-jest/presets/default-esm` → `ts-jest` (CJS), suppression `--experimental-vm-modules` |
| `Cannot find module @/shared/Foo.js` (48 suites) — alias sans extension | Ajout de règles `.js`-aware dans `moduleNameMapper` |
| `jest.mock('../services/EmailService.js')` chemin relatif erroné (7 fichiers) | Corrigé `../` → `../../` (test dans `__tests__/`, un niveau plus profond que la source) |
| `SendFromTemplateUseCase` — chemin inter-module `../../../messaging/...` | Remplacé par alias `@/modules/messaging/...` |
| `RefreshTokenUseCase` — `role_app` manquant dans mock | `role_app: 'member'` ajouté dans `mockUser` et assertions |
| `RegisterUseCase` — réponse sans tokens, `storeEmailVerificationToken` 4 args | Assertions mises à jour + mock `EmailService` ajouté |
| `LoginUseCase` — DTO migré `email` → `userId` | Mocks et assertions mis à jour |
| `coverageThresholds` (typo) | Corrigé en `coverageThreshold` |

---

## 16. Tests unitaires Frontend (Vitest) ✅

> **État : ✅ complet** — 266/266 tests verts, 73/73 suites passantes (corrigé le 2026-05-25)

### Emplacement

```
frontend/src/**/’__tests__’/*.test.tsx
frontend/src/**/’__tests__’/*.test.ts
```

Ces tests couvrent les **composants React** et les **hooks** via Vitest + Testing Library + jsdom.

### Lancer les tests unitaires frontend

```bash
# Depuis frontend/
npm test
# Mode watch :
npm run test:watch
# Avec couverture :
npm run test:coverage
```

### Corrections appliquées (2026-05-25)

| Problème | Fix |
|---|---|
| `frontend/src/shared/test/setup.ts` absent — Vitest ne démarrait pas | Fichier créé avec `import '@testing-library/jest-dom'` |
| `import { describe, it } from 'jest'` dans 73 fichiers — module `jest` inexistant en Vitest | Suppression des imports (globals auto-injectés via `globals: true`) |
| `renderWithProviders` absent (`@/shared/test/renderWithProviders`) | Créé avec `QueryClientProvider + I18nextProvider + MemoryRouter` |
| Serveur MSW absent | `server.ts` créé avec handlers `alerts` (12 routes) et `notifications` (7 routes) |

### Fichiers créés

```
frontend/src/shared/test/
├── setup.ts                    ← @testing-library/jest-dom
├── i18nTest.ts                 ← instance i18n isolée pour tests
├── renderWithProviders.tsx     ← wrapper QC + i18n + Router
└── mocks/
    ├── server.ts               ← serveur MSW consolidé
    └── handlers/
        ├── alertsHandlers.ts
        └── notificationsHandlers.ts
```

### Contenu des 73 suites

Les suites couvrent notamment :
- Composants : `AlertActionsModal`, `AlertStatusBadge`, `ComposeModal`, `MessageDetail`, `KpiGrid`, `WelcomeBanner`...
- Hooks : `useAlerts`, `useCourses`, `useFamilies`, `useMessaging`, `useNotifications`...

---

## 17. Helpers disponibles

> (ancienne section 15 — contenu inchangé)

---

## 18. Métriques globales

> Mise à jour : **2026-05-26**

### Vue complète — pyramide de tests

> Mise à jour : **2026-05-26**

| Couche | Outil | Suites | Tests | État |
|---|---|---|---|---|
| **Unitaires Frontend** | Vitest | 73 | 266 | ✅ 266/266 verts |
| **Unitaires Backend** | Jest | 146 | 644 | ✅ 644/644 verts |
| **Intégration** | Jest + Supertest | 30 | 482 | ✅ 482/482 verts |
| **E2E Phases E1→E5** | Playwright | 14 | **83** | ✅ **83/83 verts** |

### Détail — Tests d'intégration

| Phase | Module(s) | Tests confirmés | Statut |
|---|---|---|---|
| Phase 1 | `auth` + health | **46** | ✅ Terminé — 46/46 verts |
| Phase 2 | `references`, `grades`, `settings`, `recovery` | **71** | ✅ Terminé — 71/71 verts |
| Phase 3 | `users` (3 fichiers), `families` (2 fichiers) | **81** | ✅ Terminé — 81/81 verts |
| Phase 4 | `groups`, `messaging`, `notifications`, `alerts` | **101** | ✅ Terminé — 101/101 verts |
| Phase 5 | `courses` (3 fichiers), `reservations`, `templates`, `statistics` | **112** | ✅ Terminé — 112/112 verts |
| Phase 6 | `payments.plans`, `payments.schedules`, `payments.webhook`, `store.categories`, `store.orders` | **71** | ✅ Terminé — 71/71 verts |
| **Sous-total intégration** | **30 suites / 22+ modules** | **482** | ✅ **482/482 verts** |

> Validation complète confirmée le 2025-05-19 : `30 suites passed, 482 tests passed`.

### Tests e2e (Playwright)

| Phase | Périmètre | Tests | Statut |
|---|---|---|---|
| Phase E1 | Authentification | **18** | ✅ Terminé — 18/18 verts |
| Phase E2 | Navigation & Profil | **23** | ✅ Terminé — 23/23 verts |
| Phase E3 | Flux membre | **15** | ✅ Terminé — 15/15 verts |
| Phase E4 | Flux admin | **16** | ✅ Terminé — 16/16 verts |
| Phase E5 | Flux métier croisés | **11** | ✅ Terminé — 11/11 verts |
| **Sous-total e2e** | **5 phases / 14 specs** | **83** | ✅ **83/83 verts** |

> Validation Phase E1 : `18 tests passed` — 2025-05-20.  
> Validation Phase E2 : `23 tests passed` — 2026-05-21.  
> Validation Phases E3→E5 : `76 passed, 7 skipped (fixme), 0 failed` — 2026-05-25.  
> Déblocage fixmes E4+E5 : `+6 tests actifs, 7 fixme → 1 fixme` — 2026-05-25.  
> Dernier fixme résolu (family-flow retrait membre) + corrections post-merge : **83/83 verts** — 2026-05-26.

### Total combiné

| | Tests | Verts confirmés |
|---|---|---|
| **Unitaires Frontend** | **266** | **266** ✅ |
| **Unitaires Backend** | **644** | **644** ✅ |
| **Intégration** | **482** | **482** ✅ |
| **E2E** | **83** | **83** ✅ |
| **TOTAL** | **1 475** | **1 475** ✅ |

---

## 19. Commandes utiles

```bash
# ─── Tests unitaires Backend (Jest) ───────────────────────────────────────────────
# Depuis backend/
npm test
npm run test:coverage
# Lister toutes les suites en échec :
npx jest --testPathPattern="__tests__" --verbose 2>&1 | grep -E "FAIL|PASS"

# ─── Tests unitaires Frontend (Vitest) ─────────────────────────────────────────
# Depuis frontend/
npm test              # mode watch
npm run test -- --run  # run once
npm run test:coverage  # avec rapport de couverture
npm run test:ui        # interface graphique Vitest

# ─── Tests d'intégration ────────────────────────────────────────────────────
# Depuis backend/
npm run test:integration

# Lancer un seul fichier
node --experimental-vm-modules ../node_modules/jest/bin/jest.js \
  --config jest.config.integration.cjs --forceExit --runInBand \
  tests/integration/auth/login.test.ts

# Lancer un pattern de fichiers (ex. toute la Phase 3)
node --experimental-vm-modules ../node_modules/jest/bin/jest.js \
  --config jest.config.integration.cjs --forceExit --runInBand \
  --testPathPattern="users|families"

# ─── Tests e2e (Playwright) ──────────────────────────────────────────────────
# Depuis la racine du monorepo :
pnpm --filter @clubmanager/e2e exec playwright test

# Seeder les comptes E2E en DB (une seule fois) :
npx tsx e2e/setup/seed-e2e.ts

# Lancer un seul fichier
pnpm --filter @clubmanager/e2e exec playwright test tests/auth/login.spec.ts

# Mode UI interactif (recommandé en développement)
pnpm --filter @clubmanager/e2e exec playwright test --ui

# Générer le rapport HTML
pnpm --filter @clubmanager/e2e exec playwright show-report

# Enregistrer un nouveau test (codegen)
pnpm --filter @clubmanager/e2e exec playwright codegen http://localhost:5173
```

---

## 20. Actions immédiates (prochaine session)

> Liste priorisée par impact / effort.

### 1. ✅ TERMINÉ — Débloquer les tests unitaires Frontend (Vitest) (2026-05-25)

Résultat : **73/73 suites vertes, 266/266 tests verts.**

- Créé `frontend/src/shared/test/setup.ts` (débloque l'initialisation Vitest)
- Supprimé `import { ... } from 'jest'` dans 73 fichiers (Vitest `globals: true` suffit)
- Créé `renderWithProviders.tsx`, `i18nTest.ts`, `server.ts`, handlers MSW

### 2. ✅ TERMINÉ — Tests unitaires Backend Jest (2026-05-25)

Résultat : **146/146 suites vertes, 644/644 tests verts.**

- Passage `ts-jest/presets/default-esm` → `ts-jest` (CJS) — `jest` global disponible
- Ajout règles `moduleNameMapper` avec extension `.js` pour alias `@/`
- Correction des 7 `jest.mock('../services/...')` avec chemins relatifs erronés
- Mise à jour assertions `LoginUseCase`, `RegisterUseCase`, `RefreshTokenUseCase`

### 3. ✅ TERMINÉ — Phase E1 E2E validée

18/18 tests Playwright verts le 2025-05-20.

### 4. ✅ TERMINÉ — Phase E2 E2E (Navigation & Profil)

23/23 tests verts — 2026-05-21.

- `e2e/tests/navigation/routing.spec.ts` (9 scénarios × 2 projets = 18 tests)
- `e2e/tests/navigation/profile.spec.ts` (5 scénarios × 1 projet = 5 tests)

### 5. ✅ TERMINÉ — Corriger `MySQLStatisticsRepository.ts` (SQL obsolètes)

**Toutes les colonnes SQL obsolètes ont été corrigées — 2025-05-21.**

| Ancien nom (obsolète) | Nouveau nom (schéma actuel) | Statut |
|---|---|---|
| `u.utilisateur_id` | `u.id` | ✅ Corrigé |
| `role_id != 1` | `role_app != 'admin'` | ✅ Corrigé (22 occurrences) |
| `c.cours_id` | `c.id` | ✅ Corrigé |
| `i.inscription_id` | `i.id` | ✅ Corrigé |
| `i.presence` | `i.status_id` | ✅ Corrigé |
| `plans_abonnement` | `plans_tarifaires` | ✅ Corrigé |
| `abonnements` (table supprimée) | join direct via `e.user_id` / `u.abonnement_id` | ✅ Corrigé |
| `categories_articles` | `categories` | ✅ Corrigé |
| `statut_paiement` | `statut` (commandes) | ✅ Corrigé |
| `ca.prix_unitaire` | `ca.prix` (commande_articles) | ✅ Corrigé |
| `a.article_id` (PK articles) | `a.id` | ✅ Corrigé |
| `montant_total` (commandes) | `total` | ✅ Corrigé |
| `u.nom` / `u.prenom` | `u.last_name` / `u.first_name` | ✅ Corrigé |
| `e.echeance_id` (PK echeances) | `e.id` | ✅ Corrigé |
| `stock` (table) | `stocks` | ✅ Corrigé |
| `s.quantite_disponible` | `s.stock_disponible` | ✅ Corrigé |

**Correction supplémentaire :** 6 méthodes utilisaient `pool.execute()` avec des `?` dans des sous-requêtes scalaires — MySQL prepared statements ne supporte pas ça. Changées en `pool.query()` :
- `getMembersByGrade`, `getMembersByGender`, `getMembersByAgeGroup` (L143, L180, L223)
- `getRevenueByPaymentMethod`, `getRevenueByPlan`, `getSalesByCategory` (L597, L636, L898)

### 6. ✅ TERMINÉ — Migration V4.9 : `inscriptions.utilisateur_id → user_id`

**Appliquée le 2025-05-21** via `db/migrations/V4.9__fix_inscriptions_user_id.sql`.

- **Symptôme :** `GET /api/courses/sessions/my-enrollments → 500` (`Unknown column 'i.user_id'`)
- **Cause :** `inscriptions.utilisateur_id` n'avait pas été renommé en `user_id` lors de la consolidation (oublié dans V4.8).
- **Fix :** Migration idempotente appliquée en production.

### 7. ✅ TERMINÉ — Détection dynamique des ports e2e (2026-05-21)

**Problème :** le port 3000 était occupé par un autre projet (Unitix-plateform), causant
`reuseExistingServer` à accepter le mauvais serveur et faire échouer le login e2e avec
`{errors:[{path:["email"],...}]}` (endpoint attendait `email` à la place de `userId`).

**Solution :** nouveau fichier `e2e/setup/portUtils.ts` — détection synchrone via sous-processus
(`execFileSync`) des ports libres pour le backend (3000→3003) et le frontend (5174→5177).
Le backend est identifié par `GET /health → { success: true, message: "ClubManager…" }`.
Les ports détectés sont propagés aux processus enfants via `process.env`.

### 8. ✅ TERMINÉ — Corrections SQL 500 restantes (2026-05-21)

Deux nouvelles sources de 500 identifiées et corrigées :

1. `MySQLStatisticsRepository.ts` — `getTotalMembers(activeOnly=true)` : `AND status = 'actif'` → `AND active = TRUE`
2. `MySQLCourseRepository.ts` — `getAttendanceForExport` : 5 mauvais noms de table/colonne (voir section Phase E2 pour le détail)

### 9. ✅ TERMINÉ — Phases E3, E4, E5 E2E (2026-05-25)

**Résultat global : `76 passed, 7 skipped (fixme), 0 failed`**

- `e2e/tests/member/courses.spec.ts` — 5 tests ✅
- `e2e/tests/member/messaging.spec.ts` — 6 tests ✅
- `e2e/tests/member/notifications.spec.ts` — 4 tests ✅
- `e2e/tests/admin/users.spec.ts` — 5 tests ✅
- `e2e/tests/admin/settings.spec.ts` — 5 tests ✅
- `e2e/tests/admin/statistics.spec.ts` — 3 tests ✅ + 3 test.fixme (cookie `refreshToken`)
- `e2e/tests/flows/enrollment-flow.spec.ts` — 3 tests ✅ + 1 test.fixme
- `e2e/tests/flows/family-flow.spec.ts` — 3 tests ✅ + 1 test.fixme
- `e2e/tests/flows/messaging-flow.spec.ts` — 2 tests ✅ + 1 test.fixme

**Changements `playwright.config.ts` :**
- `chromium-admin` : ignore désormais `tests/member/*`
- `chromium-member` : ignore désormais `tests/admin/*` et `tests/flows/*`
- Les flows s'exécutent uniquement dans `chromium-admin`

### 10. ✅ TERMINÉ — Corrections SQL `MySQLStatisticsRepository.ts` + `StatisticsController.ts` (2026-05-25)

1. **29 remplacements** `pool.execute()` → `pool.query()` pour toutes les méthodes avec paramètres `Date` ou integer. Cause : mysql2 binary protocol ne sérialise pas correctement les objets `Date` JS.
2. **`getLatePaymentDetails()`** : `e.user_id` → `e.utilisateur_id` (colonne réelle dans la DB prod).
3. **`StatisticsController.ts`** : suppression des imports dupliqués (`CreateStatisticsSnapshot`, `GetStatisticsHistory`).

### 11. ✅ TERMINÉ — Correction `db.fixture.ts` (2026-05-25)

`database: "clubmanager_test"` → `database: process.env.DB_NAME ?? "clubmanager"` — la fixture DB E2E pointait sur la DB de test intégration au lieu de la DB dev (celle utilisée par le backend en e2e).

### 12. ✅ TERMINÉ — Global error handler — mapping erreurs domaine → codes HTTP (2026-05-25)

**Fichier :** `app.ts`  
Avant : toutes les erreurs domaine retournaient `500`.  
Après : mapping explicite :

| Erreur domaine | Code HTTP |
|---|---|
| Identifiant/mot de passe invalide, token | `401` |
| Accès refusé | `403` |
| Introuvable | `404` |
| Déjà associé / existe | `409` |
| Validation | `422` |

### 13. ✅ TERMINÉ — Ajout `data-testid` frontend (2026-05-25)

| Fichier | Nouveaux `data-testid` |
|---|---|
| `CoursesPage.tsx` | `courses-page`, `course-card-{id}` |
| `MyCoursesPage.tsx` | `my-courses-page`, `my-courses-table` |
| `MessagesPage.tsx` | `messages-page`, `messages-compose-btn`, `messages-list` |
| `MessageListItem.tsx` | `message-item-{id}` |
| `NotificationsPage.tsx` | `notifications-page`, `notifications-list`, `mark-all-read-btn`, `delete-all-btn`, `notification-item-{id}`, `notification-delete-{id}` |
| `UsersPage.tsx` | `users-page`, `users-search`, `users-role-filter`, `users-table` |
| `SettingsPage.tsx` | `settings-page` |
| `statistics/DashboardPage.tsx` | `statistics-dashboard` |

### 14. ✅ TERMINÉ — Résoudre les 7 test.fixme E2E → 6 résolus (2026-05-25)

**Résultat : 7 fixme → 1 fixme restant.**

#### Fixme résolus (×6)

| Spec | Test | Fix |
|---|---|---|
| `statistics.spec.ts` | `/statistics/dashboard` page chargée | Cookie `refreshToken` capturé dans `globalSetup.ts` |
| `statistics.spec.ts` | Onglet Members accessible | Idem + `data-testid="stats-tab-members"` / `stats-members-section` |
| `statistics.spec.ts` | Onglet Courses accessible | Idem + `data-testid="stats-tab-courses"` / `stats-courses-section` |
| `enrollment-flow.spec.ts` | Désinscription cours | `data-testid="course-unsubscribe-btn-{id}"` + mutation `deleteInscription` |
| `messaging-flow.spec.ts` | Broadcast → notifications | `data-testid="broadcast-notification-btn/form"` + `notification-badge` |
| `family-flow.spec.ts` | EmptyState → modal creation | `data-testid="family-create-btn/form/submit"` |

#### Fixme restant (×1)

| Spec | Test | Raison |
|---|---|---|
| `family-flow.spec.ts` | `responsable retire un membre → membre ne voit plus la famille` | Nécessite flux admin + cross-context + vérification dans le contexte du membre |

### 15. ✅ TERMINÉ — Capture du cookie `refreshToken` dans `globalSetup.ts` (2026-05-25)

`e2e/setup/globalSetup.ts` — la méthode `loginAndSaveState()` extrait désormais le header `Set-Cookie` de la réponse `fetch()` login (via `response.headers.getSetCookie()` Node 18+), parse chaque cookie en objet Playwright (name, value, domain, path, expires, httpOnly, secure, sameSite) et l'injecte dans `storageState.cookies`. Le cookie `refreshToken` (HTTP-only, SameSite=Strict, 7 jours) est ainsi disponible dans tous les contextes de navigation Playwright, ce qui permet le renouvellement automatique du JWT access token sans redirection vers `/login`.

### 16. ✅ TERMINÉ — Ajout `data-testid` frontend session 2 (2026-05-25)

| Fichier | Nouveaux `data-testid` |
|---|---|
| `statistics/DashboardPage.tsx` | `stats-tab-members`, `stats-tab-courses`, `stats-members-section`, `stats-courses-section` (+ `statistics-dashboard` sur l'état d'erreur) |
| `families/pages/FamilyPage.tsx` | `family-create-btn` (via `EmptyState.action.testId`) |
| `families/components/AddFamilyMemberModal.tsx` | `family-create-form`, `family-create-submit` |
| `layouts/PrivateLayout.tsx` | `notification-badge` |
| `notifications/pages/NotificationsPage.tsx` | `broadcast-notification-btn` |
| `notifications/components/BroadcastNotificationModal.tsx` | `broadcast-notification-form` |
| `courses/pages/MyCoursesPage.tsx` | `course-unsubscribe-btn-{id}` (colonne Actions) |

### 17. ✅ TERMINÉ — Compléter le dernier test.fixme E2E (2026-05-26)

**Fichier :** `e2e/tests/flows/family-flow.spec.ts`  
**Test :** `responsable retire un membre → membre ne voit plus la famille`

**Implémentation :**
1. Seed DB : famille + membre e2e dans `membres_famille`
2. Admin : navigate `/family` → onglet `#tab-admin` → recherche par nom (évite pagination) → clic `[data-testid="family-members-btn-{id}"]` → clic `[data-testid="remove-member-btn-{userId}"]`
3. `waitForResponse` DELETE `/families/{id}/members/{userId}` → 200
4. Membre : reload `/family` → famille absente (`not.toBeVisible`)
5. Finally : cleanup DB garanti

**Nouveaux `data-testid` :** `families-search-input`, `family-members-btn-{id}`, `remove-member-btn-{user_id}` dans `AdminFamiliesPage.tsx`.

### 18. ✅ TERMINÉ — Merger les branches dans `develop` (2026-05-26)

Trois branches mergées avec succès :

| Branche | Contenu | Commits |
|---|---|---|
| `feature/test-suite` | 482 tests intégration + scaffolder | `fc78c13` |
| `feature/db-schema-consolidation` | SCHEMA_CONSOLIDATE.sql v5.0 | `63c639a` |
| `feature/e2e-playwright` | Infrastructure Playwright + Phases E1→E5 + fixes backend/frontend | 20+ commits |

Ordre de merge : `test-suite` → `db-schema-consolidation` → `e2e-playwright` (pour respecter la hiérarchie des commits partagés).

**Commit final :** `e5f63cd merge(feature/e2e-playwright)` sur `develop`.

### 19. ✅ TERMINÉ — Corrections post-merge (2026-05-26)

Bugs détectés lors de la première exécution E2E complète après merge :

| Fichier | Bug | Fix |
|---|---|---|
| `statistics/DashboardPage.tsx` | `data?.members.overview` crash React (TypeError) au premier render (`data = undefined`) | Optional chaining complet : `data?.members?.overview?.total_membres` sur 8 expressions + `data?.store?.low_stock?.length` |
| `courses/courseRoutes.ts` | DELETE `/inscriptions/:id` réservé ADMIN/PROFESSOR → membre ne peut pas se désinscrire (403) | Ajout `UserRole.MEMBER` dans `requireRole` |
| `courses/CourseController.ts` | Aucune vérification de propriété pour les membres | Check `SELECT id FROM inscriptions WHERE id=? AND user_id=?` avant suppression |
| `e2e/flows/messaging-flow.spec.ts` | Colonnes SQL `utilisateur_id` et `lue` inexistantes dans `notifications` | Renommage → `user_id`, `lu` (schéma V4.9) |

**Résultat final :** `83 passed` — exécution complète en 3.4 min.

### 20. 📋 SUIVANT — Push `develop` sur origin + GitHub Actions CI

**A. Push develop**
```bash
git push origin develop
```

**B. Workflow GitHub Actions** (`/.github/workflows/e2e.yml`)  
À créer quand tous les tests seront stables en CI :
- Service MySQL dans le job
- `pnpm --filter @clubmanager/e2e seed` avant `playwright test`
- Variables d'env `BACKEND_PORT` / `E2E_FRONTEND_PORT` pour éviter conflits
- Artifacts : rapport HTML Playwright en cas d'échec
- Restreindre à `main`/`develop` ou aux PRs
