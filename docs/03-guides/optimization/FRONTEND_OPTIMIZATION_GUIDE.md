# 🚀 Guide d'Optimisation Front-End - ClubManager V3

> **Version:** 1.0.0  
> **Dernière mise à jour:** 2024  
> **Stack:** React 18 + Vite 5 + TypeScript + TailwindCSS + React Query

---

## 📊 Executive Summary

Ce guide fournit un plan d'action structuré pour optimiser les performances front-end de ClubManager V3. Les optimisations sont classées par impact et effort, avec des métriques cibles pour chaque amélioration.

### 🎯 Objectifs de Performance

| Métrique | Actuel (estimé) | Target | Impact |
|----------|----------------|--------|---------|
| **Bundle Size** | ~800 KB | <500 KB | 🔴 Critique |
| **FCP** (First Contentful Paint) | ~1.8s | <1.2s | 🟡 Important |
| **LCP** (Largest Contentful Paint) | ~2.5s | <2.0s | 🟡 Important |
| **TTI** (Time to Interactive) | ~3.5s | <2.5s | 🔴 Critique |
| **CLS** (Cumulative Layout Shift) | <0.1 | <0.1 | 🟢 Bon |

---

## 1️⃣ Bundle Size Optimization

### 🔍 Analyse Actuelle

**Dependencies Lourdes Identifiées:**
```json
{
  "@patternfly/react-charts": "^7.2.0",        // ~450 KB (Victory Charts)
  "@patternfly/react-code-editor": "^5.2.3",   // ~200 KB (Monaco Editor)
  "@patternfly/react-core": "^5.2.3",          // ~350 KB
  "@patternfly/react-icons": "^5.2.1",         // ~180 KB (tous les icons)
  "@patternfly/react-table": "^5.2.3",         // ~120 KB
  "@stripe/react-stripe-js": "^6.1.0",         // ~80 KB
  "@heroicons/react": "^2.2.0"                 // ~50 KB
}
```

**Impact Total Estimé:** ~1.4 MB de PatternFly (avant gzip)

---

### ✅ Action Plan - Bundle Size

#### **Priority 1: Lazy Loading des Routes** ⚡ QUICK WIN

**Impact:** -200 KB initial bundle | **Effort:** 1-2h

Actuellement, toutes les pages sont importées statiquement dans `App.tsx`:

```typescript
// ❌ AVANT - App.tsx (imports statiques)
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { FamilyPage } from "./features/families/pages";
import { UsersPage } from "./features/users/pages";
import { MessagesPage } from "./features/messaging/pages";
import { SettingsPage } from "./features/settings/pages";
import { PaymentsPage } from "./features/payments/pages";
import { CoursesPage } from "./features/courses/pages";
import { StorePage } from "./features/store/pages";
import { StatisticsRouter } from "./features/statistics/StatisticsRouter";
```

**Solution:**

```typescript
// ✅ APRÈS - App.tsx (lazy loading)
import { lazy, Suspense } from "react";

// Layouts (garder en eager, utilisés partout)
import { PublicLayout } from "./layouts/PublicLayout";
import { PrivateLayout } from "./layouts/PrivateLayout";

// Composants de Loading
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

// Lazy load des pages par feature
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const EmailVerificationPage = lazy(() => import("./features/auth/pages/EmailVerificationPage"));
const ForgotPasswordPage = lazy(() => import("./features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./features/auth/pages/ResetPasswordPage"));

const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));
const FamilyPage = lazy(() => import("./features/families/pages/FamilyPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const MessagesPage = lazy(() => import("./features/messaging/pages/MessagesPage"));
const SettingsPage = lazy(() => import("./features/settings/pages/SettingsPage"));
const PaymentsPage = lazy(() => import("./features/payments/pages/PaymentsPage"));
const CoursesPage = lazy(() => import("./features/courses/pages/CoursesPage"));
const StorePage = lazy(() => import("./features/store/pages/StorePage"));
const StatisticsRouter = lazy(() => import("./features/statistics/StatisticsRouter"));
const ProfilePage = lazy(() => import("./features/profile/pages/ProfilePage"));

// Dans le JSX - Wrapper Suspense
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <LoginPage />
                </Suspense>
              </PublicRoute>
            }
          />
          {/* ... autres routes publiques */}
        </Route>

        {/* Private Routes */}
        <Route element={<AuthenticatedLayout />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          {/* ... autres routes privées */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

**Alternative avec Helper Component:**

```typescript
// src/shared/components/LazyRoute.tsx
import { Suspense, ComponentType, ReactElement } from "react";

interface LazyRouteProps {
  component: ComponentType<any>;
  fallback?: ReactElement;
}

export const LazyRoute = ({ component: Component, fallback }: LazyRouteProps) => (
  <Suspense
    fallback={
      fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )
    }
  >
    <Component />
  </Suspense>
);

// Usage dans App.tsx
<Route path="/dashboard" element={<LazyRoute component={DashboardPage} />} />
```

---

#### **Priority 2: Remplacer PatternFly** 🎯 HIGH IMPACT

**Impact:** -1.2 MB | **Effort:** 1-2 jours

PatternFly est une bibliothèque enterprise lourde. Utilisée principalement pour des icônes.

**Analyse d'utilisation:**
```bash
# Recherche dans le code
- EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon, UserIcon, LockIcon
- InfoCircleIcon, PlusCircleIcon, PaperPlaneIcon, PficonTemplateIcon
- ChevronLeftIcon, ChevronRightIcon
- UsersIcon
```

**Solution 1: Migration vers Heroicons (déjà installé)** ✅

```typescript
// ❌ AVANT
import { EnvelopeIcon } from "@patternfly/react-icons";

