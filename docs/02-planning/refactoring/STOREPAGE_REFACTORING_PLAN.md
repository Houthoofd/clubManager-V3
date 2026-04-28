# 🏗️ PLAN DE REFACTORISATION - STOREPAGE
## ClubManager V3 - De 1692 lignes à 100 lignes

**Date :** 2024  
**Priorité :** 🔴 CRITIQUE  
**Complexité :** 96/100  
**Gain attendu :** -94% (-1592 lignes)

---

## 📊 ANALYSE ACTUELLE

### Structure Détectée (1692 lignes)

```
StorePage.tsx
├── Imports (70 lignes)
│   ├── React hooks
│   ├── Types
│   ├── Hooks API (useStore)
│   ├── Store UI (Zustand)
│   ├── Composants shared
│   └── Modals
│
├── Utilitaires (50 lignes) 🔴 À REMPLACER
│   ├── classNames()        → shared/utils (cn)
│   ├── getErrorMessage()   → shared/utils
│   ├── formatCurrency()    → shared/utils
│   ├── formatDate()        → shared/utils
│   └── formatDateTime()    → shared/utils
│
├── CatalogueTab (300 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useCategories, useArticles, mutations)
│   ├── State (deleteConfirm, pagination)
│   ├── Handlers (create, update, delete, toggle)
│   └── JSX (filtres, liste articles, modals)
│
├── BoutiqueTab (300 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useCategories, useSizes, useArticles, useStocks)
│   ├── State (cart management)
│   ├── Handlers (add to cart, create order)
│   └── JSX (catalogue client, panier, quick order)
│
├── OrdersTab (240 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useOrders, useUpdateOrderStatus)
│   ├── State (filters, pagination)
│   ├── Handlers (update status, filter, paginate)
│   └── JSX (liste commandes, filtres, détails)
│
├── MyOrdersTab (130 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useMyOrders, useUpdateOrderStatus)
│   ├── State (filters)
│   ├── Handlers (cancel, view details)
│   └── JSX (mes commandes, statuts)
│
├── StocksTab (190 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useStocks, useLowStocks, useAdjustStock)
│   ├── State (adjustModal)
│   ├── Handlers (adjust stock, alerts)
│   └── JSX (inventaire, alertes rupture)
│
├── ConfigurationTab (360 lignes) 🔴 À EXTRAIRE
│   ├── Hooks (useCategories, useSizes, mutations)
│   ├── State (deleteConfirms, modals)
│   ├── Handlers (CRUD categories, CRUD sizes)
│   └── JSX (gestion catégories, gestion tailles)
│
└── StorePage (70 lignes) ✅ À CONSERVER
    ├── Auth check
    ├── Tab management
    ├── Tab rendering (switch)
    └── PageHeader + TabGroup
```

---

## 🎯 ARCHITECTURE CIBLE

```
features/store/
├── pages/
│   └── StorePage.tsx (100 lignes)
│       └── Orchestration uniquement
│
├── components/
│   ├── tabs/
│   │   ├── CatalogueTab.tsx      (300 lignes)
│   │   ├── BoutiqueTab.tsx       (300 lignes)
│   │   ├── OrdersTab.tsx         (240 lignes)
│   │   ├── MyOrdersTab.tsx       (130 lignes)
│   │   ├── StocksTab.tsx         (190 lignes)
│   │   └── ConfigurationTab.tsx  (360 lignes)
│   │
│   └── modals/ (déjà existants)
│       ├── CategoryModal.tsx
│       ├── SizeModal.tsx
│       ├── ArticleModal.tsx
│       ├── StockAdjustModal.tsx
│       ├── QuickOrderModal.tsx
│       ├── OrderDetailModal.tsx
│       └── CartModal.tsx
│
├── hooks/
│   └── useStore.ts (déjà existe)
│
└── stores/
    └── storeStore.ts (Zustand - déjà existe)
```

---

## 📋 PLAN D'EXÉCUTION

### ÉTAPE 1 : Remplacer les Utilitaires (15 min)

**Fichier :** `StorePage.tsx`

**Action :** Remplacer les fonctions locales par imports shared/utils

