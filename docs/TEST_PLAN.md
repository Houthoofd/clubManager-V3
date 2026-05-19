# ClubManager V3 — Plan de Tests

> **Branche :** `feature/test-suite`
> **Objectif :** Couvrir les couches critiques du projet (backend use-cases + frontend composants/hooks) pour le TFE, en respectant l'architecture Clean en place.

---

## Table des matières

1. [Philosophie & Pyramide de tests](#1-philosophie--pyramide-de-tests)
2. [Stack & Outils](#2-stack--outils)
3. [Architecture des fichiers de test](#3-architecture-des-fichiers-de-test)
4. [Infrastructure partagée](#4-infrastructure-partagée)
5. [Sprints de test](#5-sprints-de-test)
6. [Couverture cible](#6-couverture-cible)
7. [Conventions de nommage](#7-conventions-de-nommage)
8. [Statut des sprints](#8-statut-des-sprints)

---

## 1. Philosophie & Pyramide de tests

```
                     ┌──────────────┐
                     │     E2E      │  ← Hors scope TFE
                   ┌─┴──────────────┴─┐
                   │  Intégration HTTP │  ~20 % de l'effort
                 ┌─┴──────────────────┴─┐
                 │      Unitaires        │  ~80 % de l'effort
                 └──────────────────────┘
```

### Règles fondamentales

- **Un test = une responsabilité.** Chaque `it()` vérifie exactement une chose.
- **Les tests ne touchent jamais la DB.** Toutes les dépendances externes sont mockées.
- **Les tests vivent avec le code.** Dossier `__tests__/` co-localisé, jamais dans un dossier racine global.
- **Fail fast.** Un test qui passe toujours n'a aucune valeur — on teste les cas d'erreur autant que les cas nominaux.
- **Pas de tests de présentation pure.** On ne teste pas la couleur d'un bouton ou le CSS — on teste le comportement.

### Ce qu'on teste / ce qu'on ne teste pas

| Testé ✅ | Non testé ❌ |
|---|---|
| Use-cases (logique métier) | Migrations SQL |
| Guards de rôle (403 vs 200) | Fichiers `index.ts` de re-export |
| Composants partagés réutilisables | Pages complètes (trop de dépendances) |
| Hooks React Query (états, erreurs) | CSS / Tailwind classes |
| Mappers DB → DTO | Configuration i18n |
| Services partagés (JWT, Password) | `server.ts` / `app.ts` |

---

## 2. Stack & Outils

### Backend

| Outil | Rôle | Config |
|---|---|---|
| **Jest** | Test runner | `backend/jest.config.cjs` |
| **ts-jest** | Compilation TS dans Jest | Preset `default-esm` |
| **supertest** | Requêtes HTTP sans serveur | `tests/e2e/` |

> Jest est déjà configuré avec un seuil de coverage à **70 %** (`jest.config.cjs`).

### Frontend

| Outil | Rôle | Config |
|---|---|---|
| **Vitest** | Test runner (Vite-native) | `frontend/vite.config.ts` |
| **@testing-library/react** | Rendu + interactions composants | — |
| **@testing-library/user-event** | Simulation clics, saisies | — |
| **@testing-library/jest-dom** | Matchers DOM enrichis | `setup.ts` |
| **MSW (mock-service-worker)** | Interception des appels API | `shared/test/mocks/` |

> MSW doit être installé : `pnpm add -D msw --filter frontend`

---

## 3. Architecture des fichiers de test

### Principe : co-localisation

Les tests habitent dans un dossier `__tests__/` **au même niveau** que les fichiers qu'ils testent.
Cela garantit que supprimer un module supprime aussi ses tests.

```
src/modules/<module>/
├── application/
│   └── use-cases/
│       ├── CreateAlertTypeUseCase.ts     ← source
│       └── __tests__/
│           └── CreateAlertTypeUseCase.test.ts   ← test unitaire
│
├── infrastructure/
│   └── repositories/
│       ├── MySQLAlertRepository.ts       ← source
│       └── __tests__/
│           └── mappers.test.ts           ← test des mappers uniquement (optionnel)
│
└── presentation/
    └── controllers/
        ├── AlertController.ts            ← source
        └── __tests__/
            └── AlertController.test.ts   ← test intégration HTTP
```

### Arborescence complète cible

```
backend/
├── src/
│   ├── shared/
│   │   └── services/
│   │       └── __tests__/                ✅ EXISTE
│   │           ├── JwtService.test.ts
│   │           ├── PasswordService.test.ts
│   │           └── TokenService.test.ts
│   │
│   └── modules/
│       ├── alerts/
│       │   └── application/use-cases/
│       │       └── __tests__/            ← Sprint Tests 1
│       ├── notifications/
│       │   └── application/use-cases/
│       │       └── __tests__/            ← Sprint Tests 1
│       ├── families/
│       │   └── application/use-cases/
│       │       └── __tests__/            ← Sprint Tests 1
│       └── auth/
│           └── application/use-cases/
│               └── __tests__/            ← Sprint Tests 1
│
└── tests/
    └── e2e/                              ← Sprint Tests 2
        ├── auth.test.ts
        ├── alerts.test.ts
        └── payments.test.ts

frontend/
└── src/
    ├── shared/
    │   ├── test/                         ← Sprint Tests 2 (infrastructure)
    │   │   ├── setup.ts
    │   │   ├── renderWithProviders.tsx
    │   │   └── mocks/
    │   │       ├── server.ts
    │   │       └── handlers/
    │   │           ├── alertsHandlers.ts
    │   │           └── notificationsHandlers.ts
    │   │
    │   └── components/
    │       ├── Badge/
    │       │   └── __tests__/            ← Sprint Tests 2
    │       ├── Button/
    │       │   └── __tests__/            ← Sprint Tests 2
    │       └── Forms/
    │           └── __tests__/            ← Sprint Tests 2
    │
    └── features/
        ├── alerts/
        │   ├── components/
        │   │   └── __tests__/            ← Sprint Tests 2
        │   └── hooks/
        │       └── __tests__/            ← Sprint Tests 2
        └── notifications/
            ├── components/
            │   └── __tests__/            ← Sprint Tests 2
            └── hooks/
                └── __tests__/            ← Sprint Tests 2
```

---

## 4. Infrastructure partagée

### 4.1 Backend — Mock du Repository

Chaque use-case reçoit son repository via **injection de dépendance** (constructeur).
Pour les tests, on remplace l'implémentation MySQL par un **mock Jest typé**.

```typescript
// Pattern standard pour tous les use-cases backend
import type { IAlertRepository } from '../../domain/repositories/IAlertRepository';

const mockRepo = {
  findAllAlertTypes: jest.fn(),
  createAlertType: jest.fn(),
  // ... toutes les méthodes de l'interface
} satisfies jest.Mocked<IAlertRepository>;

beforeEach(() => jest.clearAllMocks());
```

> Le mot-clé `satisfies` garantit que le mock implémente toutes les méthodes de l'interface — une erreur de compilation si on oublie une méthode.

### 4.2 Backend — Mock du pool DB (tests HTTP)

Pour les tests de controllers via supertest, on mock directement `pool.query` :

```typescript
jest.mock('@/core/database/connection', () => ({
  pool: { query: jest.fn(), execute: jest.fn() },
  testConnection: jest.fn().mockResolvedValue(true),
  closePool: jest.fn().mockResolvedValue(undefined),
}));
```

### 4.3 Frontend — `renderWithProviders`

Wrapper universel injecté dans chaque test de composant/hook :

```typescript
// frontend/src/shared/test/renderWithProviders.tsx
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18nTest}>
        <MemoryRouter>{ui}</MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
    options,
  );
}
```

### 4.4 Frontend — MSW Handlers

Chaque feature expose ses handlers MSW :

```typescript
// frontend/src/shared/test/mocks/handlers/alertsHandlers.ts
import { http, HttpResponse } from 'msw';

export const alertsHandlers = [
  http.get('/api/alerts/types', () =>
    HttpResponse.json({ success: true, data: [mockAlertType] })
  ),
  http.post('/api/alerts/types', () =>
    HttpResponse.json({ success: true, data: mockAlertType }, { status: 201 })
  ),
];
```

---

## 5. Sprints de test

### Sprint Tests 1 — Use-Cases Backend (priorité maximale)

**Objectif :** Couvrir toute la logique métier des modules principaux.
**Effort estimé :** ~2 jours
**Parallélisable :** Oui — un sub-agent par module

| Module | Use-Cases à tester | Cas nominaux | Cas d'erreur |
|---|---|---|---|
| `alerts` | `CreateAlertType`, `UpdateAlertType`, `DeleteAlertType`, `GetAlertTypes`, `CreateUserAlert`, `ResolveAlert`, `IgnoreAlert`, `GetAdminAlerts`, `GetUserAlerts`, `AddAlertAction`, `GetAlertActions` | ✅ résultat retourné, appel repo | ✅ repo lance erreur, params invalides |
| `notifications` | `CreateNotification`, `GetNotifications`, `MarkAsRead`, `MarkAllAsRead`, `DeleteNotification`, `DeleteAllNotifications`, `GetUnreadCount`, `BroadcastNotification` | ✅ | ✅ |
| `families` | `GetMyFamily`, `AddFamilyMember`, `RemoveFamilyMember`, `GetFamilies`, `AdminGetFamilyById`, `UpdateFamily`, `DeleteFamily`, `AdminAddFamilyMember` | ✅ | ✅ 404, conflict |
| `auth` | `LoginUseCase`, `RegisterUseCase`, `RefreshTokenUseCase`, `LogoutUseCase` | ✅ | ✅ user non trouvé, mot de passe incorrect, token expiré |

**Livrables :**
- `__tests__/` créés dans chaque `application/use-cases/`
- `pnpm --filter backend test` → vert
- Coverage use-cases ≥ 80 %

---

### Sprint Tests 2 — Infrastructure Frontend + Composants

**Objectif :** Valider les composants partagés et les hooks critiques.
**Effort estimé :** ~2 jours
**Dépend de :** MSW installé, `setup.ts` créé

#### 2a — Infrastructure de test frontend

| Fichier | Contenu |
|---|---|
| `shared/test/setup.ts` | Import `@testing-library/jest-dom` |
| `shared/test/renderWithProviders.tsx` | Wrapper QC + i18n + Router |
| `shared/test/mocks/server.ts` | Serveur MSW consolidé |
| `shared/test/mocks/handlers/alertsHandlers.ts` | Handlers HTTP pour alerts |
| `shared/test/mocks/handlers/notificationsHandlers.ts` | Handlers HTTP pour notifications |

#### 2b — Composants partagés

| Composant | Ce qu'on teste |
|---|---|
| `Badge` | Rendu selon `variant`, contenu text |
| `Button` | Rendu, disabled state, onClick |
| `AlertBanner` | Rendu variant danger/warning/info, message |
| `FormField` | Label, required marker, error message |
| `EmptyState` | Rendu titre + description + action optionnelle |

#### 2c — Composants features

| Composant | Ce qu'on teste |
|---|---|
| `AlertTypeBadge` | Couleur et label selon `priorite` |
| `AlertStatusBadge` | Couleur et label selon `statut` |
| `UserAlertCard` | Rendu données, boutons resolve/ignore visibles |
| `NotificationDropdown` | Liste notifications, badge count |

#### 2d — Hooks

| Hook | Ce qu'on teste |
|---|---|
| `useAlerts` | Chargement des types, mutation createAlertType (succès + erreur) |
| `useNotifications` | Chargement liste, markAsRead invalide le cache |
| `useMyAlerts` | Chargement alertes membre |

---

### Sprint Tests 3 — Intégration HTTP Backend (optionnel TFE)

**Objectif :** Tester les flux HTTP critiques avec supertest.
**Effort estimé :** ~1 jour

| Fichier | Endpoints couverts |
|---|---|
| `tests/e2e/auth.test.ts` | `POST /login` (400, 401, 200), `POST /register`, `POST /refresh` |
| `tests/e2e/alerts.test.ts` | `GET /types` (200 admin, 403 member), `POST /types` (201, 400) |
| `tests/e2e/payments.test.ts` | `GET /schedules` (200), `DELETE /schedules/:id` (guard paiement) |

---

## 6. Couverture cible

```
Couche                        Cible      Justification
─────────────────────────────────────────────────────────
Backend use-cases             ≥ 80 %     Logique métier — le plus critique
Backend services partagés     ≥ 90 %     Déjà bien couverts (JWT, Password)
Backend controllers (HTTP)    ≥ 60 %     Flux nominaux + guards de rôle
Frontend composants partagés  ≥ 70 %     Réutilisés partout — fort ROI
Frontend hooks                ≥ 60 %     Hooks critiques uniquement
Frontend composants features  ≥ 50 %     Badges + cards suffisent
─────────────────────────────────────────────────────────
GLOBAL PROJET                 ≥ 65 %     Seuil configuré dans jest.config
```

> Le seuil de 70 % global est déjà configuré dans `backend/jest.config.cjs`.
> Côté frontend, le coverage est configuré via `vitest --coverage` (provider `v8` déjà installé).

---

## 7. Conventions de nommage

### Fichiers

```
<NomDuFichierSource>.test.ts      # backend unitaire
<NomDuFichierSource>.test.tsx     # frontend composant
```

### Structure interne

```typescript
describe('<NomDeLaClasse>', () => {
  describe('<nomDeLaMethode>', () => {
    it('devrait <résultat attendu> quand <condition>', () => { ... });
    it('devrait lancer une erreur si <condition>', () => { ... });
  });
});
```

### Nommage des `it()`

| Pattern | Exemple |
|---|---|
| `devrait <action> quand <condition>` | `devrait retourner le type créé quand les données sont valides` |
| `devrait lancer une erreur si <condition>` | `devrait lancer une erreur si le code est déjà utilisé` |
| `devrait retourner null si <condition>` | `devrait retourner null si l'alerte est introuvable` |

---

## 8. Statut des sprints

| Sprint | Scope | Statut |
|---|---|---|
| **Tests 1** | Use-cases backend (alerts, notifications, families, auth) | ⏳ À faire |
| **Tests 2** | Infrastructure frontend + composants + hooks | ⏳ À faire |
| **Tests 3** | Intégration HTTP (supertest) | ⏳ Optionnel |

---

*TEST_PLAN.md — ClubManager V3 — Last updated: Sprint Tests 0 (plan rédigé)*
