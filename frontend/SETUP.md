# Setup Frontend - ClubManager V3

## ✅ État Actuel

Le frontend a été initialisé avec la configuration de base. Tous les fichiers de configuration sont en place et la structure des dossiers est prête pour le développement.

## 📦 Ce qui a été configuré

### 1. Configuration du Projet
- ✅ **package.json** - Dépendances installées :
  - React 18 + React Router 6
  - PatternFly 5 (Design System)
  - TanStack React Query 5 (Server state)
  - Zustand 4 (Client state)
  - React Hook Form + Zod (Formulaires & validation)
  - Axios (HTTP client)
  - Vitest + Testing Library (Tests)
  - TypeScript 5.4

- ✅ **tsconfig.json** - Configuration TypeScript avec :
  - Mode strict activé
  - Alias de chemins (`@/`, `@/features`, `@/shared`, `@/types`)
  - Support React JSX

- ✅ **vite.config.ts** - Configuration Vite avec :
  - Plugin React SWC (Fast Refresh)
  - Alias de chemins configurés
  - Proxy API vers `http://localhost:3001`
  - Configuration de test (Vitest)
  - Code splitting optimisé

- ✅ **.env** + **.env.example** - Variables d'environnement

- ✅ **.gitignore** - Fichiers à ignorer

### 2. Structure des Dossiers

```
frontend/
├── public/                          # Assets statiques (vide)
├── src/
│   ├── features/                   # Modules fonctionnels
│   │   ├── auth/                  # ⏳ Module Auth (dossiers créés, vides)
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   └── __tests__/
│   │   ├── users/                 # 📁 Dossiers vides (futurs modules)
│   │   ├── courses/
│   │   ├── payments/
│   │   ├── store/
│   │   ├── messaging/
│   │   └── statistics/
│   │
│   ├── shared/                     # Code partagé
│   │   ├── api/                   # 📁 Vide - à créer : client.ts
│   │   ├── components/            # 📁 Vide
│   │   ├── hooks/                 # 📁 Vide
│   │   ├── stores/                # 📁 Vide
│   │   ├── utils/                 # 📁 Vide
│   │   └── lib/                   # 📁 Vide
│   │
│   ├── layouts/                    # 📁 Vide - PublicLayout, PrivateLayout
│   │
│   ├── App.tsx                     # ✅ Composant minimal (EmptyState)
│   └── main.tsx                    # ✅ Point d'entrée avec providers
│
├── .env                            # ✅ Config locale
├── .gitignore                      # ✅
├── index.html                      # ✅ HTML de base
├── package.json                    # ✅
├── tsconfig.json                   # ✅
├── vite.config.ts                  # ✅
├── ARCHITECTURE.md                 # ✅ Documentation architecture
└── SETUP.md                        # 📄 Ce fichier
```

### 3. Fichiers Créés

#### ✅ index.html
- HTML de base avec balise `<div id="root">`
- Meta tags configurés

#### ✅ main.tsx
- Setup React Query avec QueryClientProvider
- Setup React Router avec BrowserRouter
- Import CSS PatternFly
- React Query DevTools configuré

#### ✅ App.tsx
- Composant minimal avec PatternFly EmptyState
- Prêt pour ajouter le routing

## 🚀 Prochaines Étapes

### Phase 1 : Module Auth (En cours)

1. **Client API** (`shared/api/client.ts`)
   - Client Axios
   - Interceptors pour tokens
   - Gestion refresh token automatique
   - Gestion des erreurs

2. **Store Auth** (`features/auth/stores/authStore.ts`)
   - Store Zustand pour l'état auth
   - Actions : login, logout, setUser, updateUser
   - Persistance localStorage

3. **Hooks Auth** (`features/auth/hooks/useAuth.ts`)
   - Hook custom avec React Query mutations
   - useLogin, useRegister, useLogout, useCurrentUser
   - Hook usePermissions pour les rôles

4. **Layouts** (`layouts/`)
   - PublicLayout (pour login/register)
   - PrivateLayout (avec navigation PatternFly)

5. **Pages Auth** (`features/auth/pages/`)
   - LoginPage (formulaire avec validation Zod)
   - RegisterPage (formulaire avec validation Zod)
   - ForgotPasswordPage (optionnel)

6. **Routing** (mise à jour `App.tsx`)
   - Routes publiques (login, register)
   - Routes privées (protected)
   - Redirections

7. **Tests Auth** (`features/auth/__tests__/`)
   - Tests unitaires stores
   - Tests hooks
   - Tests composants

### Phase 2 : Autres Modules (Plus tard)

Suivre l'approche "Vertical Slice" :
- Users → Payments → Courses → Store → Messaging → Statistics

## 🔧 Installation & Lancement

### Installation des dépendances
```bash
cd clubManager-V3/frontend
npm install
```

### Lancer le serveur de développement
```bash
npm run dev
```
→ Ouvre http://localhost:3000

### Autres commandes
```bash
npm run build         # Build production
npm run preview       # Preview du build
npm test              # Tests
npm run type-check    # Vérification TypeScript
```

## 📝 Notes Importantes

### Types Partagés
Les types sont dans `packages/types` et importés via :
```typescript
import type { UserResponseDto, LoginDto } from '@clubmanager/types';
```

### Alias de Chemins
```typescript
import { Component } from '@/shared/components/Component';
import { useAuth } from '@/features/auth/hooks/useAuth';
```

### PatternFly
Tous les composants UI doivent utiliser PatternFly pour cohérence.
Doc : https://www.patternfly.org/

## 📚 Documentation

- `ARCHITECTURE.md` - Architecture détaillée, principes, conventions
- `package.json` - Scripts disponibles
- Backend API : `http://localhost:3001/api`

---

**Status** : 🟡 Setup initial terminé - Prêt pour développement module Auth  
**Dernière mise à jour** : Setup configuration de base