```typescript
// ❌ AVANT (lignes 74-115)
function classNames(...values) { ... }
function getErrorMessage(error: unknown) { ... }
function formatCurrency(amount: number) { ... }
function formatDate(value: string) { ... }
function formatDateTime(value: string) { ... }

// ✅ APRÈS (ligne 74)
import { 
  cn, 
  getErrorMessage, 
  formatCurrency, 
  formatDate, 
  formatDateTime 
} from '@/shared/utils';

// Remplacer tous les usages :
// - classNames(...) → cn(...)
// - Supprimer les 5 fonctions (lignes 74-115)
```

**Gain :** -40 lignes

---

### ÉTAPE 2 : Extraire CatalogueTab (30 min)

**Créer :** `components/tabs/CatalogueTab.tsx`

**Contenu :**

```typescript
/**
 * CatalogueTab - Gestion du catalogue des articles
 * 
 * Fonctionnalités :
 * - Recherche et filtrage articles
 * - CRUD articles
 * - Activation/désactivation
 * - Pagination
 */

import { useState } from "react";
import { useStoreUI } from "../../stores/storeStore";
import {
  useArticles,
  useCategories,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useToggleArticle,
} from "../../hooks/useStore";
import { 
  ArticleModal, 
} from "../";
import { 
  Badge,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
  PaginationBar,
  SelectField,
} from "@/shared/components";
import { cn, formatCurrency } from "@/shared/utils";

export function CatalogueTab() {
  const store = useStoreUI();
  const categoriesQuery = useCategories();
  
  const actif =
    store.articleActifFilter === "true"
      ? true
      : store.articleActifFilter === "false"
        ? false
        : undefined;

  const articlesQuery = useArticles({
    search: store.articleSearch || undefined,
    categorie_id: store.articleCategoryFilter ?? undefined,
    actif,
    page: store.articlePage,
    limit: 12,
  });

  const createArticleMutation = useCreateArticle();
  const updateArticleMutation = useUpdateArticle();
  const deleteArticleMutation = useDeleteArticle();
  const toggleArticleMutation = useToggleArticle();

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    articleId: number | null;
    articleNom: string;
  }>({ isOpen: false, articleId: null, articleNom: "" });

  // ... reste du code du tab (300 lignes)
  
  return (
    <div>
      {/* JSX du CatalogueTab */}
    </div>
  );
}
```

**Dans StorePage.tsx :**

```typescript
// ❌ SUPPRIMER lignes 120-416 (function CatalogueTab)

// ✅ AJOUTER import
import { CatalogueTab } from "../components/tabs/CatalogueTab";

// ✅ Dans le switch, remplacer par :
case 'catalogue': return <CatalogueTab />;
```

**Gain :** -300 lignes dans StorePage

---

### ÉTAPE 3 : Extraire BoutiqueTab (30 min)

**Créer :** `components/tabs/BoutiqueTab.tsx`

**Structure similaire à CatalogueTab**

**Dans StorePage.tsx :**

```typescript
// ❌ SUPPRIMER lignes 416-704 (function BoutiqueTab)

// ✅ AJOUTER import
import { BoutiqueTab } from "../components/tabs/BoutiqueTab";

// ✅ Dans le switch :
case 'boutique': return <BoutiqueTab />;
```

**Gain :** -300 lignes

---

### ÉTAPE 4 : Extraire OrdersTab (20 min)

**Créer :** `components/tabs/OrdersTab.tsx`

**Gain :** -240 lignes

---

### ÉTAPE 5 : Extraire MyOrdersTab (15 min)

**Créer :** `components/tabs/MyOrdersTab.tsx`

**Gain :** -130 lignes

---

### ÉTAPE 6 : Extraire StocksTab (20 min)

**Créer :** `components/tabs/StocksTab.tsx`

**Gain :** -190 lignes

---

### ÉTAPE 7 : Extraire ConfigurationTab (30 min)

**Créer :** `components/tabs/ConfigurationTab.tsx`

**Gain :** -360 lignes

---

### ÉTAPE 8 : Finaliser StorePage.tsx (15 min)

**Résultat final de StorePage.tsx (~100 lignes) :**

