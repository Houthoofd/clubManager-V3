# 📚 Exemples d'Optimisation - ClubManager V3

Ce dossier contient des exemples de code prêts à l'emploi pour optimiser les performances du front-end de ClubManager V3.

## 📁 Contenu

### 1. `hooks.tsx` - Hooks d'Optimisation

Collection de hooks React réutilisables pour améliorer les performances :

- **`useDebounce`** - Debounce pour inputs de recherche
- **`useThrottle`** - Throttle pour événements fréquents (scroll, resize)
- **`usePrefetch`** - Prefetch des données React Query
- **`useIntersectionObserver`** - Lazy loading avec Intersection Observer
- **`useMediaQuery`** - Responsive design optimisé
- **`useWindowSize`** - Taille de fenêtre avec throttle
- **`useIdleCallback`** - Exécution pendant idle time
- **`usePerformanceMeasure`** - Mesure des performances
- **`useAsync`** - Gestion état asynchrone
- **`usePrevious`** - Valeur précédente
- **`useOptimizedCallback`** - Callback optimisé
- **`useMountedState`** - État de montage du composant

#### Installation

```bash
# Copier le fichier dans votre projet
cp hooks.tsx ../../frontend/src/shared/hooks/performance.tsx
```

#### Exemples d'utilisation

**Debounce pour recherche :**
```typescript
import { useDebounce } from '@/shared/hooks/performance';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

const { data } = useQuery({
  queryKey: ['search', debouncedSearch],
  queryFn: () => api.search(debouncedSearch),
  enabled: debouncedSearch.length >= 3,
});
```

**Prefetch au survol :**
```typescript
import { usePrefetch } from '@/shared/hooks/performance';

const { prefetchQuery } = usePrefetch();

<button
  onMouseEnter={() => prefetchQuery(
    ['user', userId],
    () => api.getUser(userId)
  )}
>
  View User
</button>
```

**Lazy loading avec Intersection Observer :**
```typescript
import { useIntersectionObserver } from '@/shared/hooks/performance';

const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5 });

<div ref={ref}>
  {isIntersecting && <HeavyComponent />}
</div>
```

---

### 2. `vite.config.optimized.ts` - Configuration Vite Optimisée

Configuration Vite complète avec toutes les optimisations recommandées.

#### Fonctionnalités

✅ **Code Splitting Avancé**
- Vendor chunks par catégorie (react, query, forms, etc.)
- Feature-based chunks
- Shared code chunks

✅ **Compression**
- Brotli (niveau 11)
- Gzip (niveau 9)

✅ **Minification**
- Terser avec options avancées
- Suppression des console.log en production
- Tree shaking agressif

✅ **PWA & Service Worker**
- Cache strategies optimales
- Offline support
- Workbox configuration

✅ **Image Optimization**
- Conversion WebP/AVIF
- Compression automatique

✅ **Bundle Analysis**
- Visualizer intégré
- Métriques de compression

#### Installation

```bash
# Backup de l'ancienne config
cp ../../frontend/vite.config.ts ../../frontend/vite.config.backup.ts

# Installer les dépendances nécessaires
cd ../../frontend
npm install -D \
  rollup-plugin-visualizer \
  vite-plugin-pwa \
  vite-plugin-compression \
  vite-plugin-image-optimizer

# Copier la nouvelle config
cp ../docs/optimization-examples/vite.config.optimized.ts ./vite.config.ts
```

#### Utilisation

```bash
# Build avec analyse
ANALYZE=true npm run build

# Build production
npm run build

# Build staging
npm run build:staging

# Preview
npm run preview
```

---

### 3. `analyze-bundle.js` - Script d'Analyse de Bundle

Script Node.js pour analyser la taille des bundles et obtenir des recommandations d'optimisation.

#### Fonctionnalités

- 📊 Analyse détaillée des fichiers JS/CSS
- 🗜️ Calcul des tailles (raw, gzip, brotli)
- 🎯 Comparaison avec les seuils définis
- 📦 Détection des dépendances lourdes
- 💡 Suggestions d'optimisation prioritaires
- 📄 Génération de rapport JSON

#### Installation

```bash
# Copier le script
cp analyze-bundle.js ../../frontend/scripts/

# Ajouter le script dans package.json
```

Ajouter dans `frontend/package.json` :
```json
{
  "scripts": {
    "analyze": "node scripts/analyze-bundle.js",
    "build:analyze": "npm run build && npm run analyze"
  }
}
```

#### Utilisation

```bash
# Analyser après un build
npm run build
npm run analyze

# Ou combiné
npm run build:analyze
```

#### Output exemple

```
📊 ClubManager V3 - Bundle Analysis
════════════════════════════════════════════════════════════

📦 Bundle Summary:
   JavaScript files: 15
   CSS files: 2
   Images: 8
   Fonts: 4

🟨 JavaScript Files:
────────────────────────────────────────────────────────────
   1. 🟢 react-vendor.abc123.js
      Raw: 450 KB | Gzip: 145 KB | Brotli: 128 KB
   2. 🔴 feature-statistics.def456.js
      Raw: 650 KB | Gzip: 220 KB | Brotli: 195 KB
   ...

📊 Total Bundle Size:
────────────────────────────────────────────────────────────
   Gzip: 450 KB
   Brotli: 380 KB

   ✅ Within threshold of 800 KB

💡 Optimization Suggestions:
────────────────────────────────────────────────────────────
   1. [HIGH] Remove PatternFly Dependencies
      Impact: -1.2 MB | Effort: 2-3 hours
      → Replace PatternFly with Heroicons and custom components
   ...
```