// ✅ APRÈS
import { EnvelopeIcon } from "@heroicons/react/24/outline";
// ou
import { EnvelopeIcon } from "@heroicons/react/24/solid";
```

**Mapping des Icons:**

| PatternFly | Heroicons Équivalent |
|-----------|---------------------|
| `EnvelopeIcon` | `EnvelopeIcon` |
| `CheckCircleIcon` | `CheckCircleIcon` |
| `ExclamationTriangleIcon` | `ExclamationTriangleIcon` |
| `UserIcon` | `UserIcon` |
| `LockIcon` | `LockClosedIcon` |
| `InfoCircleIcon` | `InformationCircleIcon` |
| `PlusCircleIcon` | `PlusCircleIcon` |
| `ChevronLeftIcon` | `ChevronLeftIcon` |
| `ChevronRightIcon` | `ChevronRightIcon` |
| `UsersIcon` | `UsersIcon` |
| `PaperPlaneIcon` | `PaperAirplaneIcon` |

**Script de Migration:**

```bash
# Rechercher et remplacer dans tous les fichiers
find ./src -type f -name "*.tsx" -exec sed -i \
  's/@patternfly\/react-icons/@heroicons\/react\/24\/outline/g' {} +

# Ajustements manuels nécessaires pour certains noms
```

**Désinstallation:**
```bash
npm uninstall @patternfly/react-charts \
              @patternfly/react-code-editor \
              @patternfly/react-core \
              @patternfly/react-icons \
              @patternfly/react-table
```

**Alternative pour Charts:** Utiliser `recharts` (plus léger)

```bash
npm install recharts
# Bundle size: ~150 KB vs ~450 KB pour PatternFly Charts
```

---

#### **Priority 3: Code Splitting Avancé** 🔧

**Impact:** Meilleure distribution | **Effort:** 2-3h

Améliorer la configuration actuelle de `vite.config.ts`:

```typescript
// ❌ AVANT - vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});
```

```typescript
// ✅ APRÈS - vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes("node_modules")) {
            // React ecosystem
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            
            // Data management
            if (id.includes("@tanstack/react-query")) {
              return "query-vendor";
            }
            if (id.includes("zustand")) {
              return "state-vendor";
            }
            
            // Forms
            if (id.includes("react-hook-form") || 
                id.includes("@hookform") || 
                id.includes("zod")) {
              return "form-vendor";
            }
            
            // UI Libraries
            if (id.includes("@heroicons")) {
              return "icons-vendor";
            }
            if (id.includes("sonner")) {
              return "toast-vendor";
            }
            
            // Heavy libraries (lazy load these)
            if (id.includes("@stripe")) {
              return "stripe-vendor";
            }
            if (id.includes("axios")) {
              return "http-vendor";
            }
            if (id.includes("date-fns")) {
              return "utils-vendor";
            }
            
            // Default vendor chunk pour le reste
            return "vendor";
          }
          
          // Feature-based chunks
          if (id.includes("/features/statistics/")) {
            return "feature-statistics";
          }
          if (id.includes("/features/payments/")) {
            return "feature-payments";
          }
          if (id.includes("/features/messaging/")) {
            return "feature-messaging";
          }
          if (id.includes("/features/courses/")) {
            return "feature-courses";
          }
          if (id.includes("/features/users/")) {
            return "feature-users";
          }
          if (id.includes("/features/families/")) {
            return "feature-families";
          }
          if (id.includes("/features/settings/")) {
            return "feature-settings";
          }
          if (id.includes("/features/store/")) {
            return "feature-store";
          }
        },
      },
    },
    
    // Optimisations supplémentaires
    chunkSizeWarningLimit: 1000,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

---

#### **Priority 4: Tree Shaking Optimization** 🌳

**Impact:** -50-100 KB | **Effort:** 1-2h

**Problème:** Imports qui empêchent le tree-shaking

```typescript
// ❌ MAUVAIS - Import tout le package
import * as dateFns from "date-fns";

// ✅ BON - Import nommé spécifique
import { format, parseISO, isAfter } from "date-fns";
```

**Vérifier dans le code:**

```bash
# Rechercher les imports problématiques
grep -r "import \* as" src/
grep -r "import {.*} from 'lodash'" src/
```

**Optimisation date-fns:**

```typescript
// Créer un utilitaire centralisé
// src/shared/utils/dateUtils.ts
export { 
  format, 
  parseISO, 
  isAfter, 
  isBefore,
  addDays,
  subDays,
  startOfDay,
  endOfDay 
} from "date-fns";
export { fr } from "date-fns/locale";

// Usage
import { format, parseISO } from "@/shared/utils/dateUtils";
```

---

#### **Priority 5: Dynamic Imports pour Composants Lourds** 💡

**Impact:** Meilleure UX | **Effort:** 2-3h

Identifier et lazy-loader les composants lourds:

```typescript
// src/features/statistics/pages/StatisticsPage.tsx
import { lazy, Suspense } from "react";

// ❌ AVANT - Charts chargés immédiatement
import { LineChart } from "@/shared/components/Charts/LineChart";
import { BarChart } from "@/shared/components/Charts/BarChart";
import { PieChart } from "@/shared/components/Charts/PieChart";

// ✅ APRÈS - Lazy load des charts
const LineChart = lazy(() => import("@/shared/components/Charts/LineChart"));
const BarChart = lazy(() => import("@/shared/components/Charts/BarChart"));
const PieChart = lazy(() => import("@/shared/components/Charts/PieChart"));

export const StatisticsPage = () => {
  return (
    <div>
      <h1>Statistiques</h1>
      
      <Suspense fallback={<ChartSkeleton />}>
        <LineChart data={data} />
      </Suspense>
      
      <Suspense fallback={<ChartSkeleton />}>
        <BarChart data={data} />
      </Suspense>
    </div>
  );
};

// Skeleton pour meilleure UX
const ChartSkeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full" />
);
```

