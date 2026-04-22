# Architecture Frontend - ClubManager V3

## 🎯 Vue d'ensemble

Application frontend React avec TypeScript utilisant une architecture modulaire par fonctionnalités (feature-based architecture).

## 🛠️ Stack Technique

### Core
- **React 18** - Bibliothèque UI
- **TypeScript 5.4** - Typage statique
- **Vite 5** - Build tool & dev server (HMR rapide)

### State Management & Data Fetching
- **Zustand 4** - State management global (léger, simple)
- **React Query (TanStack Query) 5** - Server state, cache, mutations
- **React Hook Form 7** - Gestion des formulaires
- **Zod 3** - Validation de schémas (partagé avec backend via `@clubmanager/types`)

### UI & Styling
- **PatternFly 5** - Design system Red Hat (composants enterprise)
  - `@patternfly/react-core` - Composants de base
  - `@patternfly/react-table` - Tables de données
  - `@patternfly/react-icons` - Icônes
  - `@patternfly/react-charts` - Graphiques
  - `@patternfly/react-code-editor` - Éditeur de code

### Routing & HTTP
- **React Router 6** - Navigation client-side
- **Axios 1.6** - Client HTTP avec interceptors

### Testing
- **Vitest** - Test runner (compatible Vite)
- **React Testing Library** - Tests de composants
- **MSW (Mock Service Worker)** - Mock des APIs

### Utilities
- **date-fns** - Manipulation de dates
- **sonner** - Toast notifications

## 📁 Structure des Dossiers

```
frontend/
├── public/                     # Assets statiques
├── src/
│   ├── features/              # Modules fonctionnels (feature-based)
│   │   ├── auth/             # Module authentification
│   │   │   ├── api/         # Appels API du module
│   │   │   ├── components/  # Composants du module
│   │   │   ├── hooks/       # Hooks custom du module
│   │   │   ├── pages/       # Pages du module
│   │   │   ├── stores/      # Stores Zustand du module
│   │   │   ├── utils/       # Utilitaires du module
│   │   │   └── __tests__/   # Tests du module
│   │   ├── users/           # Module utilisateurs
│   │   ├── courses/         # Module cours
│   │   ├── payments/        # Module paiements
│   │   ├── store/           # Module boutique
│   │   ├── messaging/       # Module messagerie
│   │   └── statistics/      # Module statistiques
│   │
│   ├── shared/               # Code partagé entre modules
│   │   ├── api/             # Client HTTP, interceptors
│   │   ├── components/      # Composants réutilisables
│   │   ├── hooks/           # Hooks custom partagés
│   │   ├── stores/          # Stores Zustand partagés
│   │   ├── utils/           # Fonctions utilitaires
│   │   └── lib/             # Configuration de librairies
│   │
│   ├── layouts/              # Layouts d'application
│   │   ├── PublicLayout.tsx  # Layout pages publiques (auth)
│   │   └── PrivateLayout.tsx # Layout pages privées (dashboard)
│   │
│   ├── App.tsx               # Composant racine avec routing
│   └── main.tsx              # Point d'entrée
│
├── .env                       # Variables d'environnement (local)
├── .env.example               # Template variables d'environnement
├── index.html                 # HTML de base
├── package.json               # Dépendances & scripts
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration Vite
└── ARCHITECTURE.md            # Ce fichier
```

## 🏗️ Principes Architecturaux

### 1. Feature-Based Architecture
Chaque module fonctionnel (`features/`) est **autonome** et contient :
- Ses propres composants
- Ses propres hooks
- Ses propres stores (si nécessaire)
- Ses propres appels API
- Ses propres tests

**Avantages** :
- Isolation du code par domaine métier
- Facilite la navigation dans le code
- Scalabilité (ajout de nouveaux modules)
- Suppression facile d'un module

### 2. Colocation des Tests
Les tests sont **colocalisés** avec le code qu'ils testent (`__tests__/`).

### 3. Séparation Server State / Client State

#### Server State (React Query)
- Données provenant du backend (utilisateurs, cours, paiements)
- Cache automatique
- Revalidation
- Mutations optimistes

#### Client State (Zustand)
- État UI (sidebar ouverte/fermée, modales)
- État d'authentification (user connecté, tokens)
- Préférences utilisateur

### 4. Types Partagés
Les types sont définis dans `packages/types` et partagés entre backend et frontend via :
```typescript
import type { UserResponseDto, LoginDto } from '@clubmanager/types';
```

## 🔐 Gestion de l'Authentification

