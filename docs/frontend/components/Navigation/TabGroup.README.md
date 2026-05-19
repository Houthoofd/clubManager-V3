# TabGroup Component

Composant d'onglets de navigation réutilisable avec support des icônes, badges et scroll horizontal. Disponible en **2 variants** pour s'adapter à différents contextes d'utilisation.

## 🎨 Variants

### 1. **`default`** (Classique)
- Style épuré avec `border-b-2` sur l'onglet actif
- Pas de background sur les onglets
- Hover avec changement de couleur de bordure
- **Usage** : Navigation principale, pages de contenu, interfaces standards

### 2. **`highlight`** (Moderne)
- Background `bg-blue-50` sur l'onglet actif
- Hover avec `bg-gray-50` sur les onglets inactifs
- Boutons de scroll avec chevrons (gauche/droite) si `scrollable={true}`
- **Usage** : Pages Settings, interfaces administratives, navigation premium

---

## 📋 Props

```typescript
interface TabGroupProps {
  /** Liste des onglets */
  tabs: Tab[];
  /** Onglet actif (id) */
  activeTab: string;
  /** Callback changement d'onglet */
  onTabChange: (tabId: string) => void;
  /** Variant de style
   * - "default": Border-b-2 simple, pas de background
   * - "highlight": Background sur onglet actif + boutons scroll
   * @default "default"
   */
  variant?: "default" | "highlight";
  /** Scroll horizontal sur mobile */
  scrollable?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

interface Tab {
  /** ID unique de l'onglet */
  id: string;
  /** Label affiché */
  label: string;
  /** Icône optionnelle (ReactNode) */
  icon?: ReactNode;
  /** Badge numérique optionnel */
  badge?: number;
}
```

---

## 🚀 Exemples d'utilisation

### Variant "default" - Basique

```tsx
import { TabGroup } from '@/shared/components/Navigation/TabGroup';

function MyComponent() {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Produits' },
    { id: 'categories', label: 'Catégories' },
    { id: 'inventory', label: 'Inventaire' },
  ];

  return (
    <TabGroup
      variant="default" // ou omis (default par défaut)
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}
```

### Variant "default" - Avec icônes et badges

```tsx
import { ShoppingCartIcon, TagIcon } from '@/components/icons';

const tabs = [
  { 
    id: 'store', 
    label: 'Boutique', 
    icon: <ShoppingCartIcon />,
    badge: 24 
  },
  { 
    id: 'categories', 
    label: 'Catégories', 
    icon: <TagIcon />,
    badge: 8 
  },
];

<TabGroup
  variant="default"
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Variant "highlight" - Style Settings

```tsx
import { CogIcon, ShieldCheckIcon, BellIcon } from '@/components/icons';

const tabs = [
  { id: 'general', label: 'Général', icon: <CogIcon /> },
  { id: 'security', label: 'Sécurité', icon: <ShieldCheckIcon />, badge: 2 },
  { id: 'notifications', label: 'Notifications', icon: <BellIcon />, badge: 5 },
];

<TabGroup
  variant="highlight"
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### Variant "highlight" - Avec scroll et chevrons

```tsx
const tabs = [
  { id: 'tab1', label: 'Configuration générale', icon: <CogIcon /> },
  { id: 'tab2', label: 'Sécurité avancée', icon: <ShieldCheckIcon />, badge: 3 },
  { id: 'tab3', label: 'Notifications', icon: <BellIcon />, badge: 12 },
  { id: 'tab4', label: 'Profil utilisateur', icon: <UserIcon /> },
  { id: 'tab5', label: 'Moyens de paiement', icon: <CreditCardIcon /> },
  { id: 'tab6', label: 'Langue et région', icon: <GlobeIcon /> },
  // ... plus d'onglets
];

<TabGroup
  variant="highlight"
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  scrollable={true} // Active les boutons chevron automatiquement
/>
```

---

## 🎯 Quand utiliser quel variant ?

### ✅ Utilisez **`variant="default"`** pour :
- Navigation principale d'une application
- Pages de liste (produits, cours, paiements)
- Interfaces orientées contenu
- Design minimaliste et épuré
- Lorsque les onglets doivent être discrets

### ✅ Utilisez **`variant="highlight"`** pour :
- Pages de paramètres (Settings)
- Interfaces d'administration
- Sections importantes nécessitant plus de visibilité
- Lorsque vous avez beaucoup d'onglets (avec `scrollable`)
- Design moderne et premium