**Autres candidats pour lazy loading:**
- Éditeur de code (Monaco Editor si utilisé)
- Composants Stripe
- Tables complexes avec beaucoup de données
- Modales complexes

---

### 📊 Métriques Attendues - Bundle Size

| Optimisation | Bundle Avant | Bundle Après | Gain |
|--------------|--------------|--------------|------|
| Lazy Routes | 800 KB | 600 KB | -25% |
| Remove PatternFly | 600 KB | 350 KB | -42% |
| Code Splitting++ | 350 KB | 320 KB | -9% |
| Tree Shaking | 320 KB | 280 KB | -12.5% |
| **TOTAL** | **800 KB** | **280 KB** | **-65%** |

---

## 2️⃣ Performance Runtime

### ✅ Action Plan - Runtime Performance

#### **Priority 1: React Query Configuration Optimale** ⚡

**Impact:** -40% requêtes réseau | **Effort:** 1h

```typescript
// src/shared/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale Time: données considérées fraîches pendant 5min
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache Time: données gardées en cache 30min après inutilisation
      gcTime: 30 * 60 * 1000, // 30 minutes (anciennement cacheTime)
      
      // Retry logic optimisé
      retry: (failureCount, error: any) => {
        // Ne pas retry sur 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      
      // Refetch optimization
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: false, // Utilise le cache si disponible
      
      // Network mode
      networkMode: "online",
    },
    
    mutations: {
      // Retry mutations critiques
      retry: 1,
      networkMode: "online",
    },
  },
});
```

**Configuration par Feature:**

```typescript
// src/features/courses/hooks/useCourses.ts

// ✅ BON - Configuration spécifique par query
const planningQuery = useQuery({
  queryKey: courseKeys.planning(),
  queryFn: coursesApi.getCourseRecurrents,
  staleTime: 1 * 60 * 1000,        // 1 min (données changeantes)
  refetchInterval: 60 * 1000,      // Auto-refresh toutes les 60s
  refetchOnWindowFocus: true,
});

const professorsQuery = useQuery({
  queryKey: courseKeys.professors(),
  queryFn: coursesApi.getProfessors,
  staleTime: 10 * 60 * 1000,       // 10 min (données stables)
  refetchOnWindowFocus: false,
});

const attendanceQuery = useQuery({
  queryKey: courseKeys.attendance(courseId),
  queryFn: () => coursesApi.getCourseInscriptions(courseId),
  enabled: !!courseId && isModalOpen,
  staleTime: 0,                     // Toujours frais
  gcTime: 0,                        // Pas de cache résiduel
});
```

---

#### **Priority 2: React.memo, useMemo, useCallback** 🧠

**Impact:** -30% re-renders | **Effort:** 3-4h

**Identifier les composants à mémoïser:**

```typescript
// src/features/messaging/components/MessageListItem.tsx

// ❌ AVANT - Re-render à chaque changement du parent
export const MessageListItem = ({ message, onClick }: Props) => {
  return (
    <div onClick={() => onClick(message.id)}>
      <h3>{message.subject}</h3>
      <p>{message.preview}</p>
    </div>
  );
};

// ✅ APRÈS - Mémoïsé avec comparaison shallow
import { memo } from "react";

export const MessageListItem = memo(({ message, onClick }: Props) => {
  return (
    <div onClick={() => onClick(message.id)}>
      <h3>{message.subject}</h3>
      <p>{message.preview}</p>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison si nécessaire
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.isRead === nextProps.message.isRead;
});
```

**useMemo pour calculs coûteux:**

```typescript
// src/features/statistics/pages/StatisticsPage.tsx

export const StatisticsPage = () => {
  const { data: analytics } = useDashboardAnalytics();
  
  // ❌ AVANT - Recalculé à chaque render
  const chartData = analytics?.data.map(item => ({
    x: new Date(item.date).getTime(),
    y: item.value,
    label: formatCurrency(item.value)
  }));
  
  // ✅ APRÈS - Calculé uniquement si analytics change
  const chartData = useMemo(() => {
    if (!analytics?.data) return [];
    
    return analytics.data.map(item => ({
      x: new Date(item.date).getTime(),
      y: item.value,
      label: formatCurrency(item.value)
    }));
  }, [analytics?.data]);
  
  return <LineChart data={chartData} />;
};
```

**useCallback pour handlers:**

```typescript
// src/features/courses/pages/CoursesPage.tsx

export const CoursesPage = () => {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const { deleteCourseRecurrentMutation } = useCourses();
  
  // ❌ AVANT - Nouvelle fonction à chaque render
  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce cours ?")) {
      deleteCourseRecurrentMutation.mutate(id);
    }
  };
  
  // ✅ APRÈS - Fonction stable
  const handleDelete = useCallback((id: number) => {
    if (confirm("Supprimer ce cours ?")) {
      deleteCourseRecurrentMutation.mutate(id);
    }
  }, [deleteCourseRecurrentMutation]);
  
  return (
    <div>
      {courses.map(course => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onDelete={handleDelete}  // Référence stable
        />
      ))}
    </div>
  );
};
```

**Règle de décision:**

