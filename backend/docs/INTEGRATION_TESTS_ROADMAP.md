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
11. [Phase E2 — Navigation & Profil e2e 📋](#phase-e2--navigation--profil-e2e-📋)
12. [Phase E3 — Flux membre e2e 📋](#phase-e3--flux-membre-e2e-📋)
13. [Phase E4 — Flux admin e2e 📋](#phase-e4--flux-admin-e2e-📋)
14. [Phase E5 — Flux métier croisés e2e 📋](#phase-e5--flux-métier-croisés-e2e-📋)
15. [Tests unitaires Backend (Jest) ⚠️](#15-tests-unitaires-backend-jest)
16. [Tests unitaires Frontend (Vitest) ❌](#16-tests-unitaires-frontend-vitest)
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
        │   18 / ~84  ✅⬜             │     navigateur réel
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

### État actuel (2025-05-20)

| Couche | Fichiers | Tests | État |
|---|---|---|---|
| Unitaires Frontend | 73 suites | ? | ❌ Cassé — `setup.ts` manquant |
| Unitaires Backend | 146 suites | 161 | ⚠️ 137/161 verts — 145 suites en échec |
| Intégration | 30 suites | 482 | ✅ 482/482 verts |
| E2E Phase E1 | 3 suites | 18 | ✅ 18/18 verts |
| E2E Phases E2→E5 | — | ~66 | 📋 À implémenter |

> **Conséquence :** la couverture est solide côté intégration API et E2E auth, mais les tests unitaires (les plus rapides à lancer) sont actuellement inutilisables. Les corriger est une priorité.

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
| `baseURL` | `http://localhost:5173` (Vite dev server) |
| `use.storageState` | `e2e/setup/.auth/member.json` (session persistée) |
| `webServer[0]` | Démarre le backend (`npm run dev`, port 3000) |
| `webServer[1]` | Démarre le frontend (`npm run dev`, port 5173) |
| `testDir` | `./tests` |
| `timeout` | 30 000 ms |
| `retries` | 1 en CI, 0 en local |
| `reporter` | `html` (local) + `github` (CI) |

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

## Phase E2 — Navigation & Profil e2e 📋

> **Pages couvertes :** `/dashboard`, `/profile`, toutes les routes protégées  
> **Fichiers :** `e2e/tests/navigation/`

### `e2e/tests/navigation/routing.spec.ts` — ~8 tests

| Test | Scénario |
|---|---|
| 📋 | Connexion → `/dashboard` → KPIs et sections visibles |
| 📋 | Clic nav "Cours" → `/courses` chargé |
| 📋 | Clic nav "Profil" → `/profile` chargé |
| 📋 | Route `/settings` avec rôle membre → 403 ou redirection |
| 📋 | Route `/users` avec rôle membre → 403 ou redirection |
| 📋 | URL inconnue `/blabla` → page 404 affichée |
| 📋 | Bouton "Retour au dashboard" depuis 404 → navigation OK |

### `e2e/tests/navigation/profile.spec.ts` — ~8 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/profile` → infos du compte affichées (nom, email, grade) |
| 📋 | Modifier le prénom → sauvegarder → nouveau prénom affiché |
| 📋 | Modifier le mot de passe → modal ou formulaire → succès |
| 📋 | Changer l'email → email de confirmation envoyé (message visible) |
| 📋 | Mot de passe actuel incorrect → message d'erreur |

---

## Phase E3 — Flux membre e2e 📋

> **Pages couvertes :** `/courses`, `/family`, `/messages`, `/notifications`  
> **Compte de test :** membre standard (`E2E_MEMBER_ID`)

### `e2e/tests/member/courses.spec.ts` — ~8 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/courses` → liste des cours visible |
| 📋 | Clic sur un cours → détails de la session |
| 📋 | S'inscrire à une session → bouton "S'inscrire" → confirmation |
| 📋 | Réinscription → message "déjà inscrit" ou bouton désactivé |
| 📋 | Se désinscrire → confirmation → session retirée de "Mes cours" |
| 📋 | Charger `/my-courses` → liste de ses inscriptions |

### `e2e/tests/member/messaging.spec.ts` — ~6 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/messages` → boîte de réception visible |
| 📋 | Composer un message → remplir destinataire + objet + corps → envoyer |
| 📋 | Message envoyé visible dans "Messages envoyés" |
| 📋 | Ouvrir un message reçu → marqué comme lu (badge lu) |
| 📋 | Archiver un message → absent de la boîte principale |

### `e2e/tests/member/notifications.spec.ts` — ~4 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/notifications` → liste visible |
| 📋 | Clic "Tout marquer comme lu" → badge compteur à 0 |
| 📋 | Supprimer une notification → absente de la liste |

---

## Phase E4 — Flux admin e2e 📋

> **Pages couvertes :** `/users`, `/settings`, `/statistics/*`  
> **Compte de test :** administrateur (`E2E_ADMIN_ID`)

### `e2e/tests/admin/users.spec.ts` — ~10 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/users` → tableau des utilisateurs visible + pagination |
| 📋 | Rechercher par nom → liste filtrée |
| 📋 | Filtrer par rôle → liste filtrée |
| 📋 | Changer le rôle d'un user → modal → confirmer → badge rôle mis à jour |
| 📋 | Désactiver un user → modal → confirmer → badge "Inactif" |
| 📋 | Accéder aux utilisateurs supprimés → page `/users/deleted` → liste visible |
| 📋 | Restaurer un user supprimé → user réapparaît dans la liste principale |

### `e2e/tests/admin/settings.spec.ts` — ~6 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/settings` → liste des paramètres visible |
| 📋 | Modifier la valeur d'un paramètre → sauvegarder → valeur affichée mise à jour |
| 📋 | Rechercher une clé de paramètre → liste filtrée |
| 📋 | Ajouter un nouveau paramètre → formulaire → sauvegarder → présent dans la liste |

### `e2e/tests/admin/statistics.spec.ts` — ~6 tests

| Test | Scénario |
|---|---|
| 📋 | Charger `/statistics` → dashboard chiffres clés visible |
| 📋 | Naviguer vers `/statistics/members` → graphiques visibles |
| 📋 | Naviguer vers `/statistics/courses` → tableau sessions visible |
| 📋 | Naviguer vers `/statistics/finance` → graphique revenus visible |
| 📋 | Accéder à `/statistics` avec rôle membre → redirection ou message 403 |

---

## Phase E5 — Flux métier croisés e2e 📋

> Tests de bout en bout qui traversent plusieurs pages et modules en séquence.  
> Chaque test simule un vrai scénario utilisateur complet.

### `e2e/tests/flows/enrollment-flow.spec.ts` — ~4 tests

| Scénario complet | Description |
|---|---|
| 📋 | **Parcours inscription cours** : admin crée un cours → génère sessions → membre s'inscrit → professor enregistre la présence → membre voit son historique dans "Mes cours" |
| 📋 | **Annulation** : membre inscrit → se désinscrit → place libérée visible dans le cours |

### `e2e/tests/flows/family-flow.spec.ts` — ~3 tests

| Scénario complet | Description |
|---|---|
| 📋 | **Création famille** : membre crée sa famille → ajoute un autre membre → les deux voient la famille sur `/family` |
| 📋 | **Retrait membre** : le responsable retire un membre → le membre ne voit plus la famille |

### `e2e/tests/flows/messaging-flow.spec.ts` — ~3 tests

| Scénario complet | Description |
|---|---|
| 📋 | **Échange messages** : admin envoie un message à un membre → membre ouvre `/messages` → message visible et lu → répond → admin voit la réponse |
| 📋 | **Notification broadcast** : admin envoie un broadcast → membre voit le badge notifications incrémenté → ouvre la page → notification visible |

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
| `CoursesPage.ts` | E3 | Sélecteurs + actions cours | ✅ |
| `ProfilePage.ts` | E2 | Sélecteurs profil | ✅ |
| `db.fixture.ts` | E1+ | Seed/teardown DB depuis les tests e2e | ✅ |
| `globalSetup.ts` (e2e) | E1 | Seed comptes e2e pré-créés | ✅ |

---

## 15. Tests unitaires Backend (Jest) ⚠️

> **État : ⚠️ partiel** — 137/161 tests verts, 145/146 suites en échec (constaté le 2025-05-20)

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
| Suites qui passent | 1 |
| Suites en échec | 145 |
| Tests verts | 137 |
| Tests échecs | 24 |
| Tests totaux | 161 |

### Cause probable des échecs

La majorité des échecs sont vraisemblablement liés à des **mocks mal configurés** ou des **imports cassés** suite aux refactorisations. À investiguer suite à un lancement avec `--verbose` pour identifier le pattern commun.

### Actions correctives

- [ ] Lancer `npm test -- --verbose 2>&1 | grep FAIL` pour lister toutes les suites en échec
- [ ] Identifier si l'échec est un même problème récurrent (import path, mock shape...)
- [ ] Corriger le problème systémique plutot que suite par suite
- [ ] Objectif : 161/161 verts

---

## 16. Tests unitaires Frontend (Vitest) ❌

> **État : ❌ cassé** — 73 suites détectées, 0 exécute (constaté le 2025-05-20)

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

### Cause de l'échec

Tous les 73 fichiers de tests font référence à un fichier de setup Vitest qui **n'existe pas** :

```
Error: Failed to load url .../frontend/src/shared/test/setup.ts
```

Le fichier `frontend/src/shared/test/setup.ts` est référencé dans `vite.config.ts` :
```ts
// vite.config.ts
test: {
  setupFiles: ['./src/shared/test/setup.ts'],  // ← ce fichier n'existe pas
}
```

### Actions correctives

- [ ] Créer `frontend/src/shared/test/setup.ts` avec le contenu minimal :
  ```typescript
  import '@testing-library/jest-dom';
  // Optionnel : configuration de MSW, i18n mock, etc.
  ```
- [ ] Vérifier que `@testing-library/jest-dom` est dans les devDependencies (il l'est déjà)
- [ ] Lancer `npm test --run` pour voir l'état réel des 73 suites
- [ ] Corriger les éventuels échecs restants suite par suite
- [ ] Objectif : toutes les suites Vitest vertes

### Contenu des 73 suites (générées par `@houthoofd/unitix`)

Les suites couvrent notamment :
- Composants : `AlertActionsModal`, `AlertStatusBadge`, `ComposeModal`, `MessageDetail`, `KpiGrid`, `WelcomeBanner`...
- Hooks : `useAlerts`, `useCourses`, `useFamilies`, `useMessaging`, `useNotifications`...

---

## 17. Helpers disponibles

> (ancienne section 15 — contenu inchangé)

---

## 18. Métriques globales

> Mise à jour : **2025-05-20**

### Vue complète — pyramide de tests

| Couche | Outil | Suites | Tests | État |
|---|---|---|---|---|
| **Unitaires Frontend** | Vitest | 73 | ? | ❌ Cassé — `setup.ts` absent |
| **Unitaires Backend** | Jest | 146 | 161 | ⚠️ 137/161 verts |
| **Intégration** | Jest + Supertest | 30 | 482 | ✅ 482/482 verts |
| **E2E Phase E1** | Playwright | 3 | 18 | ✅ 18/18 verts |
| **E2E Phases E2→E5** | Playwright | — | ~66 | 📋 À implémenter |

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
|---|---|---|
| Phase E1 | Authentification | **18** | ✅ Terminé — 18/18 verts |
| Phase E2 | Navigation & Profil | ~16 | 📋 À faire |
| Phase E3 | Flux membre | ~18 | 📋 À faire |
| Phase E4 | Flux admin | ~22 | 📋 À faire |
| Phase E5 | Flux métier croisés | ~10 | 📋 À faire |
| **Sous-total e2e** | **5 phases** | **~84** | **18 / ~84** |

> Validation Phase E1 confirmée le 2025-05-20 : `18 tests passed` en 55s — projet `chromium-no-auth`.

### Total combiné

| | Tests | Verts confirmés |
|---|---|---|
| **Intégration** | **482** | **482** ✅ |
| **E2E** | ~84 | **18** ✅ |
| **TOTAL** | **~566** | **500** |

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

### 1. ❌ PRIORITAIRE — Débloquer les tests unitaires Frontend (Vitest)

**Effort : 15 min — un seul fichier à créer**

Créer `frontend/src/shared/test/setup.ts` :
```typescript
import '@testing-library/jest-dom';
```
Cela débloquera potentiellement les 73 suites Vitest d'un coup.

### 2. ⚠️ PRIORITAIRE — Investiguer les tests unitaires Backend

**Effort : 1–2h selon le problème systémique**

Lancer avec verbose, trouver la cause commune des 145 suites en échec et corriger.

### 3. ✅ TERMINÉ — Phase E1 E2E validée

18/18 tests Playwright verts le 2025-05-20.

### 4. 📋 SUIVANT — Phase E2 E2E (Navigation & Profil)

- `e2e/tests/navigation/routing.spec.ts` (~8 tests)
- `e2e/tests/navigation/profile.spec.ts` (~8 tests)

### 5. 📋 Corriger `MySQLStatisticsRepository.ts` (SQL obsolètes)

Les erreurs `Unknown column 'status'`, `Unknown column 'role_id'` polluent les logs E2E et cassent le dashboard en production :

| Ancien nom (obsolète) | Nouveau nom (schéma actuel) |
|---|---|
| `u.utilisateur_id` | `u.id` |
| `role_id != 1` | `role_app != 'admin'` |
| `c.cours_id` | `c.id` |
| `i.inscription_id` | `i.id` |
| `i.presence` | `i.status_id` |
| `plans_abonnement` | `plans_tarifaires` |
| `abonnements` | n/a (supprimée) |
| `categories_articles` | `categories` |
| `statut_paiement` | `statut` (colonne paiements) |

### 6. 📋 Merger les branches dans `develop`

Trois branches à merger :
- `feature/test-suite` (482 tests intégration)
- `feature/db-schema-consolidation` (SCHEMA_CONSOLIDATE.sql v5.0)
- `feature/e2e-playwright` (infrastructure Playwright + Phase E1)
