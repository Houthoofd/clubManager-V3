# PageHeader Component

Composant d'en-tête de page réutilisable pour garantir la cohérence visuelle à travers toutes les pages de l'application. Ce composant standardise l'affichage des titres de page avec icônes, descriptions et actions.

## 📦 Installation

```tsx
import { PageHeader } from '@/shared/components/PageHeader';
```

## 🎯 Usage de Base

```tsx
<PageHeader
  title="Cours"
  description="Gestion du planning, des séances et des professeurs"
/>
```

## 📋 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | **Requis.** Titre de la page affiché en `h1` |
| `icon` | `ReactNode` | `undefined` | Icône optionnelle affichée à gauche (recommandé: h-8 w-8) |
| `description` | `string` | `undefined` | Description/sous-titre optionnel sous le titre |
| `actions` | `ReactNode` | `undefined` | Actions (boutons, filtres) affichées à droite |
| `breadcrumb` | `ReactNode` | `undefined` | Breadcrumb optionnel affiché au-dessus du titre |
| `className` | `string` | `''` | Classes CSS additionnelles |

## 🎨 Exemples d'Utilisation

### 1. Titre Simple

```tsx
<PageHeader title="Tableau de bord" />
```

**Cas d'usage :** Pages simples sans actions ni description.

---

### 2. Avec Icône

```tsx
import { CalendarIcon } from '@patternfly/react-icons';

<PageHeader
  icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
  title="Planning des cours"
/>
```

**Cas d'usage :** Ajouter une identité visuelle à la page. L'icône aide à la reconnaissance rapide.

**Recommandations :**
- Taille d'icône : `h-8 w-8`
- Couleurs suggérées : `text-blue-600`, `text-green-600`, `text-purple-600`

---

### 3. Avec Description

```tsx
<PageHeader
  title="Membres"
  description="Gérez les adhérents, suivez les abonnements et consultez l'historique"
/>
```

**Cas d'usage :** Fournir un contexte supplémentaire sur le contenu de la page.

---

### 4. Avec Actions

```tsx
import { Button } from '@/shared/components/Button';
import { PlusIcon } from '@patternfly/react-icons';

<PageHeader
  title="Cours"
  description="Gestion du planning et des séances"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Ajouter un cours
    </Button>
  }
/>
```

**Cas d'usage :** Ajouter des boutons d'action principaux (création, export, filtres).

**Actions multiples :**
```tsx
<PageHeader
  title="Transactions"
  actions={
    <div className="flex gap-2">
      <Button variant="outline" icon={<FilterIcon />}>
        Filtrer
      </Button>
      <Button variant="primary" icon={<DownloadIcon />}>
        Exporter
      </Button>
    </div>
  }
/>
```

---

### 5. Header Complet (Icône + Titre + Description + Actions)

```tsx
import { UsersIcon, PlusIcon } from '@patternfly/react-icons';

<PageHeader
  icon={<UsersIcon className="h-8 w-8 text-blue-600" />}
  title="Membres"
  description="256 adhérents actifs • 12 nouveaux ce mois"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Ajouter un membre
    </Button>
  }
/>
```

**Cas d'usage :** Pages principales avec toutes les informations et actions nécessaires.

---

### 6. Avec Breadcrumb

```tsx
import { ChevronRightIcon } from '@patternfly/react-icons';

<PageHeader
  breadcrumb={
    <nav className="flex items-center gap-2" aria-label="Breadcrumb">
      <a href="/" className="hover:text-gray-700 transition-colors">
        Accueil
      </a>
      <ChevronRightIcon className="h-4 w-4" />
      <a href="/cours" className="hover:text-gray-700 transition-colors">
        Cours
      </a>
      <ChevronRightIcon className="h-4 w-4" />
      <span className="text-gray-900 font-medium">Planning</span>
    </nav>
  }
  title="Planning des cours"
  description="Semaine du 6 au 12 janvier 2025"
/>
```

**Cas d'usage :** Navigation hiérarchique, pages de détail, sous-sections.

---

### 7. Layout Responsive avec Actions Multiples

```tsx
<PageHeader
  icon={<ShoppingCartIcon className="h-8 w-8 text-purple-600" />}
  title="Boutique"
  description="Gestion des produits et des ventes"
  actions={
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button variant="outline" size="md">
        Inventaire
      </Button>
      <Button variant="outline" size="md">
        Commandes
      </Button>
      <Button variant="primary" size="md" icon={<PlusIcon />}>
        Nouveau produit
      </Button>
    </div>
  }
/>
```

**Cas d'usage :** Pages avec plusieurs actions qui doivent s'adapter au mobile.

---

## 🎯 Quand Utiliser PageHeader