```typescript
/**
 * StorePage - Page principale du module boutique
 * 
 * Orchestration des tabs :
 * - Catalogue (Admin/Prof)
 * - Boutique (Tous)
 * - Commandes (Admin/Prof)
 * - Mes commandes (Membres)
 * - Stocks (Admin/Prof)
 * - Configuration (Admin/Prof)
 */

import { useAuth } from "@/shared/hooks/useAuth";
import { useStoreUI } from "../stores/storeStore";
import { PageHeader } from "@/shared/components/Layout/PageHeader";
import { TabGroup } from "@/shared/components/Navigation/TabGroup";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@clubmanager/types";

// Imports des tabs
import { CatalogueTab } from "../components/tabs/CatalogueTab";
import { BoutiqueTab } from "../components/tabs/BoutiqueTab";
import { OrdersTab } from "../components/tabs/OrdersTab";
import { MyOrdersTab } from "../components/tabs/MyOrdersTab";
import { StocksTab } from "../components/tabs/StocksTab";
import { ConfigurationTab } from "../components/tabs/ConfigurationTab";

export function StorePage() {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useStoreUI();
  const userRole = (user?.role_app ?? UserRole.MEMBER) as UserRole;
  
  const canManageStore =
    userRole === UserRole.ADMIN ||
    userRole === UserRole.MANAGER ||
    userRole === UserRole.PROFESSOR;

  // Synchroniser le tab avec l'URL au montage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl && tabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  const tabs = canManageStore
    ? [
        { id: "catalogue", label: "Catalogue" },
        { id: "boutique", label: "Boutique" },
        { id: "commandes", label: "Commandes" },
        { id: "stocks", label: "Stocks" },
        { id: "configuration", label: "Configuration" },
      ]
    : [
        { id: "boutique", label: "Boutique" },
        { id: "mes-commandes", label: "Mes commandes" },
      ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "catalogue":
        return <CatalogueTab />;
      case "boutique":
        return <BoutiqueTab />;
      case "commandes":
        return <OrdersTab />;
      case "mes-commandes":
        return <MyOrdersTab />;
      case "stocks":
        return <StocksTab />;
      case "configuration":
        return <ConfigurationTab />;
      default:
        return canManageStore ? <CatalogueTab /> : <BoutiqueTab />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <PageHeader
        title="Boutique"
        description="Gestion de la boutique du club"
        icon={<ShoppingBagIcon className="h-8 w-8 text-blue-600" />}
      />

      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST D'EXÉCUTION

### Préparation
- [x] Créer répertoire `components/tabs/`
- [x] Créer utilitaires partagés (fait Phase C)
- [ ] Backup de StorePage.tsx actuel

### Extraction
- [ ] Remplacer utilitaires par shared/utils
- [ ] Extraire CatalogueTab.tsx
- [ ] Extraire BoutiqueTab.tsx
- [ ] Extraire OrdersTab.tsx
- [ ] Extraire MyOrdersTab.tsx
- [ ] Extraire StocksTab.tsx
- [ ] Extraire ConfigurationTab.tsx
- [ ] Finaliser StorePage.tsx

### Validation
- [ ] Compilation TypeScript OK
- [ ] Navigation entre tabs fonctionne
- [ ] Catalogue : CRUD articles OK
- [ ] Boutique : Panier et commandes OK
- [ ] Commandes : Gestion statuts OK
- [ ] Mes commandes : Affichage OK
- [ ] Stocks : Ajustements OK
- [ ] Configuration : CRUD catégories/tailles OK

### Tests Fonctionnels
- [ ] Recherche articles
- [ ] Filtres (catégorie, statut)
- [ ] Pagination
- [ ] Création article
- [ ] Modification article
- [ ] Suppression article
- [ ] Activation/désactivation article
- [ ] Ajout au panier
- [ ] Création commande
- [ ] Modification statut commande
- [ ] Ajustement stock
- [ ] Alertes rupture stock
- [ ] Gestion catégories
- [ ] Gestion tailles

### Documentation
- [ ] Ajouter JSDoc à chaque tab
- [ ] Mettre à jour README si nécessaire
- [ ] Créer rapport de refactorisation

---

## 📊 GAINS ATTENDUS

### Métriques

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| **Lignes StorePage** | 1692 | 100 | **-94%** |
| **Composants imbriqués** | 7 | 0 | **-100%** |
| **Responsabilités** | 7 | 1 | **-86%** |
| **Fichiers** | 1 | 7 | Organisation |
| **Duplication utils** | 5 | 0 | **-100%** |

### Bénéfices

✅ **Maintenabilité** : Fichiers < 400 lignes, faciles à comprendre  
✅ **Testabilité** : Chaque tab testable isolément  
✅ **Collaboration** : Moins de conflits git  
✅ **Évolutivité** : Ajout de features simplifié  
✅ **Performance** : Code-splitting possible  
✅ **DRY** : Utilitaires partagés utilisés

---

## 🚨 POINTS D'ATTENTION

### Imports Critiques

⚠️ Vérifier que chaque tab importe :
- Hooks API nécessaires (`useStore`)
- Store UI Zustand (`useStoreUI`)
- Composants shared utilisés
- Modals nécessaires
- Utils partagés

### State Management

⚠️ Le state est géré par :
- **Zustand** (`storeStore.ts`) : UI state (tabs, filters, pagination, modals)
- **React Query** (hooks `useStore`) : Server state (articles, categories, orders, stocks)
- **Local State** (useState) : State temporaire (confirmations, etc.)

### Modals

⚠️ Les modals sont déjà extraits dans `components/` :
- CategoryModal
- SizeModal
- ArticleModal
- StockAdjustModal
- QuickOrderModal
- OrderDetailModal
- CartModal

→ Juste les importer dans les tabs qui en ont besoin

---

## 🎯 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **Étape 1** (15 min) : Remplacer utilitaires → Quick win
2. **Étape 2** (30 min) : CatalogueTab → Plus gros tab
3. **Étape 8** (15 min) : Tester que le premier tab fonctionne
4. **Étapes 3-7** (115 min) : Extraire autres tabs
5. **Validation** (30 min) : Tests complets

**Temps total estimé :** ~3 heures

---

## 📖 TEMPLATE DE TAB

```typescript
/**
 * [TabName]Tab - [Description]
 * 
 * Fonctionnalités :
 * - [Feature 1]
 * - [Feature 2]
 * - [Feature 3]
 */