```typescript
// 🟢 À mémoïser:
// - Listes avec >20 items
// - Composants qui re-render souvent
// - Calculs coûteux (parsing, transformations)
// - Callbacks passés à des composants mémoïsés

// 🔴 PAS besoin de mémoïser:
// - Composants simples (< 5 éléments JSX)
// - Valeurs primitives
// - État local simple
```

---

#### **Priority 3: Virtual Scrolling pour Grandes Listes** 📜

**Impact:** 60fps avec 1000+ items | **Effort:** 4-5h

Installer `react-virtual`:

```bash
npm install @tanstack/react-virtual
```

**Exemple - Liste de Messages:**

```typescript
// src/features/messaging/components/MessageList.tsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

// ❌ AVANT - Render tous les messages
export const MessageList = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="space-y-2">
      {messages.map(message => (
        <MessageListItem key={message.id} message={message} />
      ))}
    </div>
  );
};

// ✅ APRÈS - Virtual scrolling
export const MessageList = ({ messages }: { messages: Message[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Hauteur estimée d'un item (px)
    overscan: 5, // Nombre d'items à pré-render hors viewport
  });
  
  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MessageListItem message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Autres candidats:**
- Liste des utilisateurs (`/users`)
- Liste des cours (`/courses`)
- Liste des paiements (`/payments`)
- Historique des transactions

---

#### **Priority 4: Debouncing & Throttling** ⏱️

**Impact:** -70% appels API inutiles | **Effort:** 2h

```typescript
// src/shared/hooks/useDebounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// src/shared/hooks/useThrottle.ts
import { useRef, useEffect, useCallback } from "react";

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastRan = useRef<number>(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRan.current = Date.now();
        }, delay - (Date.now() - lastRan.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
```

**Usage - Search Input:**

```typescript
// src/features/users/components/UserSearch.tsx
import { useDebounce } from "@/shared/hooks/useDebounce";

export const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  
  // Query déclenché uniquement après 500ms d'inactivité
  const { data: users } = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => usersApi.searchUsers(debouncedSearch),
    enabled: debouncedSearch.length >= 3,
  });
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Rechercher un utilisateur..."
    />
  );
};
```

**Usage - Scroll Event:**

```typescript
// src/shared/components/ScrollToTop.tsx
import { useThrottle } from "@/shared/hooks/useThrottle";

export const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const handleScroll = useThrottle(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
    setScrollProgress(progress);
  }, 100); // Max 10 fois par seconde
  
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  
  return (
    <div 
      className="fixed top-0 left-0 h-1 bg-blue-600 z-50"
      style={{ width: `${scrollProgress}%` }}
    />
  );
};
```

---

#### **Priority 5: Optimistic UI Updates** 🚀

**Impact:** UX instantanée | **Effort:** 2-3h

```typescript
// src/features/courses/hooks/useCourses.ts

const bulkUpdatePresenceMutation = useMutation({
  mutationFn: ({ cours_id, updates }: { cours_id: number; updates: AttendanceUpdate[] }) =>
    coursesApi.updatePresence(cours_id, updates),
  
  // ✅ Optimistic update
  onMutate: async ({ cours_id, updates }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ 
      queryKey: courseKeys.attendance(cours_id) 
    });
    
    // Snapshot de l'état actuel
    const previousAttendance = queryClient.getQueryData(
      courseKeys.attendance(cours_id)
    );
    
    // Mise à jour optimiste
    queryClient.setQueryData(
      courseKeys.attendance(cours_id),
      (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          inscriptions: old.inscriptions.map((inscription: any) => {
            const update = updates.find(u => u.user_id === inscription.user_id);
            if (update) {
              return { ...inscription, status: update.status };
            }
            return inscription;
          }),
        };
      }
    );
    
    // Retourner le contexte pour rollback
    return { previousAttendance };
  },
  
  // Rollback en cas d'erreur
  onError: (err, variables, context) => {
    if (context?.previousAttendance) {
      queryClient.setQueryData(
        courseKeys.attendance(variables.cours_id),
        context.previousAttendance
      );
    }
    toast.error("Erreur lors de la mise à jour des présences");
  },
  
  // Refetch après succès pour garantir la cohérence
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ 
      queryKey: courseKeys.attendance(variables.cours_id) 
    });
    toast.success("Présences mises à jour");
  },
});
```

---

#### **Priority 6: Request Caching & Deduplication** 🗄️

React Query gère déjà ceci, mais optimisons davantage:

```typescript
// src/shared/api/apiClient.ts

// ✅ Axios Request Deduplication
import { AxiosInstance, AxiosRequestConfig } from "axios";

const pendingRequests = new Map<string, Promise<any>>();

// Générer une clé unique pour chaque requête
const getRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
};

// Intercepteur pour deduplication
apiClient.interceptors.request.use(
  async (config) => {
    const requestKey = getRequestKey(config);
    
    // Si requête identique en cours, retourner la promesse existante
    if (pendingRequests.has(requestKey)) {
      const pendingRequest = pendingRequests.get(requestKey)!;
      return pendingRequest.then(() => config);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    const requestKey = getRequestKey(error.config);
    pendingRequests.delete(requestKey);
    return Promise.reject(error);
  }
);
```

---

### 📊 Métriques Attendues - Runtime

| Optimisation | Avant | Après | Amélioration |
|--------------|-------|-------|--------------|
| Re-renders inutiles | 100% | 30% | -70% |
| Requêtes API dupliquées | 40% | 5% | -87.5% |
| Scroll Performance (FPS) | 30 FPS | 60 FPS | +100% |
| Input Latency | 200ms | 50ms | -75% |

---

## 3️⃣ Images & Assets

### ✅ Action Plan - Assets

#### **Priority 1: Lazy Loading Images** 🖼️

**Impact:** -500ms LCP | **Effort:** 1h

```typescript
// src/shared/components/LazyImage.tsx
import { useState, useEffect, useRef, ImgHTMLAttributes } from "react";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
}