✅ **Utilisez PageHeader pour :**
- Toutes les pages principales de l'application
- Pages de listing (membres, cours, transactions, etc.)
- Pages de dashboard
- Pages de gestion
- Pages avec actions principales (création, export)

❌ **N'utilisez PAS PageHeader pour :**
- Modales (utilisez `Modal` avec son propre header)
- Sections internes d'une page (utilisez plutôt `h2`, `h3`)
- Pages d'authentification (login, register) qui ont leur propre design
- Composants réutilisables (pas de `h1` dans un composant)

---

## 🏗️ Structure du Composant

### Hiérarchie HTML

```html
<div class="space-y-4">
  <!-- Breadcrumb (optionnel) -->
  <div class="text-sm text-gray-500">
    {breadcrumb}
  </div>
  
  <!-- Header principal -->
  <div class="flex items-center justify-between gap-4">
    <!-- Gauche -->
    <div class="flex items-center gap-3">
      <div>{icon}</div>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </div>
    
    <!-- Droite -->
    <div>{actions}</div>
  </div>
</div>
```

### Styles Appliqués

- **Icône** : `flex-shrink-0` (ne se réduit pas)
- **Titre** : `text-2xl font-bold text-gray-900 truncate`
- **Description** : `text-sm text-gray-500`
- **Container** : `flex items-center justify-between gap-4`
- **Responsive** : Actions passent en pleine largeur sur mobile (`w-full sm:w-auto`)

---

## ♿ Accessibilité

### Semantic HTML

✅ **Le composant utilise :**
- `<h1>` pour le titre (sémantique correcte)
- `<nav>` pour le breadcrumb avec `aria-label="Breadcrumb"`
- Texte du titre toujours visible (pas masqué visuellement)

### Hiérarchie des Titres

```tsx
// ✅ CORRECT - Une seule h1 par page
<PageHeader title="Membres" />

<section>
  <h2>Membres actifs</h2>
  {/* Contenu */}
</section>

<section>
  <h2>Membres inactifs</h2>
  {/* Contenu */}
</section>
```

```tsx
// ❌ INCORRECT - Plusieurs h1 sur la même page
<PageHeader title="Membres" />

<section>
  <h1>Membres actifs</h1> {/* ❌ Devrait être h2 */}
</section>
```

### Recommandations

1. **Une seule `h1` par page** : PageHeader génère un `<h1>`, n'en ajoutez pas d'autre
2. **Hiérarchie respectée** : Utilisez `h2`, `h3`, etc. pour les sous-sections
3. **Breadcrumb accessible** : Utilisez `<nav aria-label="Breadcrumb">`
4. **Liens clairs** : Les liens du breadcrumb doivent avoir un texte descriptif
5. **Boutons accessibles** : Les boutons d'action doivent avoir des labels clairs

---

## 📱 Responsive Design

Le composant est entièrement responsive :

### Desktop (≥640px)
- Layout horizontal avec icône, titre et actions sur la même ligne
- Actions alignées à droite
- Titre tronqué si trop long (`truncate`)

### Mobile (<640px)
- Actions passent en pleine largeur (`w-full sm:w-auto`)
- Container flex avec `flex-wrap` pour permettre le passage à la ligne
- Icône et titre restent sur la même ligne
- Gap de 4 (16px) entre les éléments

**Exemple de stack vertical sur mobile :**

```tsx
<PageHeader
  title="Membres"
  actions={
    <div className="flex flex-col gap-2 w-full">
      <Button variant="primary" fullWidth>Ajouter</Button>
      <Button variant="outline" fullWidth>Filtrer</Button>
    </div>
  }
/>
```

---

## 🎨 Bonnes Pratiques

### 1. Titres Concis

```tsx
// ✅ BON - Titre court et clair
<PageHeader title="Cours" />

// ❌ ÉVITER - Titre trop long
<PageHeader title="Gestion complète du planning des cours de tennis et de padel" />
```

### 2. Descriptions Informatives

```tsx
// ✅ BON - Description utile avec métrique
<PageHeader
  title="Membres"
  description="256 adhérents actifs • 12 nouveaux ce mois"
/>

// ✅ BON - Description contextuelle
<PageHeader
  title="Planning"
  description="Semaine du 6 au 12 janvier 2025"
/>

// ❌ ÉVITER - Description redondante
<PageHeader
  title="Membres"
  description="Liste des membres"
/>
```

### 3. Icônes Cohérentes

```tsx
// ✅ BON - Taille et couleur cohérentes
<PageHeader
  icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
  title="Cours"
/>

// ❌ ÉVITER - Taille incorrecte
<PageHeader
  icon={<CalendarIcon className="h-4 w-4" />} // Trop petit
  title="Cours"
/>
```