### Flux d'authentification
1. **Login** → Backend retourne `accessToken` (JWT) + `refreshToken` (httpOnly cookie)
2. **AccessToken** stocké en localStorage + Zustand
3. **Axios interceptor** ajoute le token à chaque requête (`Authorization: Bearer <token>`)
4. **Si 401** → Tenter refresh token automatiquement
5. **Si refresh échoue** → Rediriger vers `/login`

### Fichiers clés
- `shared/api/client.ts` - Client Axios avec interceptors
- `features/auth/stores/authStore.ts` - Store Zustand pour l'auth
- `features/auth/hooks/useAuth.ts` - Hook custom pour login/logout/register

## 🚀 Scripts NPM

```bash
npm run dev          # Lancer le dev server (port 3000)
npm run build        # Build production
npm run preview      # Preview du build de production
npm test             # Lancer les tests (Vitest)
npm run test:ui      # Interface UI des tests
npm run test:coverage # Coverage des tests
npm run lint         # Linter ESLint
npm run lint:fix     # Fix automatique des erreurs
npm run format       # Formatter avec Prettier
npm run type-check   # Vérification TypeScript
```

## 📦 Alias de Chemins

Configuration dans `tsconfig.json` et `vite.config.ts` :

```typescript
import { Component } from '@/shared/components/Component';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { UserDto } from '@/types'; // pointe vers packages/types
```

## 🧪 Stratégie de Tests

### Tests Unitaires
- Hooks custom
- Fonctions utilitaires
- Stores Zustand

### Tests de Composants
- Composants partagés (`shared/components`)
- Pages principales

### Tests d'Intégration
- Flux complets (login → dashboard)
- Formulaires avec validation

### Tests E2E (optionnel, plus tard)
- Playwright ou Cypress

## 🌐 Environnement

Variables d'environnement (`.env`) :

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
VITE_APP_NAME=ClubManager V3
VITE_APP_VERSION=3.0.0
VITE_ENABLE_DEVTOOLS=true
```

## 📚 Conventions de Code

### Nommage
- **Composants** : PascalCase (`UserCard.tsx`)
- **Hooks** : camelCase avec préfixe `use` (`useAuth.ts`)
- **Stores** : camelCase avec suffixe `Store` (`authStore.ts`)
- **Types** : PascalCase (`UserResponseDto`)
- **Fichiers utils** : camelCase (`formatDate.ts`)

### Organisation des Imports
```typescript
// 1. React & librairies externes
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Librairies UI
import { Button, Form } from '@patternfly/react-core';

// 3. Types
import type { UserDto } from '@clubmanager/types';

// 4. Imports internes (alias @/)
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/shared/api/client';

// 5. Imports relatifs
import { UserCard } from './UserCard';
```

### Composants
```typescript
// Privilégier les function components
// Props typées avec interface
interface UserCardProps {
  user: UserResponseDto;
  onEdit?: (id: number) => void;
}

const UserCard = ({ user, onEdit }: UserCardProps) => {
  // ...
};

export default UserCard;
```

## 🔄 Workflow de Développement

### Approche "Vertical Slice"
Développer chaque module de manière **verticale** (backend + frontend + tests) plutôt qu'horizontale.

**Ordre de développement** :
1. ✅ **Auth** (login, register, logout, refresh token)
2. **Users** (liste, détail, création, modification)
3. **Payments** (gestion des paiements)
4. **Courses** (gestion des cours)
5. **Store** (boutique)
6. **Messaging** (messagerie)
7. **Statistics** (tableaux de bord)

### Ajout d'un Nouveau Module

1. Créer la structure dans `features/nom-module/` :
```bash
mkdir -p src/features/mon-module/{api,components,hooks,pages,stores,utils,__tests__}
```

2. Créer les fichiers API (`api/monModuleApi.ts`)
3. Créer les hooks React Query (`hooks/useMonModule.ts`)
4. Créer les pages (`pages/MonModulePage.tsx`)
5. Ajouter les routes dans `App.tsx`
6. Écrire les tests

## 🎨 PatternFly Guidelines

- Utiliser les composants PatternFly pour cohérence UI
- Respecter les patterns UX de PatternFly (navigation, formulaires, tables)
- Consulter la doc : https://www.patternfly.org/

### Composants PatternFly clés
- `Page`, `PageSection` - Layout de page
- `Card`, `CardBody` - Cartes
- `Table`, `Thead`, `Tbody`, `Tr`, `Td` - Tables
- `Form`, `FormGroup`, `TextInput` - Formulaires
- `Button`, `Dropdown`, `Modal` - Actions
- `Alert`, `EmptyState`, `Spinner` - États

## 🔗 Ressources

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Router](https://reactrouter.com/)
- [PatternFly](https://www.patternfly.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

**Version** : 3.0.0  
**Dernière mise à jour** : Setup initial - Module Auth en cours