export const LazyImage = ({
  src,
  alt,
  placeholderSrc = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E",
  threshold = 0.1,
  className = "",
  ...props
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [src, threshold]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${className}`}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
};

// Usage
<LazyImage
  src="/images/user-avatar.jpg"
  alt="Avatar utilisateur"
  className="w-12 h-12 rounded-full"
/>
```

**Native Lazy Loading:**

```typescript
// Pour navigateurs modernes
<img
  src="/images/photo.jpg"
  alt="Photo"
  loading="lazy"
  decoding="async"
/>
```

---

#### **Priority 2: Image Optimization Pipeline** 🛠️

**Impact:** -60% taille images | **Effort:** 2-3h

**Installation outils:**

```bash
npm install -D vite-plugin-image-optimizer sharp
```

**Configuration Vite:**

```typescript
// vite.config.ts
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      // PNG optimization
      png: {
        quality: 80,
      },
      // JPEG optimization
      jpeg: {
        quality: 80,
      },
      // WebP conversion
      webp: {
        quality: 80,
      },
      // AVIF conversion (meilleur compression)
      avif: {
        quality: 70,
      },
    }),
  ],
});
```

**Picture Element avec fallback:**

```typescript
// src/shared/components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
}: OptimizedImageProps) => {
  // Générer les variants (assumant qu'ils existent)
  const avifSrc = src.replace(/\.\w+$/, ".avif");
  const webpSrc = src.replace(/\.\w+$/, ".webp");

  return (
    <picture>
      <source srcSet={avifSrc} type="image/avif" />
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

---

#### **Priority 3: SVG Optimization** 🎨

**Impact:** -30% taille SVG | **Effort:** 1h

**Installation:**

```bash
npm install -D vite-plugin-svgr svgo
```

**Configuration:**

```typescript
// vite.config.ts
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIDs: true,
                },
              },
            },
          ],
        },
      },
    }),
  ],
});
```

**Usage:**

```typescript
// Import SVG as React Component
import { ReactComponent as LogoSVG } from "@/assets/logo.svg";

export const Header = () => {
  return (
    <header>
      <LogoSVG className="w-32 h-12 text-blue-600" />
    </header>
  );
};
```

---

#### **Priority 4: CDN Strategy** 🌐

**Impact:** -200ms TTFB | **Effort:** 30min

Pour les assets statiques, utiliser un CDN:

```typescript
// .env.production
VITE_CDN_URL=https://cdn.clubmanager.com

// vite.config.ts
export default defineConfig({
  base: process.env.VITE_CDN_URL || "/",
  
  build: {
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split(".").pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|ttf|eot/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
```

**Cloudflare Images (alternative):**

```typescript
// src/shared/utils/imageLoader.ts
export const getCloudflareImageUrl = (
  src: string,
  options: {
    width?: number;
    quality?: number;
    format?: "auto" | "webp" | "avif";
  } = {}
) => {
  const { width = 800, quality = 80, format = "auto" } = options;
  
  // https://developers.cloudflare.com/images/url-format
  return `https://clubmanager.com/cdn-cgi/image/width=${width},quality=${quality},format=${format}/${src}`;
};

// Usage
<img src={getCloudflareImageUrl("/uploads/avatar.jpg", { width: 200 })} />
```

---

## 4️⃣ Network Optimization

### ✅ Action Plan - Network

#### **Priority 1: API Request Batching** 📦

**Impact:** -50% requêtes | **Effort:** 3h

```typescript
// src/shared/api/batchClient.ts
interface BatchRequest {
  endpoint: string;
  params?: Record<string, any>;
}

class BatchApiClient {
  private queue: BatchRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 50; // ms
  private readonly MAX_BATCH_SIZE = 10;

  async request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ endpoint, params });

      if (this.queue.length >= this.MAX_BATCH_SIZE) {
        this.flush();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), this.BATCH_DELAY);
      }

      // Store resolver for this request
      this.resolvers.set(this.queue.length - 1, { resolve, reject });
    });
  }

  private resolvers = new Map<number, { resolve: Function; reject: Function }>();

  private async flush() {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      const response = await apiClient.post("/api/batch", { requests: batch });
      
      // Résoudre chaque promesse
      response.data.results.forEach((result: any, index: number) => {
        const resolver = this.resolvers.get(index);
        if (resolver) {
          if (result.error) {
            resolver.reject(result.error);
          } else {
            resolver.resolve(result.data);
          }
          this.resolvers.delete(index);
        }
      });
    } catch (error) {
      // Rejeter toutes les promesses en cas d'erreur
      this.resolvers.forEach((resolver) => resolver.reject(error));
      this.resolvers.clear();
    }
  }
}

export const batchClient = new BatchApiClient();
```

---

#### **Priority 2: Prefetching & Preloading** 🔮

**Impact:** UX instantanée | **Effort:** 2h

```typescript
// src/shared/hooks/usePrefetch.ts
import { useQueryClient } from "@tanstack/react-query";

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchQuery = async (queryKey: any[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 10 * 1000, // 10s
    });
  };

  return { prefetchQuery };
};

// Usage - Prefetch au survol
import { usePrefetch } from "@/shared/hooks/usePrefetch";

