# Roadmap — Tests d'intégration Backend

> **Branche de travail :** `feature/test-suite`  
> **Commande :** `npm run test:integration`  
> **Config Jest :** `jest.config.integration.cjs`  
> **Répertoire :** `tests/integration/`

Les tests d'intégration couvrent la **pile HTTP complète** :  
`Route → Middleware → Controller → Use-Case → Repository → MySQL (clubmanager_test)`

Contrairement aux tests unitaires (use-cases isolés avec repos mockés),  
chaque test ici fait de vraies requêtes HTTP via **supertest** et touche une vraie base de données.

---

## Infrastructure mise en place

| Fichier | Rôle |
|---|---|
| `jest.config.integration.cjs` | Config Jest dédiée — timeout 30 s, `--runInBand`, `--forceExit` |
| `tests/integration/setup/globalSetup.cjs` | Recrée `clubmanager_test` + applique schema + migration 010 + seed minimal (genres, status, grades) |
| `tests/integration/setup/env.setup.cjs` | Force `DB_NAME=clubmanager_test` avant tout import de module (via `setupFiles`) |
| `tests/integration/setup/dbHelpers.ts` | Pool de test direct, `createTestUser()`, `truncateAuthTables()`, `generateAccessToken()`, `countRefreshTokens()`, `getUserByEmail()` |

### Règles d'isolation
- `--runInBand` : exécution séquentielle — évite les conflits de clés uniques entre fichiers de test.
- `beforeEach` dans chaque suite appelle `truncateAuthTables()` — état propre avant chaque test.
- `globalSetup` **recrée entièrement** `clubmanager_test` à chaque lancement — pas d'état résiduel.

### Bugs applicatifs détectés et corrigés pendant l'implémentation
| Bug | Fichier corrigé | Description |
|---|---|---|
| Email dupliqué accepté silencieusement | `RegisterUseCase.ts` | Manquait un appel `emailExists()` avant `createUser()` — deux comptes pouvaient avoir le même email |
| Tokens JWT identiques sous 1 seconde | `JwtService.ts` | `iat` en secondes + même payload = même HMAC → hash dupliqué en DB lors du refresh → ajout de `jti: randomUUID()` sur chaque token |
| Colonne `email` absente de `email_validation_tokens` | `globalSetup.cjs` | Migration 010 non intégrée dans `SCHEMA_CONSOLIDATE.sql` v4.4 → appliquée manuellement dans le setup de test |

---

## ✅ Phase 1 — Module `auth` (terminé)

**46 tests — 5 fichiers — 100 % verts**

### `tests/integration/health.test.ts` — 5 tests
| Test | Endpoint | Vérification |
|---|---|---|
| ✅ | `GET /health` | 200 + `success: true` + `environment: test` |
| ✅ | `GET /api` | 200 + `version: 3.0.0` |
| ✅ | `GET /api/auth/health` | 200 + `success: true` |
| ✅ | `GET /api/unknown` | 404 + `success: false` |
| ✅ | `GET /api/auth/unknown` | 404 |

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
| ✅ | Format `userId` invalide (pas `U-YYYY-XXXX`) → 500 |
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
| ✅ | Prénom manquant → 500 `First name is required` |
| ✅ | Email invalide → 500 `Invalid email format` |
| ✅ | Mot de passe trop faible → 500 `Password validation failed` |
| ✅ | Date de naissance manquante → 500 |
| ✅ | Email déjà utilisé → 500 (message contient "email") |

### `tests/integration/auth/me.test.ts` — 6 tests
| Test | Scénario |
|---|---|
| ✅ | Sans header `Authorization` → 401 `NO_TOKEN` |
| ✅ | Schéma `Basic` au lieu de `Bearer` → 401 `NO_TOKEN` |
| ✅ | Token malformé → 401 `INVALID_TOKEN` |
| ✅ | Mauvaise signature → 401 `INVALID_TOKEN` |
| ✅ | Token valide → 200 + `email`, `userId`, `userIdString` |
| ✅ | Hash bcrypt absent de la réponse `me` |

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

## 📋 Phase 2 — Modules CRUD simples

> **Objectif :** couvrir les modules sans dépendances complexes — priorité aux routes publiques et aux cas nominaux CRUD.  
> **Prerequis :** helpers `createTestUser(role: 'admin' | 'member' | 'professor')` + `generateAccessToken(user)` déjà disponibles dans `dbHelpers.ts`.