---

## 🚀 Guide d'Implémentation Rapide

### Phase 1 : Quick Wins (1 jour)

#### 1. Installer les hooks de performance
```bash
cp hooks.tsx ../../frontend/src/shared/hooks/performance.tsx
```

#### 2. Optimiser la configuration Vite
```bash
cd ../../frontend
npm install -D rollup-plugin-visualizer vite-plugin-compression
cp ../docs/optimization-examples/vite.config.optimized.ts ./vite.config.ts
```

#### 3. Analyser le bundle actuel
```bash
npm run build
node ../docs/optimization-examples/analyze-bundle.js
```

#### 4. Lazy load les routes (App.tsx)
```typescript
import { lazy, Suspense } from "react";

const DashboardPage = lazy(() => import("./features/dashboard/pages/DashboardPage"));
const CoursesPage = lazy(() => import("./features/courses/pages/CoursesPage"));
// ... autres pages

// Dans le JSX
<Route 
  path="/dashboard" 
  element={
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardPage />
    </Suspense>
  } 
/>
```

#### 5. Remplacer PatternFly par Heroicons
```typescript
// ❌ Avant
import { EnvelopeIcon } from "@patternfly/react-icons";

// ✅ Après
import { EnvelopeIcon } from "@heroicons/react/24/outline";
```

### Phase 2 : Optimisations Runtime (2-3 jours)

#### 1. Utiliser useDebounce pour les recherches
```typescript
import { useDebounce } from '@/shared/hooks/performance';

const debouncedSearch = useDebounce(searchTerm, 500);
```

#### 2. Ajouter React.memo aux composants de liste
```typescript
export const UserCard = memo(({ user, onSelect }) => {
  // ...
});
```

#### 3. Utiliser usePrefetch pour navigation
```typescript
const { prefetchQuery } = usePrefetch();

<Link
  to="/users"
  onMouseEnter={() => prefetchQuery(['users'], fetchUsers)}
>
  Users
</Link>
```

### Phase 3 : Optimisations Avancées (3-5 jours)

#### 1. Virtual scrolling pour grandes listes
```bash
npm install @tanstack/react-virtual
```

#### 2. PWA avec Service Worker
```bash
npm install -D vite-plugin-pwa
```

#### 3. Monitoring avec Sentry
```bash
npm install @sentry/react @sentry/tracing
```

---

## 📊 Métriques & Monitoring

### Mesurer les Performances

#### 1. Web Vitals
```bash
npm install web-vitals
```

```typescript
import { onCLS, onFCP, onLCP } from 'web-vitals';

onLCP(console.log);
onFCP(console.log);
onCLS(console.log);
```

#### 2. Lighthouse CI
```bash
npm install -D @lhci/cli
npx lhci autorun
```

#### 3. Bundle Size Tracking
```bash
npm install -D bundlesize
```

---

## 🔧 Outils Recommandés

### Développement
- **Vite DevTools** - Pour analyser les HMR updates
- **React DevTools Profiler** - Pour identifier les re-renders
- **Chrome DevTools Performance** - Pour CPU profiling

### Analyse
- **Lighthouse** - Audit de performance
- **WebPageTest** - Test de performance réel
- **Bundle Analyzer** - Visualisation du bundle

### Monitoring Production
- **Sentry** - Error & performance monitoring
- **Google Analytics 4** - Web Vitals tracking
- **LogRocket** - Session replay & monitoring

---

## 📚 Ressources

### Documentation
- [Guide d'optimisation complet](../FRONTEND_OPTIMIZATION_GUIDE.md)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Web.dev Performance](https://web.dev/performance/)

### Outils en ligne
- [Bundlephobia](https://bundlephobia.com/) - Analyse de dépendances
- [Can I Use](https://caniuse.com/) - Compatibilité navigateurs
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - CI/CD integration

---

## ✅ Checklist de Validation

Après chaque optimisation, vérifier :

- [ ] Bundle size réduit (analyser avec script)
- [ ] Lighthouse score > 90
- [ ] FCP < 1.2s
- [ ] LCP < 2.0s
- [ ] TTI < 2.5s
- [ ] CLS < 0.1
- [ ] Aucune régression fonctionnelle
- [ ] Tests passent

---

## 🆘 Support

Pour toute question ou problème :

1. Consulter le [guide complet](../FRONTEND_OPTIMIZATION_GUIDE.md)
2. Analyser le bundle avec `npm run analyze`
3. Vérifier les logs de build Vite
4. Utiliser React DevTools Profiler

---

## 📝 Notes

- Toujours tester les optimisations en local avant de déployer
- Mesurer avant/après chaque changement
- Prioriser les optimisations à fort impact / faible effort
- Documenter les métriques pour suivre les progrès

**Bonne optimisation ! 🚀**