export const CourseCard = ({ course }) => {
  const { prefetchQuery } = usePrefetch();
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    // Prefetch les données de la page de détails
    prefetchQuery(
      ["course", course.id],
      () => coursesApi.getCourseById(course.id)
    );
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <h3>{course.name}</h3>
    </div>
  );
};
```

**Route Prefetching:**

```typescript
// src/features/dashboard/pages/DashboardPage.tsx
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    // Prefetch les routes probables
    const timeout = setTimeout(() => {
      // L'utilisateur va probablement consulter les cours
      queryClient.prefetchQuery({
        queryKey: ["courses"],
        queryFn: () => coursesApi.getCourseRecurrents(),
      });
      
      // Et les messages
      queryClient.prefetchQuery({
        queryKey: ["messages"],
        queryFn: () => messagingApi.getMessages({ page: 1, limit: 20 }),
      });
    }, 2000); // Après 2s sur le dashboard
    
    return () => clearTimeout(timeout);
  }, [queryClient]);
  
  return <div>Dashboard content...</div>;
};
```

**Link Prefetch Component:**

```typescript
// src/shared/components/PrefetchLink.tsx
import { Link, LinkProps } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface PrefetchLinkProps extends LinkProps {
  prefetchKey: any[];
  prefetchFn: () => Promise<any>;
}

export const PrefetchLink = ({
  prefetchKey,
  prefetchFn,
  children,
  ...props
}: PrefetchLinkProps) => {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: prefetchKey,
      queryFn: prefetchFn,
    });
  };

  return (
    <Link {...props} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
};

// Usage
<PrefetchLink
  to="/courses"
  prefetchKey={["courses"]}
  prefetchFn={() => coursesApi.getCourseRecurrents()}
>
  Voir les cours