### 📋 `references` — priorité haute

Routes 100 % publiques, pas d'auth, pas d'état utilisateur → les plus rapides à tester.

```
tests/integration/references/references.test.ts
```

| Endpoint | Tests à écrire |
|---|---|
| `GET /api/references` | 200 + toutes les clés présentes (`genres`, `grades`, `status`, etc.) |
| `GET /api/references/genres` | 200 + tableau non vide |
| `GET /api/references/grades` | 200 + tableau non vide |
| `GET /api/references/roles-utilisateur` | 200 |
| `GET /api/references/methodes-paiement` | 200 |

### 📋 `grades` — priorité haute

CRUD simple, données de référence déjà seedées.

```
tests/integration/grades/grades.test.ts
```

| Scénario | Tests à écrire |
|---|---|
| `GET /api/grades` — membre authentifié | 200 + liste |
| `GET /api/grades/:id` — membre | 200 + objet |
| `GET /api/grades/:id` — ID inexistant | 404 |
| `GET /api/grades` — sans token | 401 |
| `POST /api/grades` — admin | 201 + grade créé en DB |
| `POST /api/grades` — membre (non-admin) | 403 |
| `POST /api/grades` — champs manquants | 400/500 |
| `PUT /api/grades/:id` — admin | 200 + grade modifié |
| `DELETE /api/grades/:id` — admin | 200 + grade absent en DB |

### 📋 `settings` — priorité moyenne

Données de configuration, CRUD admin uniquement.

```
tests/integration/settings/settings.test.ts
```

| Scénario | Tests à écrire |
|---|---|
| `GET /api/settings` — admin | 200 |
| `GET /api/settings` — non-admin | 403 |
| `GET /api/settings/key/:cle` — admin | 200 ou 404 |
| `PUT /api/settings/key/:cle` — admin | 200 |
| `POST /api/settings/bulk` — admin | 200 + upsert |

### 📋 `recovery` — priorité moyenne

Une route publique (`POST /public`), deux routes admin.

```
tests/integration/recovery/recovery.test.ts
```

| Scénario | Tests à écrire |
|---|---|
| `POST /api/recovery/public` — sans auth | 201 |
| `POST /api/recovery/public` — email invalide | 400/500 |
| `GET /api/recovery` — admin | 200 + liste |
| `GET /api/recovery` — non-admin | 403 |
| `PATCH /api/recovery/:id` — admin | 200 |

---

## 📋 Phase 3 — Modules utilisateurs et familles

> **Prerequis :** helpers pour créer des utilisateurs avec différents rôles, familles, etc.

### 📋 `users`

```
tests/integration/users/
├── users.list.test.ts     # GET /, GET /deleted
├── users.profile.test.ts  # GET /:id/profile, PATCH /:id/profile
├── users.admin.test.ts    # PATCH role, status, subscription, soft-delete, restore, anonymize
```

Points d'attention :
- `GET /api/users` — ADMIN/PROFESSOR uniquement → tester 401 + 403 + 200
- `PATCH /:id/role` — seul ADMIN peut changer un rôle
- `DELETE /:id` — soft delete (vérifier `deleted_at` en DB, pas une vraie suppression)
- `POST /:id/anonymize` — RGPD (vérifier les champs anonymisés en DB)

### 📋 `families`

```
tests/integration/families/
├── families.member.test.ts  # POST /members, GET /my-family, DELETE /members/:userId
└── families.admin.test.ts   # CRUD admin
```

Points d'attention :
- Création de famille → ajout de membre → vérification de la relation en DB
- Suppression de membre → vérifier que l'utilisateur n'est plus dans la famille

---

## 📋 Phase 4 — Modules métier

> Ces modules nécessitent des données de référence plus complexes (cours, groupes, etc.).

### 📋 `groups`

```
tests/integration/groups/groups.test.ts
```

CRUD admin/professor + ajout/suppression de membres. Tester la relation `group_members` en DB.

### 📋 `messaging`

```
tests/integration/messaging/messaging.test.ts
```

Points d'attention :
- Envoyer un message → vérifier en DB (`messages` + `recipients`)
- Lire un message → vérifier `is_read = true` en DB
- Archiver → vérifier `archived = true`

### 📋 `notifications`

```
tests/integration/notifications/notifications.test.ts
```

