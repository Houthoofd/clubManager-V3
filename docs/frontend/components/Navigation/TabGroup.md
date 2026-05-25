# TabGroup

Composant d'onglets de navigation réutilisable pour organiser le contenu en sections distinctes.

## Description

Le composant `TabGroup` permet de créer des interfaces à onglets cohérentes dans toute l'application. Il supporte les icônes, les badges numériques et le scroll horizontal sur mobile pour gérer un grand nombre d'onglets.

## Quand l'utiliser

- **Navigation de page** : Organiser différentes vues d'une même entité (ex: Produits / Catégories / Promotions)
- **Filtres de contenu** : Afficher différentes catégories de données (ex: Tous / En cours / Terminés)
- **Sections multiples** : Diviser un formulaire ou une page en sections logiques
- **Tableaux de bord** : Alterner entre différentes vues de données

### Utilisé dans l'application

- **StorePage** : 6 onglets (Produits, Catégories, Stock, Promotions, Ventes, Statistiques)
- **CoursesPage** : 3 onglets (Cours actifs, Cours archivés, Planning)
- **PaymentsPage** : 3 onglets (En attente, Payés, Remboursés)
- **MessagesPage** : 2 onglets (Reçus, Envoyés)

## API

### TabGroupProps

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `tabs` | `Tab[]` | - | **Requis.** Liste des onglets à afficher |
| `activeTab` | `string` | - | **Requis.** ID de l'onglet actuellement actif |
| `onTabChange` | `(tabId: string) => void` | - | **Requis.** Fonction appelée lors du changement d'onglet |
| `scrollable` | `boolean` | `false` | Active le scroll horizontal pour les onglets nombreux |
| `className` | `string` | `''` | Classes CSS additionnelles pour le conteneur |

### Tab Interface

| Propriété | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | `string` | ✅ | Identifiant unique de l'onglet |
| `label` | `string` | ✅ | Texte affiché dans l'onglet |
| `icon` | `ReactNode` | ❌ | Icône à afficher avant le label |
| `badge` | `number` | ❌ | Badge numérique (affiché uniquement si > 0) |

## Exemples

### Exemple basique

```tsx
import { useState } from 'react';
import { TabGroup } from '@/shared/components/TabGroup';

function MyComponent() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Produits' },
    { id: 'categories', label: 'Catégories' },
    { id: 'promotions', label: 'Promotions' },
  ];

  return (
    <div>
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Contenu conditionnel selon l'onglet actif */}
      {activeTab === 'products' && <ProductList />}
      {activeTab === 'categories' && <CategoryList />}
      {activeTab === 'promotions' && <PromotionList />}
    </div>
  );
}
```

### Avec icônes

```tsx
import { ShoppingCartIcon, TagIcon, TrendingUpIcon } from '@patternfly/react-icons';

const tabs = [
  { 
    id: 'products', 
    label: 'Produits',
    icon: <ShoppingCartIcon className="h-4 w-4" />
  },
  { 
    id: 'categories', 
    label: 'Catégories',
    icon: <TagIcon className="h-4 w-4" />
  },
  { 
    id: 'promotions', 
    label: 'Promotions',
    icon: <TrendingUpIcon className="h-4 w-4" />
  },
];

<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Avec badges

```tsx
const tabs = [
  { id: 'pending', label: 'En attente', badge: 12 },
  { id: 'paid', label: 'Payés', badge: 45 },
  { id: 'refunded', label: 'Remboursés', badge: 3 },
];

<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Avec icônes ET badges

```tsx
import { InboxIcon, PaperAirplaneIcon } from '@patternfly/react-icons';

const tabs = [
  { 
    id: 'inbox', 
    label: 'Reçus',
    icon: <InboxIcon className="h-4 w-4" />,
    badge: 8
  },
  { 
    id: 'sent', 
    label: 'Envoyés',
    icon: <PaperAirplaneIcon className="h-4 w-4" />,
    badge: 24
  },
];

<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Onglets avec scroll horizontal

Pour gérer un grand nombre d'onglets sur mobile, utilisez `scrollable`:

```tsx
const tabs = [
  { id: 'all', label: 'Tous les produits' },
  { id: 'electronics', label: 'Électronique' },
  { id: 'clothing', label: 'Vêtements' },
  { id: 'food', label: 'Alimentation' },
  { id: 'books', label: 'Livres' },
  { id: 'sports', label: 'Sports' },
  { id: 'home', label: 'Maison' },
  { id: 'garden', label: 'Jardin' },
];

<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  scrollable
/>
```

## Comportement du scroll

- **Par défaut** : Les onglets sont en `flex` et s'ajustent à la largeur disponible
- **Avec `scrollable={true}`** : 
  - Active `overflow-x-auto` pour permettre le scroll horizontal
  - Utilise `scrollbar-hide` pour masquer la scrollbar (tout en gardant la fonctionnalité)
  - Les onglets conservent `whitespace-nowrap` pour éviter le retour à la ligne
  - Recommandé quand vous avez 6+ onglets sur mobile

## Accessibilité

Le composant `TabGroup` suit les bonnes pratiques d'accessibilité ARIA :

### Attributs ARIA utilisés

- **`role="tablist"`** : Sur le conteneur principal pour identifier la liste d'onglets
- **`role="tab"`** : Sur chaque bouton d'onglet
- **`aria-selected`** : `true` pour l'onglet actif, `false` pour les autres
- **`aria-controls`** : Relie chaque onglet à son panneau de contenu (`tabpanel-{id}`)
- **`id`** : Identifiant unique pour chaque onglet (`tab-{id}`)

### Navigation au clavier

Les boutons standards permettent :
- **Tab** : Naviguer vers/depuis le groupe d'onglets
- **Enter/Space** : Activer l'onglet sélectionné
- **Click** : Activer un onglet à la souris

### Implémentation du contenu des onglets

Pour une accessibilité complète, associez chaque onglet à son panneau de contenu :

```tsx
<TabGroup
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

<div
  role="tabpanel"
  id="tabpanel-products"
  aria-labelledby="tab-products"
  hidden={activeTab !== 'products'}
>
  {/* Contenu de l'onglet Produits */}
</div>

<div
  role="tabpanel"
  id="tabpanel-categories"
  aria-labelledby="tab-categories"
  hidden={activeTab !== 'categories'}
>
  {/* Contenu de l'onglet Catégories */}
</div>
```

## Styles

### Onglet actif
- Bordure bleue en bas : `border-b-2 border-blue-600`
- Texte bleu : `text-blue-600`
- Badge bleu : `bg-blue-100 text-blue-800`

### Onglet inactif
- Bordure transparente : `border-transparent`
- Texte gris : `text-gray-500`
- Hover : `hover:text-gray-700 hover:border-gray-300`
- Badge gris : `bg-gray-100 text-gray-600`

### Transitions
- Changement de couleur fluide avec `transition-colors`

## Bonnes pratiques

1. **Nombre d'onglets** : Limitez à 3-6 onglets pour une meilleure UX. Au-delà, envisagez un menu déroulant
2. **Labels courts** : Gardez les labels concis (1-2 mots idéalement)
3. **Badges significatifs** : Utilisez les badges pour des informations importantes (notifications, éléments en attente)
4. **Icônes cohérentes** : Si vous utilisez des icônes, ajoutez-en à tous les onglets pour la cohérence
5. **État persistant** : Sauvegardez l'onglet actif dans l'URL ou le state pour le restaurer après navigation

## Exemples complets

Voir `TabGroup.examples.tsx` pour des exemples complets et interactifs.