# ClubManager V3 — Gap Analysis
**Database schema vs. Backend implementation vs. Frontend features**

> **Generated:** 2025  
> **Last updated:** 2025 — Sprint 5 fully completed (GAP-09 ✅, GAP-14 ✅, GAP-18 ✅)
> **Schema version:** v4.4 (43 tables — 1 deprecated)  
> **Author:** Benoit Houthoofd (TFE project)
> **DB coverage after Sprint 8:** ~93% — 5 partial zones documented as GAP-20 → GAP-24 (Sprint 9)

---

## Table of Contents

1. [All DB Tables by Domain](#section-1-all-db-tables-by-domain)
2. [Backend Modules Status](#section-2-backend-modules-status)
3. [Frontend Features Status](#section-3-frontend-features-status)
4. [Gap Summary — What Remains To Be Done](#section-4-gap-summary--what-remains-to-be-done)
5. [Coverage Analysis — What Remains After Sprint 9](#section-5-coverage-analysis--what-remains-after-sprint-9)

---

## Section 1: All DB Tables by Domain

Legend: ✅ Backend implemented | ⚠️ Partial | ❌ Not implemented

### Domain 1 — Reference Data (6 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `genres` | Gender/sex types for users | `id`, `nom` | ✅ Served by `references` module |
| `grades` | BJJ belt grades with ordering | `id`, `nom`, `ordre`, `couleur` | ✅ Full CRUD via `grades` module |
| `status` | Generic statuses (actif, inactif…) | `id`, `nom`, `description` | ✅ Served by `references` module |
| `plans_tarifaires` | Subscription pricing plans | `id`, `nom`, `prix`, `duree_mois`, `actif` | ✅ Full CRUD via `payments` module |
| `categories` | Store article categories | `id`, `nom`, `description` | ✅ Full CRUD via `store` module |
| `tailles` | Clothing/kimono sizes (XS, S, M, A1…) | `id`, `nom`, `ordre` | ✅ Full CRUD via `store` module |

---

### Domain 2 — Users & Authentication (9 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `utilisateurs` | Main user table with RBAC, GDPR soft-delete, family links | `id`, `userId`, `first_name`, `last_name`, `email`, `role_app`, `tuteur_id`, `est_mineur`, `deleted_at`, `anonymized` | ✅ Full CRUD via `users` + `auth` modules |
| `email_validation_tokens` | SHA-256 tokens for email verification and change-email | `user_id`, `token_hash`, `token_type` (`verification`/`change_email`), `expires_at`, `used` | ✅ Used by `auth` module |
| `password_reset_tokens` | SHA-256 tokens for password reset | `user_id`, `token_hash`, `expires_at`, `used` | ✅ Used by `auth` module |
| `password_reset_attempts` | Anti-bruteforce rate limiting on password resets | `email`, `ip_address`, `attempts_count`, `last_attempt_at` | ✅ Used by `auth` module |
| `refresh_tokens` | JWT refresh tokens with revocation and device tracking | `user_id`, `token_hash`, `expires_at`, `revoked`, `ip_address`, `user_agent` | ✅ Used by `auth` module |
| `login_attempts` | Login attempt audit log (success/failure) | `email`, `ip_address`, `success`, `failure_reason` | ⚠️ Written by auth — no READ endpoint for admins |
| `auth_attempts` | General authentication attempts history | `email`, `ip_address`, `success` | ⚠️ Written by auth — no READ endpoint for admins |
| `manual_recovery_requests` | Manual account recovery requests (pending/approved/rejected) | `email`, `reason`, `status` | ⚠️ Admin can read/process — no public submission endpoint |
| `validation_tokens` | Generic legacy validation tokens (overlaps with specific token tables) | `user_id`, `token`, `type` (`email`/`password_reset`/`other`) | ⚠️ Exists in schema but specific tables are used; likely dead table |

---

### Domain 3 — Courses (6 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `cours_recurrent` | Weekly recurring course schedule (planning template) | `id`, `type_cours`, `jour_semaine`, `heure_debut`, `heure_fin`, `active` | ✅ Full CRUD via `courses` module |
| `cours` | Concrete course instances (realized sessions) | `id`, `cours_recurrent_id`, `date_cours`, `type_cours`, `heure_debut`, `heure_fin` | ✅ Full CRUD + generation via `courses` module |
| `professeurs` | Instructors (separate entity from users) | `id`, `nom`, `prenom`, `email`, `specialite`, `grade_id`, `actif` | ✅ Full CRUD — GET list, GET/:id, POST, PUT/:id, DELETE/:id |
| `cours_recurrent_professeur` | Many-to-many: recurring courses ↔ professors | `cours_recurrent_id`, `professeur_id` | ⚠️ Managed implicitly through course creation/update — no dedicated endpoint |
| `inscriptions` | User enrollments in specific course sessions | `user_id`, `cours_id`, `status_id`, `commentaire` | ✅ Create, list per session, delete — `GET /sessions/my-enrollments` added |
| `reservations` | User reservations for upcoming sessions | `user_id`, `cours_id`, `statut` (`confirmee`/`annulee`/`en_attente`) | ✅ Full CRUD + cancel via `reservations` module |

---

### Domain 4 — Payments (2 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `paiements` | All payments (stripe, cash, transfer…) | `user_id`, `plan_tarifaire_id`, `montant`, `methode_paiement`, `statut`, `stripe_payment_intent_id` | ✅ Full CRUD + Stripe integration via `payments` module |
| `echeances_paiements` | Monthly payment deadlines per subscription | `user_id`, `plan_tarifaire_id`, `montant`, `date_echeance`, `statut` (`en_attente`/`paye`/`en_retard`/`annule`) | ⚠️ Read, filter overdue, mark paid — no CREATE or DELETE endpoint |

---

### Domain 5 — Store (6 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `articles` | Store items for sale | `id`, `nom`, `description`, `prix`, `categorie_id`, `actif` | ✅ Full CRUD + toggle + image upload via `store` module |
| `images` | Article images with ordering | `article_id`, `url`, `ordre` | ✅ Upload and delete via `store` module |
| `stocks` | Stock levels per article + size | `article_id`, `taille_id`, `quantite`, `quantite_minimum`, `stock_physique`, `stock_reserve`, `stock_disponible` | ✅ Full management via `store` module |
| `commandes` | Customer orders | `unique_id`, `numero_commande`, `user_id`, `total`, `statut` | ✅ Full CRUD + cancel + status update via `store` module |
| `commande_articles` | Line items within an order | `commande_id`, `article_id`, `taille_id`, `quantite`, `prix` | ✅ Managed via order creation |
| `mouvements_stock` | Stock movement history (all CRUD reasons) | `article_id`, `taille`, `type_mouvement`, `quantite_avant`, `quantite_apres`, `commande_id` | ✅ Read movements via `store` module; written automatically |

---

### Domain 6 — Messaging (5 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `messages` | Direct messages between users | `expediteur_id`, `destinataire_id`, `sujet`, `contenu`, `lu`, `date_lecture` | ✅ Inbox, sent, send, read, delete via `messaging` module |
| `message_status` | Status history per message (envoye/lu/archive/supprime) | `message_id`, `statut` | ⚠️ Written internally — `archive` and `supprime` statuses not exposed via API |
| `types_messages_personnalises` | Categories/types for message templates | `id`, `nom`, `description` | ✅ Full CRUD via `templates` module |
| `messages_personnalises` | Reusable message templates (newsletters, alerts…) | `type_id`, `titre`, `contenu`, `actif` | ✅ Full CRUD + toggle + preview + send via `templates` module |
| `notifications` | System push notifications per user | `user_id`, `type`, `titre`, `contenu`, `lu` | ⚠️ Read, mark read, count — no admin POST/broadcast, no DELETE |

---

### Domain 7 — Alerts (3 tables) ❌ ENTIRELY UNIMPLEMENTED

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `alertes_types` | Alert type definitions with priority levels | `id`, `code` (e.g. `PAYMENT_OVERDUE`), `nom`, `priorite` (`basse`/`normale`/`haute`/`critique`), `actif` | ❌ No backend module |
| `alertes_utilisateurs` | Active/resolved alerts per user | `user_id`, `alerte_type_id`, `statut` (`active`/`resolue`/`ignoree`), `donnees_contexte` (JSON), `date_detection` | ❌ No backend module |
| `alertes_actions` | Audit trail of actions taken on alerts | `alerte_user_id`, `user_id`, `action_type`, `description` | ❌ No backend module |

> **Note:** The alerts system is 100% missing. Three tables exist in the DB schema with no corresponding backend module and no frontend feature. This is the largest single gap in the project.

---

### Domain 8 — Groups (2 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `groupes` | Named user groups (competition, kids, etc.) | `id`, `nom`, `description` | ✅ Full CRUD via `groups` module |
| `groupes_utilisateurs` | Group membership (user ↔ group) | `groupe_id`, `user_id` | ✅ Add/remove members via `groups` module |

---

### Domain 9 — System (2 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `statistiques` | Aggregated club stats cache table | `type`, `cle`, `valeur` (JSON-capable), `date_stat` | ⚠️ Never read/written by `statistics` module — module computes live from other tables |
| `informations` | Key-value store for all app settings | `cle` (unique), `valeur`, `description` | ✅ Full CRUD via `settings` module |

---

### Domain 10 — Families (2 tables)

| Table | Description | Key Columns | Backend |
|---|---|---|---|
| `familles` | Family group entity | `id`, `nom` | ⚠️ Created implicitly when adding first member — no admin CRUD |
| `membres_famille` | User ↔ family membership with roles | `famille_id`, `user_id`, `role` (`parent`/`tuteur`/`enfant`/`conjoint`/`autre`), `est_responsable`, `est_tuteur_legal` | ⚠️ Add/remove via `families` module — no admin list all families |

---

## Section 2: Backend Modules Status

### Module: `auth`
**Base path:** `/api/auth`

| Method | Route | Access | Status |
|---|---|---|-|
| POST | `/register` | Public | ✅ |
| POST | `/login` | Public | ✅ |
| POST | `/refresh` | Public (refresh token) | ✅ |
| POST | `/logout` | Public (refresh token) | ✅ |
| POST | `/logout-all` | Private | ✅ |
| POST | `/verify-email` | Public | ✅ |
| POST | `/resend-verification` | Public | ✅ |
| POST | `/forgot-password` | Public | ✅ |
| POST | `/reset-password` | Public | ✅ |
| GET | `/me` | Private | ✅ |
| GET | `/health` | Public | ✅ |
| GET | `/sessions` | Private | ✅ Sprint 5 (GAP-18) |
| DELETE | `/sessions/:id` | Private | ✅ Sprint 5 (GAP-18) |
| GET | `/audit/login-attempts` | Admin | ✅ Sprint 5 (GAP-14) |
| POST | `/change-email` | Private | ✅ Sprint 6 (GAP-15) |
| POST | `/confirm-email-change` | Public | ✅ Sprint 6 (GAP-15) |

**Missing endpoints:**
- `GET /export` — No CSV export of the member list

---

### Module: `courses`
**Base path:** `/api/courses`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Auth (all roles) | ✅ List recurring courses |
| POST | `/` | Admin | ✅ Create recurring course |
| GET | `/:id` | Auth (all roles) | ✅ Get recurring course |
| PUT | `/:id` | Admin | ✅ Update recurring course |
| DELETE | `/:id` | Admin | ✅ Delete recurring course |
| GET | `/professors` | Admin + Professor | ✅ List professors |
| POST | `/professors` | Admin | ✅ Create professor |
| PUT | `/professors/:id` | Admin | ✅ Update professor |
| GET | `/professors/:id` | Admin + Professor | ✅ Get professor by ID |
| DELETE | `/professors/:id` | Admin | ✅ Delete professor |
| GET | `/sessions` | Auth (all roles) | ✅ List course instances |
| POST | `/sessions` | Admin | ✅ Create session |
| POST | `/sessions/generate` | Admin | ✅ Auto-generate sessions |
| GET | `/sessions/my-enrollments` | Auth (all roles) | ✅ Member's own enrollment history |
| GET | `/sessions/:id` | Auth (all roles) | ✅ Get session |
| GET | `/sessions/:id/inscriptions` | Admin + Professor | ✅ List enrollments |
| POST | `/sessions/:id/inscriptions` | Admin + Professor | ✅ Create enrollment |
| PATCH | `/sessions/:id/presence` | Admin + Professor | ✅ Bulk update attendance |
| DELETE | `/inscriptions/:inscriptionId` | Admin + Professor | ✅ Delete enrollment |

**Missing endpoints:**
- `GET /sessions/:id/presence` — Cannot fetch the current attendance sheet (GET, as opposed to PATCH)
- No attendance export (CSV/PDF generation)
- No link between `professeurs` table and `utilisateurs` table (professors are a separate entity not tied to user accounts)

---

### Module: `families`
**Base path:** `/api/families`

| Method | Route | Access | Status |
|---|---|---|---|
| POST | `/members` | Private | ✅ Add child/member to own family |
| GET | `/my-family` | Private | ✅ Get own family with all members |
| DELETE | `/members/:userId` | Private | ✅ Remove member from own family |

**Missing endpoints:**
- `GET /` (admin) — No way to list all families in the system
- `GET /:id` (admin) — No way to view a specific family as admin
- `PUT /:id` (admin) — No way to rename a family
- `DELETE /:id` (admin) — No way to delete a family
- `GET /:id/members` (admin) — No admin endpoint to inspect a family's members
- `POST /:id/members` (admin) — Admin cannot add a member to any family

---

### Module: `grades`
**Base path:** `/api/grades`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Auth | ✅ |
| GET | `/:id` | Auth | ✅ |
| POST | `/` | Admin | ✅ |
| PUT | `/:id` | Admin | ✅ |
| DELETE | `/:id` | Admin | ✅ |

**Status:** ✅ Fully implemented. No gaps.

---

### Module: `groups`
**Base path:** `/api/groups`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Admin + Professor | ✅ Paginated list |
| POST | `/` | Admin | ✅ |
| GET | `/:id` | Admin + Professor | ✅ |
| PUT | `/:id` | Admin | ✅ |
| DELETE | `/:id` | Admin | ✅ |
| GET | `/:id/members` | Admin + Professor | ✅ |
| POST | `/:id/members` | Admin | ✅ |
| DELETE | `/:id/members/:userId` | Admin | ✅ |

**Status:** ✅ Fully implemented. No gaps.

---

### Module: `messaging`
**Base path:** `/api/messages`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/unread-count` | Private | ✅ |
| GET | `/inbox` | Private | ✅ |
| GET | `/sent` | Private | ✅ |
| POST | `/send` | Private | ✅ Supports broadcast |
| GET | `/:id` | Private | ✅ Auto-marks as read |
| DELETE | `/:id` | Private | ✅ |

**Missing endpoints:**
- `POST /:id/archive` — The DB has an `archive` status in `message_status` but it's never set
- `GET /search` — No full-text search on messages
- No conversation/thread grouping (messages are individual, not threaded)
- No reply functionality (no `parent_message_id` concept exposed)

---

### Module: `notifications`
**Base path:** `/api/notifications`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Private | ✅ List own notifications |
| GET | `/unread-count` | Private | ✅ |
| POST | `/read-all` | Private | ✅ Mark all as read |
| PATCH | `/:id/read` | Private | ✅ Mark single as read |

**Missing endpoints:**
- `DELETE /:id` — Users cannot delete individual notifications
- `DELETE /all` — Users cannot clear all notifications
- `POST /` (admin) — Admins cannot manually create notifications for a user
- `POST /broadcast` (admin) — No admin broadcast to a group/all members

---

### Module: `payments`
**Base path:** `/api/payments`

| Method | Route | Access | Status |
|---|---|---|---|
| POST | `/stripe/webhook` | Public | ✅ Stripe webhook |
| GET | `/plans` | Admin + Professor | ✅ |
| GET | `/plans/:id` | Admin + Professor | ✅ |
| POST | `/plans` | Admin | ✅ |
| PUT | `/plans/:id` | Admin | ✅ |
| PATCH | `/plans/:id/toggle` | Admin | ✅ |
| DELETE | `/plans/:id` | Admin | ✅ |
| GET | `/` | Admin + Professor | ✅ Paginated list |
| POST | `/` | Admin | ✅ Manual payment |
| POST | `/stripe/intent` | Admin | ✅ Create PaymentIntent |
| GET | `/user/:userId` | All roles | ✅ |
| GET | `/schedules` | Admin + Professor | ✅ |
| GET | `/schedules/overdue` | Admin + Professor | ✅ |
| GET | `/schedules/user/:userId` | All roles | ✅ |
| PATCH | `/schedules/:id/pay` | Admin | ✅ Mark as paid |
| GET | `/:id` | Admin + Professor | ✅ |

**Missing endpoints:**
- `POST /schedules` — Cannot manually create a payment schedule/deadline
- `DELETE /schedules/:id` — Cannot delete a schedule
- `POST /schedules/generate/:userId` — No automatic schedule generation from a plan assignment
- `GET /export` (admin) — No CSV/PDF export of payment history
- No Stripe Customer Portal link endpoint
- No refund endpoint (`rembourse` status exists in DB but no route triggers it)

---

### Module: `recovery`
**Base path:** `/api/recovery`

| Method | Route | Access | Status |
|---|---|---|---|
| POST | `/public` | **Public (no auth)** | ✅ Submit manual recovery request |
| GET | `/` | Admin only | ✅ List recovery requests (paginated, filterable by status) |
| PATCH | `/:id` | Admin only | ✅ Process request (approve/reject) |

**Status:** ✅ Fully implemented — public submission + admin management both complete.

---

### Module: `references`
**Base path:** `/api/references`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Public | ✅ All references at once |
| GET | `/methodes-paiement` | Public | ✅ |
| GET | `/statuts-commande` | Public | ✅ |
| GET | `/types-cours` | Public | ✅ |
| GET | `/statuts-paiement` | Public | ✅ |
| GET | `/statuts-echeance` | Public | ✅ |
| GET | `/roles-utilisateur` | Public | ✅ |
| GET | `/roles-familial` | Public | ✅ |
| GET | `/genres` | Public | ✅ |

**Status:** ✅ Fully implemented for its scope. Serves ENUM-derived data and lookup tables.

---

### Module: `reservations`
**Base path:** `/api/reservations`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | All roles | ✅ Filtered list |
| GET | `/my` | All roles | ✅ Own reservations only |
| GET | `/course/:coursId` | Admin + Professor | ✅ |
| POST | `/` | All roles | ✅ Create reservation |
| PATCH | `/:id/cancel` | All roles | ✅ Cancel reservation |

**Missing endpoints:**
- `DELETE /:id` — Reservations can only be cancelled, not hard-deleted
- `PATCH /course/:coursId/cancel-all` — No bulk admin cancellation for a course
- No attendance confirmation endpoint (confirm presence after attending)

---

### Module: `settings`
**Base path:** `/api/settings`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Admin + Professor | ✅ |
| GET | `/key/:cle` | Admin + Professor | ✅ |
| PUT | `/key/:cle` | Admin | ✅ |
| POST | `/bulk` | Admin | ✅ |
| DELETE | `/:id` | Admin | ✅ |

**Status:** ✅ Fully implemented.

---

### Module: `statistics`
**Base path:** `/api/statistics`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/health` | Public | ✅ |
| GET | `/dashboard` | Auth | ✅ Full dashboard |
| GET | `/members` | Auth | ✅ Member analytics |
| GET | `/courses` | Auth | ✅ Course analytics |
| GET | `/financial` | Auth | ✅ Financial analytics |
| GET | `/store` | Auth | ✅ Store analytics |
| GET | `/trends` | Auth | ✅ Trend analytics |
| GET | `/metrics/:metric` | Auth | ✅ Specific metric |

**Missing endpoints / gaps:**
- `POST /snapshot` — No endpoint to persist a stats snapshot to the `statistiques` table; the table exists but is never written to. Real-time computation works but historical snapshots are lost on DB recalculation.
- `GET /snapshots` — No endpoint to read cached stats from the `statistiques` table
- No role guard on most endpoints (currently `Auth` without role restriction — professor and member can read all financial stats)

---

### Module: `store`
**Base path:** `/api/store`

| Method | Route | Access | Status |
|---|---|---|---|
| POST | `/categories/reorder` | Admin | ✅ |
| GET/POST/PUT/DELETE | `/categories(/:id)` | All/Admin | ✅ |
| GET/POST/PUT/DELETE | `/sizes(/:id)` | All/Admin | ✅ |
| GET/POST/PUT/DELETE | `/articles(/:id)` | All/Admin | ✅ |
| PATCH | `/articles/:id/toggle` | Admin | ✅ |
| POST | `/articles/:id/images` | Admin | ✅ Image upload |
| DELETE | `/articles/:articleId/images/:imageId` | Admin | ✅ |
| GET | `/orders/my` | Private | ✅ |
| GET/POST | `/orders(/:id)` | Admin+Prof/All | ✅ |
| PATCH | `/orders/:id/status` | Admin | ✅ |
| POST | `/orders/:id/cancel` | Auth | ✅ |
| GET | `/stocks(/:id)` | Admin | ✅ |
| GET | `/stocks/low` | Admin | ✅ |
| GET | `/stocks/article/:articleId` | Admin | ✅ |
| GET | `/stocks/movements` | Admin | ✅ |
| PUT | `/stocks/:id` | Admin | ✅ |
| POST | `/stocks/:id/adjust` | Admin | ✅ |

**Status:** ✅ Fully implemented. The store module is the most complete in the project.

---

### Module: `templates`
**Base path:** `/api/templates`

| Method | Route | Access | Status |
|---|---|---|---|
| GET/POST | `/types` | Admin + Professor | ✅ |
| PUT/DELETE | `/types/:id` | Admin+Prof/Admin | ✅ |
| GET/POST | `/(/:id)` | Admin + Professor | ✅ |
| PUT/DELETE | `/:id` | Admin + Professor | ✅ |
| PATCH | `/:id/toggle` | Admin + Professor | ✅ |
| POST | `/:id/preview` | Admin + Professor | ✅ |
| POST | `/:id/send` | Admin + Professor | ✅ |

**Status:** ✅ Fully implemented. However, **there is no frontend feature for this module.**

---

### Module: `users`
**Base path:** `/api/users`

| Method | Route | Access | Status |
|---|---|---|---|
| GET | `/` | Admin + Professor | ✅ Paginated list |
| POST | `/notify-bulk` | Admin + Professor | ✅ Bulk notification |
| GET | `/:id` | Admin + Professor | ✅ |
| GET | `/:id/profile` | Private (own or admin) | ✅ |
| PATCH | `/:id/profile` | Private (own or admin) | ✅ |
| PATCH | `/:id/role` | Admin | ✅ |
| PATCH | `/:id/status` | Admin | ✅ |
| PATCH | `/:id/language` | Private | ✅ |
| DELETE | `/:id` | Admin | ✅ Soft delete |
| POST | `/:id/restore` | Admin | ✅ Restore soft-deleted |

**Missing endpoints:**
- `GET /deleted` — No endpoint to list soft-deleted users; admins cannot see who was deleted
- `POST /:id/anonymize` — No GDPR anonymization endpoint despite `anonymized` column in DB
- `GET /export` — No CSV export of the member list
- `POST /import` — No bulk import of members
- `PATCH /:id/subscription` — No direct endpoint to change a user's subscription plan (`abonnement_id`)
- `GET /:id/payments` — This exists via the payments module at `/payments/user/:userId` but is not symmetric with the users API

---

### ❌ Missing Backend Modules (zero implementation)

#### Module: `alerts` — Tables: `alertes_types`, `alertes_utilisateurs`, `alertes_actions`

This entire domain has no backend module whatsoever. Required endpoints would include:

| Method | Route | Description |
|---|---|---|
| GET | `/api/alerts/types` | List alert types |
| POST | `/api/alerts/types` | Create alert type |
| PUT | `/api/alerts/types/:id` | Update alert type |
| DELETE | `/api/alerts/types/:id` | Delete alert type |
| GET | `/api/alerts` | List user alerts (admin: all, member: own) |
| POST | `/api/alerts` | Trigger a new alert |
| GET | `/api/alerts/:id` | Get alert details |
| PATCH | `/api/alerts/:id/resolve` | Resolve an alert |
| PATCH | `/api/alerts/:id/ignore` | Ignore an alert |
| GET | `/api/alerts/:id/actions` | List actions taken on an alert |
| POST | `/api/alerts/:id/actions` | Add an action to an alert |
| GET | `/api/alerts/user/:userId` | All alerts for a user |

---

## Section 3: Frontend Features Status

### Feature: `auth`
**Pages:**

| File | Description | Status |
|---|---|---|
| `LoginPage.tsx` | Login form with JWT | ✅ |
| `RegisterPage.tsx` | New account registration | ✅ |
| `ForgotPasswordPage.tsx` | Request password reset email | ✅ |
| `ResetPasswordPage.tsx` | Set new password from token | ✅ |
| `EmailVerificationPage.tsx` | Confirm email via token | ✅ |
| `RecoveryRequestPage.tsx` | Public form to submit a manual recovery request | ✅ |

**Missing pages:**
- No `ChangeEmailPage` — No flow to change email address
- No `ActiveSessionsPage` — No page to see and revoke active sessions

---

### Feature: `courses`
**Pages:**

| File | Description | Status |
|---|---|---|
| `CoursesPage.tsx` | Single tabbed page — Planning (recurring), Sessions (instances), Attendance sheet | ✅ Admin/Prof view |
| `MyCoursesPage.tsx` | Member view — own enrollment history with presence badges | ✅ |

**Missing pages:**
- No `CourseDetailPage` — No full-screen course detail/session view
- No dedicated professor management page (embedded in CoursesPage tabs but not a standalone CRUD UI)

---

### Feature: `dashboard`
**Pages:**

| File | Description | Status |
|---|---|---|
| `DashboardPage.tsx` | App home dashboard (non-stats; role-based widget layout) | ✅ |

---

### Feature: `families`
**Pages:**

| File | Description | Status |
|---|---|---|
| `FamilyPage.tsx` | View own family, add/remove members | ✅ Member view |

**Missing pages:**
- No `AdminFamiliesPage` — No admin view of all families in the club
- No `FamilyDetailPage` — No admin detail view for a specific family

---

### Feature: `groups`
**Pages:**

| File | Description | Status |
|---|---|---|
| `GroupsPage.tsx` | Full CRUD groups + member management table | ✅ |

---

### Feature: `messaging`
**Pages:**

| File | Description | Status |
|---|---|---|
| `MessagesPage.tsx` | Inbox, sent messages, compose modal | ✅ |

**Missing pages:**
- No `MessageDetailPage` — Messages are read inline/modal, no dedicated page per message
- No `ComposeMessagePage` — Composition is modal-only, no full-screen compose view
- No archived messages view

---

### Feature: `notifications`
**Pages:**

| File | Description | Status |
|---|---|---|
| `NotificationsPage.tsx` | List all notifications, mark as read | ✅ |

**Missing pages:**
- No admin notification broadcast page
- No notification preference/settings page per user

---

### Feature: `payments`
**Pages:**

| File | Description | Status |
|---|---|---|
| `PaymentsPage.tsx` | Tabbed: Payments list, Schedules (overdues), Pricing Plans | ✅ Admin view |

**Missing pages:**
- No `MyPaymentsPage` — Members have no dedicated page to see their own payment history and upcoming deadlines. They rely on the admin view filtered to their user ID, which is confusing.
- No `StripeCheckoutPage` — No frontend flow for members to pay online via Stripe (despite the backend creating PaymentIntents)
- No `SubscriptionPage` — No dedicated page for a member to manage their subscription plan

---

### Feature: `reservations`
**Pages:**

| File | Description | Status |
|---|---|---|
| `ReservationsPage.tsx` | List reservations, filter by course/user, cancel | ✅ |

**Missing pages:**
- No member-specific reservation creation page (inline in reservations page, but no booking flow per course)

---

### Feature: `settings`
**Pages:**

| File | Description | Status |
|---|---|---|
| `SettingsPage.tsx` | 8-tab settings: Club info, Schedule, Social, Finance, Appearance, Navigation, Localization, **Grades manager** | ✅ Admin only |

> Note: Grades management is embedded in the settings page — there is no standalone `grades` feature folder.

---

### Feature: `statistics`
**Pages:**

| File | Description | Status |
|---|---|---|
| `DashboardPage.tsx` | Overview + 5-tab dashboard (overview, members, courses, finance, store) | ✅ |
| `CoursesStatsPage.tsx` | Dedicated courses analytics page | ✅ |
| `FinanceStatsPage.tsx` | Dedicated financial analytics page | ✅ |
| `MembersStatsPage.tsx` | Dedicated members analytics page | ✅ |
| `StoreStatsPage.tsx` | Dedicated store analytics page | ✅ |

**Missing pages:**
- No `AlertsStatisticsPage` — No analytics on alert frequency or response times
- No `AttendanceReportPage` — No printable attendance report per course/period
- No `FinancialExportPage` — No export-to-CSV/PDF of financial summaries

---

### Feature: `store`
**Pages:**

| File | Description | Status |
|---|---|---|
| `StorePage.tsx` | Admin tabs: Catalogue, Orders, Stocks, Movements, Config. Member tabs: Boutique, My Orders | ✅ Dual view |

---

### Feature: `users`
**Pages:**

| File | Description | Status |
|---|---|---|
| `UsersPage.tsx` | Admin: liste paginiée + onglets (Actifs / Supprimés / Groupes) | ✅ |
| `DeletedUsersPage.tsx` | Gestion comptes supprimés — onglet dans `UsersPage` | ✅ |
| `GroupsPage.tsx` | Gestion des groupes — onglet dans `UsersPage` | ✅ |
| `ProfilePage.tsx` | Profil utilisateur — layout tabulé (Mon profil / Sécurité) avec `PageHeader`, formulaire édition, changement d'email (GAP-15) et gestion sessions | ✅ |

**Missing pages:**
- No `GDPRManagementPage` — No GDPR compliance UI (right to erasure, anonymization, data export)

---

### ❌ Missing Frontend Features (zero pages)

| Feature | Backend Module | Notes |
|---|---|---|
| `alerts` | ❌ None | Entire alerts system missing from both backend and frontend |
| `templates` | ✅ Complete | Backend is built — no frontend UI exists to manage templates |

---

## Section 4: Gap Summary — What Remains To Be Done

Organized by **priority** (critical first). Each item includes DB tables used, work needed, and complexity estimate.

---

### 🔴 CRITICAL — Breaks Core Functionality

#### GAP-01: Alerts System (complete implementation from scratch)

| Aspect | Detail |
|---|---|
| **DB tables** | `alertes_types`, `alertes_utilisateurs`, `alertes_actions` |
| **Backend work** | Create new `alerts` module with full CRUD (alert types, user alerts, actions). Add automatic alert triggers on: payment overdue, low stock, account issues. |
| **Frontend work** | New `alerts` feature: `AlertsPage` (admin dashboard), `AlertDetailPage`, notification badge in sidebar for active alerts count. |
| **Complexity** | 🔴 **Large** — 3 tables, new module, automated triggers, admin + member views |

---

#### ~~GAP-02: Recovery Request — Missing Public Submission Endpoint~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `manual_recovery_requests` |
| **Backend work** | ✅ `POST /api/recovery/public` (public, no auth) — merged in `feature/gap02-recovery-public-submit` |
| **Frontend work** | ✅ `RecoveryRequestPage` created in `auth` feature, route `/recovery-request` added |
| **Completed** | Sprint 1 — `feature/gap02-recovery-public-submit` |

---

### 🟠 HIGH PRIORITY — Core Features Incomplete

#### GAP-03: Templates — No Frontend

| Aspect | Detail |
|---|---|
| **DB tables** | `types_messages_personnalises`, `messages_personnalises` |
| **Backend work** | None — backend is 100% complete. |
| **Frontend work** | New `templates` feature folder. Pages needed: `TemplatesPage` (list with filters), `TemplateEditorPage` (create/edit rich-text template), `TemplatePreviewModal`, inline "Send Now" flow. |
| **Complexity** | 🟠 **Medium** — Backend exists; only frontend work. UI for rich template editing can be complex. |

---

#### GAP-04: User Soft Delete / GDPR Management

| Aspect | Detail |
|---|---|
| **DB tables** | `utilisateurs` (columns: `deleted_at`, `deleted_by`, `deletion_reason`, `anonymized`) |
| **Backend work** | Add `GET /api/users/deleted` (admin: list soft-deleted users). Add `POST /api/users/:id/anonymize` (admin: GDPR anonymization — zero out PII). |
| **Frontend work** | Add `DeletedUsersPage` in `users` feature showing deleted users with restore/anonymize actions. Add GDPR controls to `ProfilePage` (request deletion). |
| **Complexity** | 🟡 **Small–Medium** — DB columns exist. Backend: 2 new endpoints. Frontend: 1 new page + ProfilePage additions. |

---

#### GAP-05: Member-Facing Payment Pages (Stripe Checkout + My Payments)

| Aspect | Detail |
|---|---|
| **DB tables** | `paiements`, `echeances_paiements`, `plans_tarifaires` |
| **Backend work** | Minor: Add `POST /api/payments/schedules` (create schedule manually). Add `POST /api/payments/:id/refund`. |
| **Frontend work** | New `MyPaymentsPage` in `payments` feature (member's own payment history + upcoming deadlines). New `StripeCheckoutPage` (Stripe Elements integration for members to pay online). |
| **Complexity** | 🟠 **Medium** — Backend backend minor; frontend Stripe Elements integration is non-trivial. |

---

#### GAP-06: Families — Admin Management

| Aspect | Detail |
|---|---|
| **DB tables** | `familles`, `membres_famille` |
| **Backend work** | Add admin endpoints: `GET /api/families`, `GET /api/families/:id`, `PUT /api/families/:id`, `DELETE /api/families/:id`, `GET /api/families/:id/members`, `POST /api/families/:id/members`. |
| **Frontend work** | Add `AdminFamiliesPage` in `families` feature showing all families with counts. Add `FamilyDetailPage`. |
| **Complexity** | 🟡 **Small–Medium** — Pattern is identical to groups module; can be adapted. |

---

#### ~~GAP-07: Member Courses View (My Enrollments)~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `inscriptions`, `cours`, `cours_recurrent` |
| **Backend work** | ✅ `GET /api/courses/sessions/my-enrollments` — merged in `feature/gap07-courses-my-enrollments` |
| **Frontend work** | ✅ `MyCoursesPage` created — route `/my-courses`, sidebar link, i18n FR/EN |
| **Completed** | Sprint 1 — `feature/gap07-courses-my-enrollments` |

---

### 🟡 MEDIUM PRIORITY — Missing but Non-Blocking

#### ~~GAP-08: Professors — Incomplete CRUD~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `professeurs`, `cours_recurrent_professeur` |
| **Backend work** | ✅ `GET /professors/:id` + `DELETE /professors/:id` — merged in `feature/gap08-professors-complete-crud` |
| **Frontend work** | ✅ Delete button + ConfirmDialog added to professors table in `CoursesPage` |
| **Completed** | Sprint 1 — `feature/gap08-professors-complete-crud` |

---

#### ~~GAP-09: Admin Notification Broadcast~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `notifications`, `utilisateurs` |
| **Backend work** | ✅ `POST /api/notifications/broadcast` — `BroadcastNotificationUseCase` + bulk INSERT par cible (`tous`/`admin`/`professor`/`member`). |
| **Frontend work** | ✅ `BroadcastNotificationModal` admin + bouton violet `BullhornIcon` dans `NotificationsPage` (visible admin uniquement). |
| **Complexity** | 🟡 **Small–Medium** — Backend : 2 endpoints. Frontend : modal/form in existing notifications page. |
| **Sprint** | Sprint 5 ✅ |

---

#### ~~GAP-10: Notification Deletion by User~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `notifications` |
| **Backend work** | ✅ `DELETE /api/notifications/:id` + `DELETE /api/notifications/all` — use-cases + repository methods added. |
| **Frontend work** | ✅ 🗑️ delete button per notification item + red "Tout supprimer" button in page header. |
| **Complexity** | 🟢 **Small** — 2 endpoints + minor UI changes. |
| **Sprint** | Sprint 4 ✅ |

---

#### GAP-11: Statistics — Snapshot Persistence (statistiques table)

| Aspect | Detail |
|---|---|
| **DB tables** | `statistiques` |
| **Backend work** | Add a cron job or admin-triggered `POST /api/statistics/snapshot` that writes current computed stats to the `statistiques` table. Add `GET /api/statistics/history` to read historical snapshots. |
| **Frontend work** | Add historical view/chart in `FinanceStatsPage` and `MembersStatsPage` using snapshots instead of live data. |
| **Complexity** | 🟠 **Medium** — Requires cron/scheduler setup; non-trivial DB aggregation writes. |

---

#### GAP-12: Payment Schedule Creation & Auto-Generation

| Aspect | Detail |
|---|---|
| **DB tables** | `echeances_paiements`, `plans_tarifaires` |
| **Backend work** | Add `POST /api/payments/schedules` (admin: create a single deadline). Add `POST /api/payments/schedules/generate/:userId` (auto-generate schedules for a user based on their plan's `duree_mois`). |
| **Frontend work** | Add "Generate Schedules" button in the Schedules tab of `PaymentsPage`. |
| **Complexity** | 🟡 **Small–Medium** — Backend: 2 endpoints + date calculation logic. Frontend: minor addition. |

---

#### GAP-13: User Subscription Assignment

| Aspect | Detail |
|---|---|
| **DB tables** | `utilisateurs` (column `abonnement_id`), `plans_tarifaires` |
| **Backend work** | Add `PATCH /api/users/:id/subscription` to set/change a user's `abonnement_id`. |
| **Frontend work** | Add "Assign Subscription Plan" control in admin `UsersPage` user detail panel. |
| **Complexity** | 🟢 **Small** — 1 endpoint + dropdown in existing UI. |

---

#### ~~GAP-14: Security Audit Logs (Admin)~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `login_attempts` |
| **Backend work** | ✅ `GET /api/auth/audit/login-attempts` — paginé, filtrable par email/IP/échecs, admin only. |
| **Frontend work** | ✅ `SecuritySection` + onglet "Sécurité" (`ShieldCheckIcon`) dans `SettingsPage` avec tableau filtrable et pagination. |
| **Complexity** | 🟡 **Small–Medium** — 1 endpoint ; simple table UI. |
| **Sprint** | Sprint 5 ✅ |

---

#### ~~GAP-15: Email Change Flow~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `email_validation_tokens` (`token_type = 'change_email'`), `utilisateurs` |
| **Migration** | `010_add_email_change_support.sql` — ajout colonne `email` idempotent |
| **Backend** | `POST /api/auth/change-email` (privé) + `POST /api/auth/confirm-email-change` (public) |
| **Use-cases** | `RequestEmailChangeUseCase` + `ConfirmEmailChangeUseCase` |
| **Email** | `EmailService.sendEmailChangeConfirmationEmail` — envoi au nouvel email avec lien 24h |
| **Frontend** | `ChangeEmailSection` dans l'onglet Sécurité de `ProfilePage` + `ConfirmEmailChangePage` (`/confirm-email-change?token=xxx`) |
| **Sprint** | Sprint 6 ✅ |

---

### 🟢 LOW PRIORITY — Nice-to-Have / Polish

#### ~~GAP-16: Message Archiving~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `messages` (+ migration `003_add_messages_archived.sql` for `archived` column) |
| **Backend work** | ✅ `POST /api/messages/:id/archive` + `GET /api/messages/archived` — use-cases + repository. Inbox query excludes archived messages. |
| **Frontend work** | ✅ 📦 Archive button on inbox items + "Archives" tab in `MessagesPage`. |
| **Complexity** | 🟢 **Small** |
| **Sprint** | Sprint 4 ✅ |

---

#### GAP-17: Attendance Report Export

| Aspect | Detail |
|---|---|
| **DB tables** | `inscriptions`, `cours`, `utilisateurs` |
| **Backend work** | Add `GET /api/courses/sessions/:id/export` (returns CSV/PDF of attendance). |
| **Frontend work** | Add Export button to the attendance sheet view in `CoursesPage`. |
| **Complexity** | 🟡 **Small–Medium** — PDF generation library needed. |

---

#### ~~GAP-18: Active Sessions / Device Management~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `refresh_tokens` |
| **Backend work** | ✅ `GET /api/auth/sessions` + `DELETE /api/auth/sessions/:id` — ownership garanti (`user_id`). |
| **Frontend work** | ✅ `ActiveSessionsSection` dans `ProfilePage` — liste sessions avec IP/UA/dates + bouton Révoquer. |
| **Complexity** | 🟢 **Small** — 2 endpoints + ProfilePage section. |
| **Sprint** | Sprint 5 ✅ |

---

#### ~~GAP-19: Validation Tokens Table Cleanup~~ ✅ COMPLETED

| Aspect | Detail |
|---|---|
| **DB tables** | `validation_tokens` |
| **Backend work** | ✅ Audit completed — table confirmed unused in all TypeScript backend code. |
| **Frontend work** | None |
| **Complexity** | 🟢 **Small** — Audit + potential migration. |
| **Audit result** | ❌ Table NOT referenced in `backend/src/` (0 TS occurrences). Only `email_validation_tokens` and `password_reset_tokens` are actively used. |
| **Action taken** | Created `db/migrations/009_deprecate_validation_tokens.sql` — drops table after production row-count safety check. |
| **Doc** | See `docs/gap19-validation-tokens-audit.md` for full audit details. |
| **Sprint** | Sprint 4 ✅ |

---

### ⚪ SCHEMA COVERAGE — Zones de couverture partielle (Sprint 9)

> Ces 5 gaps ont été identifiés par analyse croisée post-Sprint 5 entre le schéma DB et les endpoints implémentés.
> Chacun correspond à une table active du schéma dont la surface API est **incomplète** malgré les sprints 1–8.
> Regroupement recommandé en un **Sprint 9 — Polish** d’environ 1 jour.

---

#### GAP-20: `auth_attempts` — Pas de lecture admin

| Aspect | Detail |
|---|---|
| **DB tables** | `auth_attempts` |
| **Problème** | La table est écrite par le système d’auth mais n’a aucun endpoint de lecture. GAP-14 a couvert `login_attempts` uniquement. |
| **Backend work** | Étendre `GET /api/auth/audit/login-attempts` pour interroger aussi `auth_attempts`, ou ajouter `GET /api/auth/audit/auth-attempts` séparément. |
| **Frontend work** | Ajouter un deuxième tableau dans `SecuritySection` ou un onglet secondaire. |
| **Complexity** | 🟢 **Small** — ~0.5j. Structure identique à `login_attempts`, code quasi-dupliqué. |
| **Priority** | 🟢 Low |

---

#### GAP-21: `cours_recurrent_professeur` — Pas d’endpoint dédié d’assignation

| Aspect | Detail |
|---|---|
| **DB tables** | `cours_recurrent_professeur` |
| **Problème** | La table de liaison cours ↔ professeurs est écrite implicitement à la création de cours mais il n’existe pas d’endpoint pour gérer ces assignations indépendamment. |
| **Backend work** | Ajouter `POST /api/courses/:id/professors` (assigner un prof) et `DELETE /api/courses/:id/professors/:professorId` (désassigner). |
| **Frontend work** | Ajouter un panneau d’assignation dans la vue de détail d’un cours récurrent dans `CoursesPage`. |
| **Complexity** | 🟢 **Small** — ~0.5j. 2 endpoints simples + UI inline. |
| **Priority** | 🟡 Medium — bloque la gestion fine des emplois du temps. |

---

#### GAP-22: `message_status` — Statut `supprime` jamais écrit

| Aspect | Detail |
|---|---|
| **DB tables** | `message_status` |
| **Problème** | La table est conçue pour tracer tout le cycle de vie d’un message (`envoye` → `lu` → `archive` → `supprime`). Le statut `archive` est écrit depuis GAP-16 ✅, mais `supprime` n’est jamais inséré lors d’une suppression, et l’historique n’est pas exposé via API. |
| **Backend work** | Écrire un enregistrement `supprime` dans `message_status` lors du `DELETE /messages/:id`. Ajouter optionnellement `GET /api/messages/:id/status-history`. |
| **Frontend work** | Aucune (interne/audit). |
| **Complexity** | 🟢 **Small** — ~0.25j. Modification d’un use-case existant. |
| **Priority** | 🟢 Low — table d’audit interne, pas visible côté utilisateur. |

---

#### GAP-23: `echeances_paiements` — Pas de `DELETE`

| Aspect | Detail |
|---|---|
| **DB tables** | `echeances_paiements` |
| **Problème** | Les échéances peuvent être créées (GAP-12 ✅) et marquées comme payées, mais aucun endpoint ne permet de les supprimer (ex : erreur de saisie, annulation d’un plan). |
| **Backend work** | Ajouter `DELETE /api/payments/schedules/:id` (admin only, avec vérification que le statut n’est pas `paye`). |
| **Frontend work** | Ajouter un bouton supprimer dans la vue Schedules de `PaymentsPage` (admin uniquement). |
| **Complexity** | 🟢 **Small** — ~0.25j. 1 endpoint + 1 bouton UI. |
| **Priority** | 🟢 Low — cas d’usage rare (correction d’erreur admin). |

---

#### GAP-24: `statistiques` — Role guards manquants sur les stats financières

| Aspect | Detail |
|---|---|
| **DB tables** | `statistiques` (+ toutes les tables source des agrégats) |
| **Problème** | Les endpoints `GET /api/statistics/financial` et `GET /api/statistics/dashboard` sont accessibles à tous les rôles authentifiés. Un membre normal peut donc lire le CA, les revenus et les paiements du club. |
| **Backend work** | Restreindre `GET /api/statistics/financial` au rôle `admin` uniquement. Garder `members`, `courses`, `store`, `trends` accessibles à `admin + professor`. Garder `dashboard` accessible à tous avec une réponse filtrée selon le rôle. |
| **Frontend work** | Masquer l’onglet Finances dans `StatisticsPage` pour les membres. |
| **Complexity** | 🟢 **Small** — ~0.25j. Ajout de middleware ou vérification `req.user.role_app` en haut de chaque handler concerné. |
| **Priority** | 🟡 **Medium** — fuite de données financières sensibles vers les membres. |

---

## Overall Progress Summary

| Domain | Backend | Frontend | Overall |
|---|---|---|---|
| Authentication / Security | ✅ ~100% | ✅ ~98% | ✅ 99% |
| Users & Profiles | ✅ ~95% | ✅ ~99% | ✅ 97% |
| Courses & Attendance | ✅ ~95% | ✅ ~90% | ✅ 92% |
| Payments & Subscriptions | ✅ ~95% | ✅ ~90% | ✅ 92% |
| Store (E-commerce) | ✅ 100% | ✅ 100% | ✅ 100% |
| Messaging | ✅ ~95% | ✅ ~95% | ✅ 95% |
| Notifications | ✅ ~97% | ✅ ~100% | ✅ 98% |
| **Alerts** | ❌ **0%** | ❌ **0%** | ❌ **0%** |
| Groups | ✅ 100% | ✅ 100% | ✅ 100% |
| Families | ⚠️ ~60% | ⚠️ ~50% | ⚠️ 55% |
| Statistics | ✅ ~90% | ✅ 100% | ✅ 95% |
| Settings | ✅ 100% | ✅ 100% | ✅ 100% |
| Templates | ✅ 100% | ✅ **100%** | ✅ **100%** |
| Recovery | ✅ **100%** | ✅ **100%** | ✅ **100%** |
| References | ✅ 100% | n/a | ✅ 100% |
| Grades | ✅ 100% | ✅ (via Settings) | ✅ 95% |

---

## Recommended Development Order (TFE Sprint Plan)

| Sprint | Priority | Gap IDs | Estimated Effort | Status |
|---|---|---|---|---|
| **Sprint 1** | 🔴 Critical | GAP-02 (recovery submission) | 0.5 day | ✅ Done |
| **Sprint 1** | 🔴 Critical | GAP-07 (my-enrollments full) | 1.5 days | ✅ Done |
| **Sprint 1** | 🟡 Medium | GAP-08 (professor CRUD full) | 1 day | ✅ Done |
| **Sprint 2** | 🟠 High | GAP-03 (templates frontend) | 3 days | ✅ Done |
| **Sprint 2** | 🟠 High | GAP-04 (GDPR/soft delete page) | 2 days | ✅ Done |
| **Sprint 3** | 🟠 High | GAP-05 (member payments + Stripe) | 3 days | ✅ Done |
| **Sprint 3** | 🟡 Medium | GAP-13 (subscription assignment) | 0.5 day | ✅ Done |
| **Sprint 3** | 🟡 Medium | GAP-12 (schedule generation) | 1 day | ✅ Done |
| **Sprint 4** | 🟢 Low/Small | GAP-10 (notification delete) | 0.5 day | ✅ Done |
| **Sprint 4** | 🟢 Small | GAP-16 (message archiving) | 0.5 day | ✅ Done |
| **Sprint 4** | 🟢 Low | GAP-19 (validation_tokens audit) | 0.5 day | ✅ Done |
| **Sprint 5** | 🟡 Medium | GAP-09 (broadcast notifications) | 1 day | ✅ Done |
| **Sprint 5** | 🟡 Medium | GAP-14 (security audit logs) | 1 day | ✅ Done |
| **Sprint 5** | 🟢 Small | GAP-18 (active sessions) | 1 day | ✅ Done |
| **Sprint Hotfix** | 🔧 Tech Debt | Merge conflicts résolus (5 fichiers), restructuration navigation (6 pages → onglets), migrations DB appliquées, scan backend complet | ~1.5 days | ✅ Done |
| **Sprint Style 1** | 🎨 UX | Icônes sur tous les `TabGroup` (PaymentsPage, StorePage, UsersPage, NotificationsPage) | 0.5 day | ✅ Done |
| **Sprint Style 2** | 🎨 UX | `UsersPage` — migration nav bruts vers `TabGroup` + layout card cohrent | 0.5 day | ✅ Done |
| **Sprint Style 3** | 🎨 UX | `ProfilePage` — refonte layout tabulé (`PageHeader` + onglets Mon profil / Sécurité) | 0.5 day | ✅ Done |
| Sprint 6 | 🟠 High | GAP-06 (families admin) | 2 days | ⏳ |
| ~~Sprint 6~~ | 🟡 Medium | ~~GAP-15 (email change)~~ | ~~1.5 days~~ | ✅ Done |
| Sprint 7 | 🟡 Medium | GAP-11 (stats snapshots) | 2 days | ⏳ |
| Sprint 7 | 🟡 Medium | GAP-17 (attendance export) | 1.5 days | ⏳ |
| Sprint 8 | 🔴 Critical | GAP-01 (alerts system — full) | 5–7 days | ⏳ |
| Sprint 9 | 🟢 Low/Medium | GAP-20 (auth_attempts read) | 0.5 day | ⏳ |
| Sprint 9 | 🟡 Medium | GAP-21 (cours_recurrent_professeur endpoints) | 0.5 day | ⏳ |
| Sprint 9 | 🟢 Low | GAP-22 (message_status supprime) | 0.25 day | ⏳ |
| Sprint 9 | 🟢 Low | GAP-23 (echeances_paiements DELETE) | 0.25 day | ⏳ |
| Sprint 9 | 🟡 Medium | GAP-24 (statistics role guards) | 0.25 day | ⏳ |

**Completed Sprint 1:** 3 developer days — 3 gaps fully closed (GAP-02 ✅, GAP-07 ✅, GAP-08 ✅)  
**Completed Sprint 2:** 2 developer days — 2 gaps fully closed (GAP-03 ✅, GAP-04 ✅)  
**Completed Sprint 3:** 4.5 developer days — 3 gaps fully closed (GAP-05 ✅, GAP-12 ✅, GAP-13 ✅)  
**Completed Sprint 4:** ~1.5 developer days — 3 gaps fully closed (GAP-10 ✅, GAP-16 ✅, GAP-19 ✅)  
**Completed Sprint 5:** ~3 developer days — 3 gaps fully closed (GAP-09 ✅, GAP-14 ✅, GAP-18 ✅)  
**Completed Sprint Hotfix:** ~1.5 developer days — dette technique résolue, navigation restructurée, codebase stable  
**Completed Sprint Style (1–3):** ~1.5 developer days — cohérence visuelle complète (icônes TabGroup, layouts UsersPage + ProfilePage)  
**Completed Sprint 6 partiel:** ~1 developer day — GAP-15 (email change flow) ✅  
**Total estimated remaining work: ~8–10 developer days (GAP-06 + Sprints 7–9)**

---

## Section 5: Coverage Analysis — What Remains After Sprint 9

> Cette section répond à la question : **« Après tous les sprints, a-t-on 100 % des fonctionnalités ? »**  
> La réponse dépend du niveau d’analyse : couverture DB, complétude API, ou finition UX frontend.

---

### Niveau 1 — Couverture DB (tables accessibles via API)
#### Résultat après Sprint 9 : ✅ ~100 %

Chaque table active du schéma dispose d’au moins un endpoint de lecture et d’écriture après l’exécution des 24 gaps (GAP-01 → GAP-24). C’est l’objectif principal du plan de sprint.

```
Tables actives   : 42  (1 dépréciée : validation_tokens)
Couvertes ✅      : 42
Partielles ⚠️     : 0  (toutes résolues par GAP-20 → GAP-24)
Non couvertes ❌  : 0
```

---

### Niveau 2 — Complétude API (endpoints logiquement attendus)
#### Résultat après Sprint 9 : ⚠️ ~90 %

Des endpoints utiles mais **hors scope des 24 gaps** ne seront pas implémentés. Ils ne correspondent pas à des tables manquantes mais à des opérations secondaires sur des ressources existantes.

| Endpoint absent | Module | Raison du non-gap |
|---|---|---|
| `GET /courses/sessions/:id/presence` | courses | Seul `PATCH` existe — lecture de la feuille de présence non exposée |
| `GET /payments/export` (CSV/PDF) | payments | Génération de fichier, lib externe nécessaire |
| `GET /users/export` (CSV) | users | Export liste membres, hors scope TFE |
| `POST /users/import` (bulk) | users | Import en masse, hors scope TFE |
| `GET /messages/search` | messaging | Recherche full-text, index DB spécifique nécessaire |
| `DELETE /reservations/:id` (hard) | reservations | Seulement annulation douce disponible |
| `PATCH /reservations/course/:id/cancel-all` | reservations | Annulation groupée admin, hors scope |
| Stripe Customer Portal URL | payments | Self-service abonnement Stripe, hors scope |
| Lien `professeurs` ↔ `utilisateurs` | courses | Les profs sont une entité séparée des comptes user |

> **Impact réel :** ces endpoints manquants ne bloquent aucun flux métier quotidien. Ils représentent des fonctionnalités de **confort admin** ou d’**intégration externe** (Stripe, exports).

---

### Niveau 3 — Finition UX Frontend (toutes les pages attendues)
#### Résultat après Sprint Style : ⚠️ ~92 %

> **Sprint Style — Cohérence visuelle complète :** Icônes ajoutées sur tous les `TabGroup`, `UsersPage` migrée vers le pattern card+TabGroup, `ProfilePage` refondue avec `PageHeader` + onglets Mon profil / Sécurité.

| Feature déplacée | Ancienne URL | Nouvel emplacement | Status |
|---|---|---|---|
| Mes inscriptions | `/my-courses` | Onglet dans `CoursesPage` | ✅ |
| Réservations | `/reservations` | Onglet dans `CoursesPage` | ✅ |
| Mes paiements | `/my-payments` | Onglet dans `PaymentsPage` | ✅ |
| Utilisateurs supprimés | `/users/deleted` | Onglet dans `UsersPage` | ✅ |
| Groupes | `/groups` | Onglet dans `UsersPage` | ✅ |
| Modèles | `/templates` | Onglet dans `MessagesPage` (déjà présent via `TemplatesTab`) | ✅ |

Plusieurs pages secondaires restent absentes et ne sont dans **aucun sprint planifié**.

| Page absente | Feature | Situation actuelle |
|---|---|---|
| `CourseDetailPage` | courses | Vue plénière par session — tout est dans des onglets inline |
| Page CRUD standalone Professeurs | courses | Embedé dans `CoursesPage`, pas de page dédiée |
| `SubscriptionPage` membre | payments | Aucune page pour qu'un membre gère son abonnement |
| `FinancialExportPage` | statistics | Pas d'export CSV/PDF des stats financières |
| `AttendanceReportPage` imprimable | courses | GAP-17 ajoute l'export, pas une page dédiée |
| `GDPRManagementPage` complète | users | GAP-04 a fait `DeletedUsersPage` (onglet Users), pas de page RGPD globale |
| Page de préférences notifications | notifications | Aucun réglage de notif. par utilisateur |
| `MessageDetailPage` (plein écran) | messaging | Messages lus en modal, pas en page dédiée |

> **Contexte TFE :** ces pages sont typiques d'un **Sprint 10** si le projet devait passer en production. Elles ne bloquent pas la démonstration ni l'évaluation académique du projet.

---

### Synthèse

```
Après Sprint Style (state actuel) :

  Niveau 1 — DB Coverage     ████████████████████  ~100 %  ✅ Objectif atteint
  Niveau 2 — API Coverage    ██████████████████░░   ~92 %  ⚠️ Endpoints confort manquants
  Niveau 3 — Frontend UX     ██████████████████░░   ~92 %  ⚠️ Pages secondaires absentes

Après Sprint 9 (projection) :

  Niveau 1 — DB Coverage     ████████████████████  ~100 %  ✅
  Niveau 2 — API Coverage    ███████████████████░   ~95 %  ✅ (GAP-20→24 résolus)
  Niveau 3 — Frontend UX     ██████████████████░░   ~92 %  ⚠️ Pages secondaires toujours absentes
```

**Ce qui est couvert à 100 % :** tous les **flux métier critiques** d'un club de sport — inscription, cours, présences, paiements, messagerie, notifications, familles, groupes, réservations, statistiques, paramètres. Navigation entièrement restructurée (sidebar épurée, fonctionnalités intégrées en onglets).

**Ce qui manquera encore :** fonctionnalités de confort admin (exports, imports, recherche), quelques pages UX secondaires, et les intégrations externes (Stripe Portal, impression PDF). Ce sont les priorités d'un **Sprint 10 production-ready** hypothétique.

---

## Section 6: Technical Debt Log

> Journal des corrections de dette technique effectuées hors gaps fonctionnels.

### Sprint Hotfix — Post-Sprint 5

#### 🔧 Merge Conflicts résolus (5 fichiers)

| Fichier | Type de problème | Résolution |
|---|---|---|
| `AuthController.ts` | Marqueurs git `<<<<<<`/`>>>>>>>` non résolus — méthode `getLoginAttempts` (GAP-14) vs `getSessions`+`revokeSession` (GAP-18) | Les deux méthodes conservées |
| `SchedulesTab.tsx` | State `useState` × 3 imports dupliqués, state × 2, modales `showCreate`/`showGenerate` × 2 | Imports et JSX dédupliqués |
| `NotificationsPage.tsx` | `<BroadcastNotificationModal>` hors du root JSX | Enveloppé dans Fragment `<>` |
| `PaymentScheduleController.ts` | Imports × 5 + déclarations module-level × 5 + méthodes `createSchedule`/`generateSchedules` × 5 | Fichier réécrit proprement |
| `003_add_messages_archived.sql` | Syntaxe `ADD COLUMN IF NOT EXISTS` invalide en MySQL (MariaDB only) | Réécriture avec pattern `INFORMATION_SCHEMA` |

#### 🗄️ Migrations DB appliquées

| Migration | Action | Résultat |
|---|---|---|
| `003_add_messages_archived.sql` | `ALTER TABLE messages ADD COLUMN archived` + index | ✅ Appliquée |
| `DROP TABLE IF EXISTS validation_tokens` | Suppression table inutilisée (GAP-19) | ✅ Appliquée (0 lignes confirmées) |

#### 🧭 Navigation restructurée

6 pages standalone supprimées du menu lateral et intégrées comme onglets dans leurs pages parentes. Voir tableau complet en Section 5 Niveau 3.

#### 🔍 Scan backend complet

38 fichiers analysés (22 controllers + 15 routes + `app.ts`) — 4 patterns de duplication vérifiés. Résultat : **100% clean** après les corrections ci-dessus.

---

### Sprint Style — Post-Sprint Hotfix

#### 🎨 Cohérence visuelle — NavigationTab (3 branches)

| Branche | Changement |
|---|---|
| `style/consistency-navigation-tabs` | Icônes Heroicons ajoutées sur tous les onglets sans icône : `PaymentsPage` (CreditCardIcon, ClockIcon, DocumentTextIcon, UserCircleIcon), `StorePage` (ShoppingBagIcon, ClipboardDocumentListIcon, ArchiveBoxIcon, ArrowsRightLeftIcon, Cog6ToothIcon), `UsersPage` (UsersIcon, TrashIcon, UserGroupIcon), `NotificationsPage` (BellIcon, EnvelopeOpenIcon + icônes PatternFly réutilisées) |
| `style/users-page-tab-layout` | `UsersPage` migrée : boutons HTML bruts → `<TabGroup>` ; `PageHeader` au top level ; `TabGroup` + contenu dans un seul card blanc ; modals extraites hors du bloc tab |
| `style/profile-page-layout` | `ProfilePage` refondue : `PageHeader` (UserCircleIcon) + `TabGroup` 2 onglets (Mon profil / Sécurité) dans un seul card ; panel info en `bg-gray-50` ; `bg-primary-*` remplacé par `bg-blue-*` ; `ChangeEmailSection` et `ActiveSessionsSection` en mode `flat` dans l'onglet Sécurité |

#### ✨ GAP-15 complété (Sprint 6 partiel)

| Fichier | Création / Modification |
|---|---|
| `010_add_email_change_support.sql` | Migration idempotente — `ADD COLUMN email` sur `email_validation_tokens` |
| `IAuthRepository.ts` | +`updateEmail`, +`storeEmailChangeToken`, +`validateEmailChangeToken` |
| `MySQLAuthRepository.ts` | Implémentation des 3 méthodes (`token_type = 'change_email'`) |
| `EmailService.ts` | +`sendEmailChangeConfirmationEmail` (HTML + text + fallback dev console) |
| `RequestEmailChangeUseCase.ts` | Validation → génération token 24h → envoi email de confirmation |
| `ConfirmEmailChangeUseCase.ts` | Validation token → `UPDATE utilisateurs SET email = ?` |
| `AuthController.ts` | +`requestEmailChange` (POST `/change-email`, privé) + `confirmEmailChange` (POST `/confirm-email-change`, public) |
| `authRoutes.ts` | 2 nouvelles routes enregistrées |
| `ChangeEmailSection.tsx` | Composant formulaire (prop `flat` pour mode inline dans onglet) |
| `ConfirmEmailChangePage.tsx` | Page publique `/confirm-email-change?token=xxx` (loading / succès / erreur) |
| `ProfilePage.tsx` | Monte `ChangeEmailSection` dans l'onglet Sécurité |
| `App.tsx` | Route publique `/confirm-email-change` enregistrée |

---

*End of Gap Analysis — ClubManager V3 — v4.4 schema — Last updated: Sprint 6 (GAP-15 ✅) + Sprint Style (cohérence visuelle ✅)*