### 4. Actions Pertinentes

```tsx
// ✅ BON - Action principale claire
<PageHeader
  title="Cours"
  actions={<Button variant="primary">Ajouter un cours</Button>}
/>

// ✅ BON - Actions secondaires groupées
<PageHeader
  title="Membres"
  actions={
    <div className="flex gap-2">
      <Button variant="outline">Exporter</Button>
      <Button variant="outline">Filtrer</Button>
      <Button variant="primary">Ajouter</Button>
    </div>
  }
/>

// ❌ ÉVITER - Trop d'actions
<PageHeader
  title="Cours"
  actions={
    <div className="flex gap-2">
      {/* 5+ boutons = surcharge visuelle */}
    </div>
  }
/>
```

### 5. Breadcrumb Optionnel

```tsx
// ✅ BON - Breadcrumb pour navigation profonde
<PageHeader
  breadcrumb={
    <nav aria-label="Breadcrumb">
      <a href="/">Accueil</a> > <a href="/cours">Cours</a> > Planning
    </nav>
  }
  title="Planning du 6 janvier"
/>

// ✅ BON - Pas de breadcrumb pour page de niveau 1
<PageHeader title="Dashboard" />
```

---

## 🔧 Personnalisation

### Classes CSS Additionnelles

```tsx
<PageHeader
  title="Cours"
  className="bg-blue-50 p-6 rounded-lg"
/>
```

### Styles Personnalisés pour Actions

```tsx
<PageHeader
  title="Boutique"
  actions={
    <div className="flex flex-col sm:flex-row gap-2">
      <Button variant="outline">Action 1</Button>
      <Button variant="primary">Action 2</Button>
    </div>
  }
/>
```

---

## 📊 Exemples Réels (Cas d'Usage)

### Page Cours
```tsx
<PageHeader
  icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
  title="Cours"
  description="Gestion du planning, des séances et des professeurs"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Ajouter un cours
    </Button>
  }
/>
```

### Page Membres
```tsx
<PageHeader
  icon={<UsersIcon className="h-8 w-8 text-green-600" />}
  title="Membres"
  description="256 adhérents actifs"
  actions={
    <div className="flex gap-2">
      <Button variant="outline">Exporter CSV</Button>
      <Button variant="primary">Ajouter un membre</Button>
    </div>
  }
/>
```

### Page Boutique
```tsx
<PageHeader
  icon={<ShoppingCartIcon className="h-8 w-8 text-purple-600" />}
  title="Boutique"
  description="Gestion des produits et des ventes"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Nouveau produit
    </Button>
  }
/>
```

### Page Transactions
```tsx
<PageHeader
  icon={<CreditCardIcon className="h-8 w-8 text-orange-600" />}
  title="Transactions"
  description="Historique complet des paiements"
  actions={
    <div className="flex gap-2">
      <Button variant="outline" icon={<FilterIcon />}>
        Filtrer
      </Button>
      <Button variant="outline" icon={<DownloadIcon />}>
        Exporter
      </Button>
    </div>
  }
/>
```

---

## 🚀 Migration depuis du Code Existant

### Avant (Code dupliqué)

```tsx
function CoursesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Cours</h1>
            <p className="text-sm text-gray-500">Gestion du planning</p>
          </div>
        </div>
        <Button>Ajouter</Button>
      </div>
      {/* Contenu */}
    </div>
  );
}
```

### Après (Avec PageHeader)

```tsx
function CoursesPage() {
  return (
    <div>
      <PageHeader
        icon={<CalendarIcon className="h-8 w-8 text-blue-600" />}
        title="Cours"
        description="Gestion du planning"
        actions={<Button>Ajouter</Button>}
      />
      {/* Contenu */}
    </div>
  );
}
```

**Avantages :**
- ✅ ~15 lignes → 8 lignes
- ✅ Cohérence visuelle garantie
- ✅ Responsive automatique
- ✅ Accessibilité intégrée
- ✅ Maintenance centralisée

---

## 📝 Notes Techniques

- Le composant utilise `truncate` sur le titre pour éviter les débordements
- `min-w-0` est appliqué pour permettre le truncate dans un flex container
- `flex-shrink-0` sur l'icône empêche sa réduction
- Le breadcrumb utilise `text-sm text-gray-500` pour la hiérarchie visuelle
- Les actions utilisent `w-full sm:w-auto` pour le responsive

---

## 🔗 Voir Aussi

- [Button Component](./Button.md) - Pour les actions
- [Card Component](./Card.md) - Pour les conteneurs de contenu
- [Badge Component](./Badge.md) - Pour les statuts dans la description
- [Design Tokens](../styles/designTokens.ts) - Pour la cohérence visuelle