- Broadcast admin → tous les utilisateurs reçoivent une notification
- Mark as read → vérifier en DB
- Delete → vérifier absence en DB

### 📋 `alerts`

```
tests/integration/alerts/
├── alerts.types.test.ts   # CRUD types d'alertes (admin)
└── alerts.user.test.ts    # GET /me, resolve, ignore
```

---

## 📋 Phase 5 — Modules complexes

> Modules avec dépendances externes ou logique métier importante.

### 📋 `courses`

Le module le plus large (23 endpoints, 23 use-cases). Décomposer en :

```
tests/integration/courses/
├── courses.recurrent.test.ts   # CRUD cours récurrents
├── courses.sessions.test.ts    # Génération + gestion des sessions
├── courses.inscriptions.test.ts # Inscription + présence
└── courses.professors.test.ts  # Assignation professeurs
```

### 📋 `reservations`

```
tests/integration/reservations/reservations.test.ts
```

- Créer une réservation → vérifier en DB
- Annuler → vérifier `status = cancelled` en DB
- Double réservation → gérer le conflit

### 📋 `templates`

```
tests/integration/templates/templates.test.ts
```

Points d'attention : `POST /:id/send` déclenche un envoi email — à mocker ou ignorer l'erreur d'envoi en test.

### 📋 `statistics`

```
tests/integration/statistics/statistics.test.ts
```

Routes en lecture seule — tester 200 + structure de réponse. Snapshot: vérifier création en DB.

---

## 📋 Phase 6 — Modules avec dépendances externes

> Ces modules interagissent avec des services tiers (Stripe, S3) — nécessitent une approche différente.

### 📋 `payments`

Stratégie :
- **Plans tarifaires** (CRUD pur) → testables directement avec la DB
- **Paiements / Échéances** → testables avec la DB (pas de Stripe)
- **Stripe webhook** → tester la validation de signature avec un secret connu (mock Stripe dans les tests)
- **`POST /stripe/intent`** → mocker le client Stripe (`jest.mock`)

```
tests/integration/payments/
├── payments.plans.test.ts      # CRUD plans tarifaires
├── payments.schedules.test.ts  # CRUD échéances
└── payments.webhook.test.ts    # Signature Stripe (mock)
```

### 📋 `store`

Attention : la majorité des use-cases sont des stubs vides. Tester uniquement ce qui est implémenté (`GetCategoriesUseCase`).

```
tests/integration/store/store.categories.test.ts
```

---

## Helpers à créer au fil des phases

| Helper | Phase | Description |
|---|---|---|
| `createTestAdmin()` | Phase 2 | Raccourci `createTestUser({ role_app: 'admin' })` + token |
| `createTestProfessor()` | Phase 3 | Idem avec rôle `professor` |
| `truncateUserTables()` | Phase 3 | Truncate + toutes les tables liées aux users |
| `createTestGrade()` | Phase 4 | Insère un grade en DB, retourne l'id |
| `createTestGroup()` | Phase 4 | Insère un groupe en DB |
| `createTestCourse()` | Phase 5 | Insère un cours récurrent + sessions |
| `createTestMessage()` | Phase 4 | Insère un message + destinataire |
| `seedPaymentPlan()` | Phase 6 | Insère un plan tarifaire |

---

## Métriques cibles

| Phase | Module(s) | Tests estimés | Statut |
|---|---|---|---|
| Phase 1 | `auth` + health | **46** | ✅ Terminé |
| Phase 2 | `references`, `grades`, `settings`, `recovery` | ~40 | 📋 À faire |
| Phase 3 | `users`, `families` | ~50 | 📋 À faire |
| Phase 4 | `groups`, `messaging`, `notifications`, `alerts` | ~60 | 📋 À faire |
| Phase 5 | `courses`, `reservations`, `templates`, `statistics` | ~80 | 📋 À faire |
| Phase 6 | `payments`, `store` | ~40 | 📋 À faire |
| **Total** | **17 modules** | **~316** | 46 / ~316 |

---

## Commandes utiles

```bash
# Lancer tous les tests d'intégration
npm run test:integration

# Lancer un seul fichier
node --experimental-vm-modules ../node_modules/jest/bin/jest.js \
  --config jest.config.integration.cjs --forceExit --runInBand \
  tests/integration/auth/login.test.ts

# Mode watch (relance sur sauvegarde)
npm run test:integration:watch

# Tests unitaires (inchangés)
npm test
```