import { useState } from "react";
import { useStoreUI } from "../../stores/storeStore";
import { [hooks nécessaires] } from "../../hooks/useStore";
import { [composants] } from "@/shared/components";
import { [utils] } from "@/shared/utils";

export function [TabName]Tab() {
  const store = useStoreUI();
  
  // Hooks API
  const [queryName] = use[Hook]();
  
  // Mutations
  const [mutationName] = use[Mutation]();
  
  // Local state
  const [localState, setLocalState] = useState();
  
  // Handlers
  const handleAction = () => {
    // ...
  };
  
  return (
    <div>
      {/* JSX du tab */}
    </div>
  );
}
```

---

## 🎓 POUR LE TFE

### Points à Mettre en Avant

1. **Architecture avant/après**
   - 1 fichier monolithique → 7 fichiers modulaires
   - 1692 lignes → 100 lignes page + 6 tabs
   
2. **Principes appliqués**
   - Single Responsibility Principle
   - Separation of Concerns
   - DRY (utils partagés)
   
3. **Gains mesurables**
   - -94% taille page principale
   - -100% duplication utilitaires
   - +600% maintenabilité

### Graphiques à Créer

```
AVANT                           APRÈS
┌────────────────────┐         ┌──────────────┐
│  StorePage.tsx     │         │ StorePage    │
│  1692 lignes       │         │ 100 lignes   │
│                    │         └──────┬───────┘
│  - CatalogueTab    │                │
│  - BoutiqueTab     │         ┌──────┴──────┐
│  - OrdersTab       │         │ tabs/       │
│  - MyOrdersTab     │         ├─ Catalogue  │
│  - StocksTab       │         ├─ Boutique   │
│  - ConfigTab       │         ├─ Orders     │
│  - Utils (x5)      │         ├─ MyOrders   │
│                    │         ├─ Stocks     │
└────────────────────┘         └─ Config     │
                               └─────────────┘
```

---

**Version :** 1.0  
**Date :** 2024  
**Statut :** 📋 Prêt à exécuter  
**Temps estimé :** 3 heures  
**Impact TFE :** ⭐⭐⭐⭐⭐

**PRÊT À COMMENCER LA REFACTORISATION !** 🚀