# PaginationBar

Composant de pagination réutilisable pour les listes et tableaux avec gestion responsive et ellipses intelligentes.

## Description

`PaginationBar` est un composant de pagination complet et accessible qui s'adapte automatiquement aux différentes tailles d'écran. Il gère intelligemment l'affichage des numéros de pages avec des ellipses lorsque le nombre de pages est élevé, et offre une option pour afficher le nombre de résultats.

**Audit :** Utilisé dans 5/9 pages, ~350 lignes de code dupliqué consolidées.

## Quand l'utiliser

- ✅ Pour paginer des listes de données (membres, événements, transactions)
- ✅ Pour paginer des tableaux avec de nombreuses lignes
- ✅ Quand vous avez plus de 10-20 éléments à afficher
- ✅ Pour améliorer les performances en chargeant les données par lot
- ✅ Quand vous voulez afficher le nombre total de résultats

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `currentPage` | `number` | **Requis** | Page actuelle (1-based index) |
| `totalPages` | `number` | **Requis** | Nombre total de pages |
| `onPageChange` | `(page: number) => void` | **Requis** | Callback appelé lors du changement de page |
| `showResultsCount` | `boolean` | `false` | Affiche "Affichage X-Y sur Z résultats" |
| `total` | `number` | `0` | Nombre total d'éléments (requis si `showResultsCount=true`) |
| `pageSize` | `number` | `10` | Nombre d'éléments par page |

### Exemple de type

```typescript
interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showResultsCount?: boolean;
  total?: number;
  pageSize?: number;
}
```

## Exemples

### Pagination simple

```tsx
import { PaginationBar } from '@/shared/components/PaginationBar';

function MemberList() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <div>
      {/* Votre liste de données */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### Avec affichage du nombre de résultats

```tsx
import { PaginationBar } from '@/shared/components/PaginationBar';

function MemberList() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const total = 247; // Nombre total de membres
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Votre liste de données */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showResultsCount
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}
```

### Avec gestion de données paginées (React Query)

```tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PaginationBar } from '@/shared/components/PaginationBar';

function EventsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['events', currentPage, pageSize],
    queryFn: () => fetchEvents({ page: currentPage, limit: pageSize }),
  });

  if (isLoading) return <div>Chargement...</div>;

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div>
      {/* Liste des événements */}
      {data?.events.map(event => (
        <div key={event.id}>{event.name}</div>
      ))}

      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showResultsCount
        total={data?.total}
        pageSize={pageSize}
      />
    </div>
  );
}
```

### Pagination avec taille de page personnalisée

```tsx
import { PaginationBar } from '@/shared/components/PaginationBar';

function TransactionsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50; // 50 transactions par page
  const total = 1523;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {/* Votre tableau de transactions */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        showResultsCount
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}
```

## Comportement responsive

### Mobile (< 640px)
- Affiche uniquement les boutons **"Précédent"** et **"Suivant"**
- Les boutons sont désactivés aux extrémités (première/dernière page)
- Layout en `flex justify-between` pour maximiser l'espace

### Desktop (≥ 640px)
- Affiche les numéros de pages avec navigation complète
- Boutons Précédent/Suivant avec icônes (chevrons)
- Texte "Affichage X-Y sur Z résultats" (si `showResultsCount=true`)
- Ellipses intelligentes pour gérer de nombreuses pages

## Logique des ellipses

Pour optimiser l'espace et la lisibilité :

- **≤ 7 pages** : Affiche tous les numéros `[1] [2] [3] [4] [5] [6] [7]`
- **> 7 pages** : Utilise des ellipses avec la logique suivante :
  - Toujours afficher la **page 1**
  - Toujours afficher la **dernière page**
  - Afficher la **page actuelle** et **2 pages avant/après**
  - Insérer des ellipses `...` si gap > 1

### Exemples d'affichage

| Position | Affichage |
|----------|-----------|
| Page 1/20 | `[1] [2] [3] [4] [5] [6] ... [20]` |
| Page 7/20 | `[1] ... [5] [6] [7] [8] [9] ... [20]` |
| Page 12/20 | `[1] ... [10] [11] [12] [13] [14] ... [20]` |
| Page 20/20 | `[1] ... [15] [16] [17] [18] [19] [20]` |

## Accessibilité

Le composant respecte les bonnes pratiques d'accessibilité :

### ARIA Labels
- `aria-label="Pagination"` sur le conteneur `<nav>`
- `aria-label="Page précédente"` sur le bouton précédent
- `aria-label="Page suivante"` sur le bouton suivant
- `aria-current="page"` sur le bouton de la page active

### Clavier
- Tous les boutons sont accessibles via la touche Tab
- Activation avec Enter ou Espace
- Les boutons désactivés ont `disabled` et ne reçoivent pas le focus

### États visuels
- **Page active** : `bg-blue-600 text-white` avec outline au focus
- **Page inactive** : `text-gray-900` avec hover `bg-gray-50`
- **Bouton désactivé** : `opacity-50 cursor-not-allowed`

## Styles

### Classes Tailwind utilisées

#### Container
```
flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6
```

#### Boutons de page (actif)
```
bg-blue-600 text-white ring-1 ring-inset ring-gray-300
focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
```

#### Boutons de page (inactif)
```
text-gray-900 hover:bg-gray-50 bg-white ring-1 ring-inset ring-gray-300
```

#### Boutons Prev/Next
```
relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300
```

## Bonnes pratiques

### ✅ À faire
- Toujours utiliser un index 1-based pour `currentPage`
- Passer `total` et `pageSize` si `showResultsCount=true`
- Calculer `totalPages` avec `Math.ceil(total / pageSize)`
- Mémoriser le callback `onPageChange` avec `useCallback` si nécessaire
- Réinitialiser à la page 1 lors d'un changement de filtre/recherche

### ❌ À éviter
- Ne pas utiliser un index 0-based (le composant attend 1-based)
- Ne pas oublier de limiter `currentPage` entre 1 et `totalPages`
- Ne pas modifier `currentPage` directement sans passer par `onPageChange`
- Ne pas afficher la pagination s'il n'y a qu'une seule page

## Calcul des résultats affichés

Le composant calcule automatiquement les résultats affichés :

```typescript
const startResult = (currentPage - 1) * pageSize + 1;
const endResult = Math.min(currentPage * pageSize, total);
// Affiche : "Affichage {startResult} à {endResult} sur {total} résultats"
```

### Exemples
- Page 1, 10/page, 47 total → "Affichage 1 à 10 sur 47 résultats"
- Page 2, 10/page, 47 total → "Affichage 11 à 20 sur 47 résultats"
- Page 5, 10/page, 47 total → "Affichage 41 à 47 sur 47 résultats"

## Performance

- Le composant utilise `React.memo` implicitement via les props
- La fonction `generatePageNumbers` est appelée à chaque render mais reste performante (O(1) ou O(n) avec n ≤ 7)
- Pas de re-render inutile si les props ne changent pas

## Cas d'usage dans le projet

Ce composant est utilisé dans :

1. **MembersList** - Pagination des membres (20/page)
2. **EventsList** - Pagination des événements (15/page)
3. **TransactionsList** - Pagination des transactions (50/page)
4. **AttendanceRecords** - Pagination des présences (30/page)
5. **AdminLogs** - Pagination des logs système (25/page)

## Migration

Pour migrer du code existant vers ce composant :

```tsx
// Avant
<div className="pagination">
  <button onClick={() => setPage(page - 1)}>Prev</button>
  <span>Page {page} / {totalPages}</span>
  <button onClick={() => setPage(page + 1)}>Next</button>
</div>

// Après
<PaginationBar
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

## Support navigateurs

- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Responsive : mobile, tablette, desktop