---

## 🔧 Fonctionnalités

### 📌 Badges numériques
- Affichage automatique si `badge > 0`
- Couleur adaptative selon l'état actif/inactif
- Style cohérent avec le variant

### 📌 Scroll horizontal
- Activé avec `scrollable={true}`
- **Variant "default"** : Scroll natif avec scrollbar masquée
- **Variant "highlight"** : Boutons chevron + scroll natif

### 📌 Boutons de scroll (variant "highlight" uniquement)
- Apparaissent automatiquement si le contenu dépasse
- Icônes chevron gauche/droite
- Accessibilité avec `aria-label`
- Smooth scroll animé

### 📌 Accessibilité
- Attributs `role="tablist"` et `role="tab"`
- `aria-selected` sur l'onglet actif
- `aria-controls` pour lier l'onglet au panneau
- `aria-label` sur les boutons de scroll

---

## 💡 Bonnes pratiques

### Nombre d'onglets recommandé
- **2-4 onglets** : Variant "default" sans scroll
- **5-6 onglets** : Variant "default" ou "highlight" sans scroll
- **7+ onglets** : Variant "highlight" avec `scrollable={true}`

### Icônes
- Taille recommandée : `w-5 h-5` (20x20px)
- Utiliser des icônes SVG pour la cohérence
- Toujours ajouter un label même avec une icône

### Badges
- Utiliser pour des compteurs (notifications, éléments en attente)
- Ne pas afficher de badge à `0` (géré automatiquement)
- Éviter les badges > 999 (tronquer avec "999+")

### Performance
- Les événements de scroll sont throttlés
- Les boutons de scroll n'apparaissent que si nécessaire
- Cleanup automatique des event listeners

---

## 🎨 Design Tokens

Le composant utilise les Design Tokens du système :

```tsx
// Couleurs
- Onglet actif : text-blue-600, border-blue-600
- Onglet inactif : text-gray-500, border-transparent
- Hover : text-gray-700, hover:border-gray-300
- Background actif (highlight) : bg-blue-50
- Hover background (highlight) : hover:bg-gray-50

// Badges
- Badge actif : bg-blue-100, text-blue-800
- Badge inactif : bg-gray-100, text-gray-600

// Transitions
- transition-colors (native Tailwind)
```

---

## 📦 Exemples complets

Consultez `TabGroup.examples.tsx` pour voir tous les exemples en action :

1. ✅ Variant "default" - Basique
2. ✅ Variant "default" - Avec icônes
3. ✅ Variant "default" - Avec badges
4. ✅ Variant "default" - Scrollable
5. ✅ Variant "highlight" - Basique
6. ✅ Variant "highlight" - Page Settings
7. ✅ Variant "highlight" - Avec badges
8. ✅ Variant "highlight" - Scrollable avec chevrons
9. ✅ Page Boutique (exemple réel)
10. ✅ Page Settings complète (exemple réel)
11. ✅ Comparaison des variants

---

## 🐛 Troubleshooting

### Les boutons chevron n'apparaissent pas
- ✅ Vérifiez que `variant="highlight"` est défini
- ✅ Vérifiez que `scrollable={true}` est activé
- ✅ Assurez-vous que le contenu dépasse réellement

### Le scroll ne fonctionne pas
- ✅ Vérifiez la largeur du conteneur parent
- ✅ Assurez-vous d'avoir assez d'onglets pour déborder

### Les badges ne s'affichent pas
- ✅ Vérifiez que `badge > 0`
- ✅ Assurez-vous que la prop `badge` est un nombre

---

## 🔄 Migrations

### Depuis l'ancienne version (avant variants)
```tsx
// Avant
<TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

// Après (comportement identique)
<TabGroup 
  variant="default" // Explicite, mais "default" est la valeur par défaut
  tabs={tabs} 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>
```

**✅ 100% rétrocompatible** : Si vous ne spécifiez pas `variant`, le comportement reste identique à l'ancienne version.

---

## 📚 Références

- [Design Tokens](../../styles/designTokens.ts)
- [Exemples visuels](./TabGroup.examples.tsx)
- [Tests unitaires](./TabGroup.test.tsx) *(à créer)*

---

**Version** : 2.0.0 (avec variants)  
**Dernière mise à jour** : 2024  
**Auteur** : Club Manager Team