</PrefetchLink>
```

---

#### **Priority 3: Service Worker & Caching** 💾

**Impact:** Offline support + vitesse | **Effort:** 4-5h

**Installation:**

```bash
npm install -D vite-plugin-pwa
```

**Configuration:**

```typescript
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      
      manifest: {
        name: "ClubManager V3",
        short_name: "ClubManager",
        description: "Gestion de club sportif",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      
      workbox: {
        runtimeCaching: [
          {
            // Cache API responses
            urlPattern: /^https:\/\/api\.clubmanager\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24h
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache static assets
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts-cache",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

#### **Priority 4: HTTP/2 Server Push (Backend)** 🚀

Configuration Nginx pour HTTP/2:

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name clubmanager.com;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # HTTP/2 Server Push
    location / {
        root /var/www/clubmanager;
        try_files $uri $uri/ /index.html;

        # Push critical resources
        http2_push /assets/main.css;
        http2_push /assets/main.js;
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json application/javascript;

    # Brotli (meilleur que gzip)
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css application/json 
                 application/javascript text/xml application/xml 
                 application/xml+rss text/javascript;

    # Cache headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 5️⃣ Build & Deploy

### ✅ Action Plan - Build Optimization

#### **Priority 1: Build Configuration Avancée** ⚙️

```typescript
// vite.config.ts - Configuration optimale
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    
    // Compression Brotli
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    // Compression Gzip (fallback)
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],

  build: {
    target: "es2020",
    minify: "terser",
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info"],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      output: {
        // Nom de fichiers avec hash pour cache busting
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
    
    // Source maps en production (pour monitoring)
    sourcemap: process.env.NODE_ENV === "production" ? "hidden" : true,
    
    // Chunk size warning
    chunkSizeWarningLimit: 800,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Minify CSS
    cssMinify: true,
  },

  // Optimizations
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
    ],
    exclude: ["@stripe/stripe-js"], // Load dynamically
  },
});
```

---

#### **Priority 2: Environment-Specific Builds** 🌍

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isProduction = mode === "production";
  const isStaging = mode === "staging";

  return {
    plugins: [
      react(),
      // Compression uniquement en prod
      ...(isProduction
        ? [
            compression({ algorithm: "brotliCompress" }),
            compression({ algorithm: "gzip" }),
          ]
        : []),
    ],

    build: {
      minify: isProduction ? "terser" : false,
      sourcemap: isProduction ? "hidden" : true,
      
      rollupOptions: {
        output: {
          manualChunks: isProduction
            ? (id) => {
                // Code splitting avancé uniquement en production
                if (id.includes("node_modules")) {
                  return "vendor";
                }
              }
            : undefined,
        },
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
  };
});
```

**Scripts package.json:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --mode production",
    "build:staging": "vite build --mode staging",
    "build:analyze": "vite build --mode production && npx vite-bundle-visualizer",
    "preview": "vite preview",
    "preview:prod": "vite build && vite preview"
  }
}
```

---

#### **Priority 3: CI/CD Optimization** 🚦

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: |
            node_modules
            frontend/node_modules
            packages/types/node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check --workspace=frontend
      
      - name: Lint
        run: npm run lint --workspace=frontend
      
      - name: Build
        run: npm run build --workspace=frontend
        env:
          NODE_ENV: production
          VITE_API_BASE_URL: ${{ secrets.API_URL }}
      
      - name: Bundle Analysis
        run: npx vite-bundle-visualizer
        working-directory: frontend
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: frontend/dist
          retention-days: 7
      
      - name: Deploy to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: clubmanager
          directory: frontend/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

#### **Priority 4: Bundle Analyzer** 📊

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "./dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

**Analyse après build:**

```bash
npm run build
# Ouvre automatiquement stats.html dans le navigateur
```

---

## 6️⃣ Monitoring & Metrics

### ✅ Action Plan - Monitoring

#### **Priority 1: Web Vitals Tracking** 📈

```bash
npm install web-vitals
```

```typescript
// src/shared/lib/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

const sendToAnalytics = (metric: Metric) => {
  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Console en dev
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  }

  // Custom API (optionnel)
  fetch("/api/analytics/web-vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    }),
  }).catch((err) => console.error("Failed to send metric:", err));
};

export const initWebVitals = () => {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};

// Types pour window.gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams: Record<string, any>
    ) => void;
  }
}
```

```typescript
// src/main.tsx
import { initWebVitals } from "./shared/lib/webVitals";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Init Web Vitals tracking
if (import.meta.env.PROD) {
  initWebVitals();
}
```

---

#### **Priority 2: Lighthouse CI** 🏗️

```bash
npm install -D @lhci/cli
```

**Configuration:**

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview",
      url: ["http://localhost:4173/"],
      numberOfRuns: 3,
    },
    upload: {
      target: "temporary-public-storage",
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        
        // Core Web Vitals
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        
        // Bundle size
        "total-byte-weight": ["warn", { maxNumericValue: 1000000 }], // 1MB
        "unused-javascript": ["warn", { maxNumericValue: 100000 }],
        "uses-text-compression": "error",
        "uses-optimized-images": "warn",
      },
    },
  },
};
```

**GitHub Actions Integration:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build --workspace=frontend
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

#### **Priority 3: Error & Performance Monitoring** 🐛

**Sentry Integration:**

```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/shared/lib/sentry.ts
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      release: `clubmanager@${import.meta.env.VITE_APP_VERSION}`,
      
      // Performance monitoring
      integrations: [
        new BrowserTracing({
          tracingOrigins: ["localhost", "api.clubmanager.com", /^\//],
        }),
      ],
      
      tracesSampleRate: 0.2, // 20% des transactions
      
      // Ignore certaines erreurs
      ignoreErrors: [
        "ResizeObserver loop limit exceeded",
        "Non-Error promise rejection captured",
      ],
      
      beforeSend(event, hint) {
        // Filtrer les informations sensibles
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
};
```

```typescript
// src/main.tsx
import { initSentry } from "./shared/lib/sentry";

initSentry();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <App />
  </Sentry.ErrorBoundary>
);
```

**Custom Performance Marks:**

```typescript
// src/shared/utils/performance.ts
export const measurePerformance = (name: string, startMark?: string) => {
  if (!import.meta.env.PROD) return;

  try {
    performance.mark(`${name}-start`);
    
    return () => {
      performance.mark(`${name}-end`);
      performance.measure(
        name,
        startMark || `${name}-start`,
        `${name}-end`
      );
      
      const measure = performance.getEntriesByName(name)[0];
      console.log(`[Performance] ${name}: ${measure.duration}ms`);
      
      // Envoyer à analytics
      if (window.gtag) {
        window.gtag("event", "timing_complete", {
          name: name,
          value: Math.round(measure.duration),
          event_category: "Performance",
        });
      }
    };
  } catch (e) {
    console.error("Performance measurement failed:", e);
    return () => {};
  }
};

// Usage
const endMeasure = measurePerformance("load-courses-data");
// ... async operation
endMeasure();
```

---

#### **Priority 4: Performance Budgets** 💰

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 300
        },
        {
          "resourceType": "stylesheet",
          "budget": 50
        },
        {
          "resourceType": "image",
          "budget": 200
        },
        {
          "resourceType": "font",
          "budget": 100
        },
        {
          "resourceType": "total",
          "budget": 800
        }
      ]
    },
    {
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        }
      ]
    }
  ]
}
```

**Integration dans build:**

```bash
npm install -D bundlesize
```

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "300 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ],
  "scripts": {
    "test:size": "bundlesize"
  }
}
```

---

## 🎯 Plan d'Action Prioritaire

### Phase 1: Quick Wins (Semaine 1) ⚡

**Effort:** 8-10h | **Impact:** 🔴 Élevé

- [ ] **Lazy Loading Routes** (2h)
  - Convertir tous les imports de pages en lazy()
  - Ajouter Suspense avec loaders
  - **Gain attendu:** -200 KB bundle initial

- [ ] **Migration Heroicons** (2h)
  - Remplacer tous les imports PatternFly
  - Désinstaller @patternfly packages
  - **Gain attendu:** -1.2 MB

- [ ] **React Query Configuration** (1h)
  - Optimiser staleTime et gcTime
  - Configurer retry logic
  - **Gain attendu:** -40% requêtes

- [ ] **Code Splitting Avancé** (2h)
  - Améliorer vite.config.ts
  - Feature-based chunks
  - **Gain attendu:** Meilleure distribution

- [ ] **Web Vitals Tracking** (1h)
  - Installer web-vitals
  - Setup analytics
  - **Gain attendu:** Visibilité complète

**Métriques cibles après Phase 1:**
- Bundle: 800 KB → **400 KB** (-50%)
- FCP: 1.8s → **1.3s** (-28%)
- Requêtes réseau: -40%

---

### Phase 2: Optimisations Moyennes (Semaine 2-3) 🎯

**Effort:** 15-20h | **Impact:** 🟡 Moyen

- [ ] **React.memo + useCallback** (4h)
  - Identifier composants critiques
  - Mémoïser listes et callbacks
  - **Gain attendu:** -70% re-renders

- [ ] **Virtual Scrolling** (5h)
  - Implémenter sur listes messages/users/courses
  - **Gain attendu:** 60 FPS constant

- [ ] **Debouncing/Throttling** (2h)
  - Search inputs
  - Scroll handlers
  - **Gain attendu:** -70% appels API

- [ ] **Image Optimization** (3h)
  - Lazy loading
  - WebP/AVIF conversion
  - **Gain attendu:** -60% taille images

- [ ] **Build Optimization** (2h)
  - Compression Brotli/Gzip
  - Terser configuration
  - **Gain attendu:** -30% taille finale

- [ ] **Lighthouse CI** (2h)
  - Configuration
  - GitHub Actions
  - **Gain attendu:** Monitoring continu

**Métriques cibles après Phase 2:**
- Bundle: 400 KB → **300 KB** (-25%)
- LCP: 2.5s → **1.8s** (-28%)
- TTI: 3.5s → **2.5s** (-29%)

---

### Phase 3: Optimisations Avancées (Semaine 4-5) 🚀

**Effort:** 20-25h | **Impact:** 🟢 Moyen-Long terme

- [ ] **Optimistic UI Updates** (3h)
  - Présences courses
  - CRUD operations
  - **Gain attendu:** UX instantanée

- [ ] **API Batching** (4h)
  - Batch client
  - Backend support
  - **Gain attendu:** -50% requêtes

- [ ] **Prefetching Strategy** (3h)
  - Route prefetch
  - Hover prefetch
  - **Gain attendu:** Navigation instantanée

- [ ] **Service Worker + PWA** (5h)
  - Cache strategies
  - Offline support
  - **Gain attendu:** Offline-first

- [ ] **Monitoring Complet** (3h)
  - Sentry integration
  - Custom metrics
  - **Gain attendu:** Visibilité production

- [ ] **CDN Setup** (2h)
  - Cloudflare configuration
  - Asset optimization
  - **Gain attendu:** -200ms TTFB

**Métriques cibles après Phase 3:**
- Bundle: 300 KB → **280 KB** (-7%)
- FCP: 1.3s → **1.0s** (-23%)
- LCP: 1.8s → **1.5s** (-17%)
- TTI: 2.5s → **2.0s** (-20%)
- **Offline support:** ✅

---

## 📊 Métriques Finales Attendues

| Métrique | Avant | Phase 1 | Phase 2 | Phase 3 | **Target** | Amélioration |
|----------|-------|---------|---------|---------|------------|--------------|
| **Bundle Size (gzip)** | 800 KB | 400 KB | 300 KB | 280 KB | <300 KB | **-65%** |
| **FCP** | 1.8s | 1.3s | 1.3s | 1.0s | <1.2s | **-44%** |
| **LCP** | 2.5s | 2.0s | 1.8s | 1.5s | <2.0s | **-40%** |
| **TTI** | 3.5s | 2.8s | 2.5s | 2.0s | <2.5s | **-43%** |
| **CLS** | 0.05 | 0.03 | 0.02 | 0.01 | <0.1 | **-80%** |
| **Lighthouse** | 75 | 85 | 92 | 95+ | >90 | **+27%** |
| **API Calls** | 100% | 60% | 40% | 30% | - | **-70%** |
| **Re-renders** | 100% | 60% | 30% | 30% | - | **-70%** |

---

## 🛠️ Outils & Resources

### Analyse & Monitoring
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

### Libraries
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [Web Vitals](https://github.com/GoogleChrome/web-vitals)
- [Sentry](https://sentry.io/)
- [Vite PWA](https://vite-pwa-org.netlify.app/)

### Documentation
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [HTTP/2 Best Practices](https://web.dev/performance-http2/)

---

## 📝 Checklist Complète

### Bundle Optimization
- [ ] Lazy loading routes
- [ ] Code splitting avancé
- [ ] Tree shaking optimization
- [ ] Remove heavy dependencies (PatternFly)
- [ ] Dynamic imports composants lourds
- [ ] Bundle analyzer setup

### Runtime Performance
- [ ] React Query configuration optimale
- [ ] React.memo sur composants critiques
- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour handlers
- [ ] Virtual scrolling grandes listes
- [ ] Debouncing inputs
- [ ] Optimistic updates

### Assets
- [ ] Lazy loading images
- [ ] WebP/AVIF conversion
- [ ] Image compression
- [ ] SVG optimization
- [ ] CDN configuration

### Network
- [ ] API request batching
- [ ] Request deduplication
- [ ] Prefetching strategy
- [ ] Service Worker + PWA
- [ ] HTTP/2 configuration
- [ ] Compression (Brotli/Gzip)

### Build & Deploy
- [ ] Vite config optimisation
- [ ] Terser minification
- [ ] Source maps strategy
- [ ] Environment-specific builds
- [ ] CI/CD pipeline
- [ ] Performance budgets

### Monitoring
- [ ] Web Vitals tracking
- [ ] Lighthouse CI
- [ ] Error monitoring (Sentry)
- [ ] Custom performance metrics
- [ ] Analytics integration

---

## 🚀 Conclusion

Ce guide fournit un plan d'action complet pour optimiser ClubManager V3. En suivant les 3 phases, vous obtiendrez:

✅ **-65% de bundle size**  
✅ **-40% de temps de chargement**  
✅ **-70% de requêtes réseau**  
✅ **Expérience utilisateur fluide (60 FPS)**  
✅ **Support offline avec PWA**  
✅ **Monitoring production complet**

**Prochaines étapes:**
1. Commencer par la Phase 1 (Quick Wins)
2. Mesurer les métriques après chaque optimisation
3. Itérer et ajuster selon les résultats
4. Maintenir les performances avec Lighthouse CI

**Bonne optimisation ! 🚀⚡**