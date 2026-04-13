# Card Component

Composant de carte réutilisable avec variants et options configurables pour garantir la cohérence visuelle de l'application.

## 📦 Installation

```tsx
import { Card } from '@/shared/components/Card';
```

## 🎯 Usage de Base

```tsx
<Card>
  <h2>Titre de la carte</h2>
  <p>Contenu de la carte</p>
</Card>
```

## 📋 Props

### Card

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | **Requis.** Contenu de la carte |
| `variant` | `'compact' \| 'standard' \| 'emphasis'` | `'standard'` | Variant de padding |
| `hover` | `boolean` | `false` | Ajouter un effet hover |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'sm'` | Intensité de l'ombre |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `noPadding` | `boolean` | `false` | Désactiver le padding |
| `noBorder` | `boolean` | `false` | Désactiver la bordure |

### Card.Header

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Contenu du header |
| `className` | `string` | Classes CSS additionnelles |

### Card.Body

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Contenu du body |
| `className` | `string` | Classes CSS additionnelles |

### Card.Footer

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Contenu du footer |
| `className` | `string` | Classes CSS additionnelles |
| `gray` | `boolean` | Ajouter un background gris |

## 🎨 Variants de Padding

### Compact (`p-4`)
Utilisé pour les cartes dans des grilles ou listes.

```tsx
<Card variant="compact">
  <h3>Article</h3>
  <p>Description courte</p>
</Card>
```

**Cas d'usage :**
- Grilles d'articles
- Listes de membres
- Cards dans des listes compactes

### Standard (`p-6`) - Défaut
Utilisé pour les cartes de pages normales.

```tsx
<Card variant="standard">
  <h2>Titre de Section</h2>
  <p>Contenu standard</p>
</Card>
```

**Cas d'usage :**
- Cartes principales de page
- Sections de contenu
- Formulaires standards

### Emphasis (`p-8`)
Utilisé pour les pages auth, landing, ou mise en avant.

```tsx
<Card variant="emphasis">
  <h1>Bienvenue</h1>
  <p>Page de connexion</p>
</Card>
```

**Cas d'usage :**
- Pages de connexion/inscription
- Landing pages
- Mise en avant importante

## 💡 Exemples d'Utilisation

### 1. Carte Simple

```tsx
<Card>
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    Titre
  </h2>
  <p className="text-sm text-gray-600">
    Contenu de la carte
  </p>
</Card>
```

### 2. Carte avec Structure Complète

```tsx
<Card variant="standard">
  <Card.Header>
    <h3 className="text-xl font-semibold text-gray-900">
      Informations du Membre
    </h3>
    <p className="text-sm text-gray-500 mt-1">
      Détails et statistiques
    </p>
  </Card.Header>

  <Card.Body>
    <div className="space-y-4">
      <div>
        <label>Nom:</label>
        <p>Jean Dupont</p>
      </div>
      <div>
        <label>Email:</label>
        <p>jean@example.com</p>
      </div>
    </div>
  </Card.Body>

  <Card.Footer>
    <div className="flex justify-end gap-3">
      <button>Annuler</button>
      <button>Enregistrer</button>
    </div>
  </Card.Footer>
</Card>
```

### 3. Grille de Cartes Interactives

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {articles.map((article) => (
    <Card key={article.id} variant="compact" hover>
      <img src={article.image} alt={article.name} />
      <h3>{article.name}</h3>
      <p>{article.price}</p>
    </Card>
  ))}
</div>
```

### 4. Carte de Statistique

```tsx
<Card variant="compact">
  <div className="flex items-center justify-between mb-2">
    <p className="text-sm font-medium text-gray-600">
      Total Membres
    </p>
    <span className="text-xs font-medium text-green-600">
      +12%
    </span>
  </div>
  <p className="text-2xl font-bold text-gray-900">254</p>
</Card>
```

### 5. Carte Formulaire

```tsx
<Card variant="standard" className="max-w-2xl">
  <Card.Header>
    <h3 className="text-xl font-semibold text-gray-900">
      Nouveau Cours
    </h3>
  </Card.Header>

  <Card.Body>
    <form className="space-y-5">
      <div>
        <label>Nom du cours</label>
        <input type="text" />
      </div>
      <div>
        <label>Description</label>
        <textarea />
      </div>
    </form>
  </Card.Body>

  <Card.Footer>
    <div className="flex justify-end gap-3">
      <button>Annuler</button>
      <button>Créer</button>
    </div>
  </Card.Footer>
</Card>
```

### 6. Carte Sans Padding (Custom Layout)

```tsx
<Card noPadding className="overflow-hidden">
  <img 
    src="/banner.jpg" 
    alt="Banner" 
    className="w-full h-48 object-cover"
  />
  <div className="p-6">
    <h3>Titre</h3>
    <p>Contenu avec padding personnalisé</p>
  </div>
</Card>
```

### 7. Carte avec Shadow Prononcé

```tsx
<Card variant="emphasis" shadow="2xl">
  <h1>Bienvenue sur ClubManager</h1>
  <form>
    {/* Formulaire de connexion */}
  </form>
</Card>
```

### 8. Liste Compacte avec Hover

```tsx
<div className="space-y-3">
  {items.map((item) => (
    <Card 
      key={item.id} 
      variant="compact" 
      hover 
      className="cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span>{item.title}</span>
        <span>{item.status}</span>
      </div>
    </Card>
  ))}
</div>
```

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser les variants appropriés**
   ```tsx
   // ✅ Bon - Grille compacte
   <Card variant="compact" hover>
   
   // ✅ Bon - Page principale
   <Card variant="standard">
   
   // ✅ Bon - Auth/Landing
   <Card variant="emphasis" shadow="2xl">
   ```

2. **Utiliser hover pour les éléments cliquables**
   ```tsx
   // ✅ Bon - Carte cliquable
   <Card hover className="cursor-pointer" onClick={handleClick}>
   ```

3. **Structurer avec Header/Body/Footer**
   ```tsx
   // ✅ Bon - Structure claire
   <Card>
     <Card.Header>{/* Titre */}</Card.Header>
     <Card.Body>{/* Contenu */}</Card.Body>
     <Card.Footer>{/* Actions */}</Card.Footer>
   </Card>
   ```

### ❌ À ÉVITER

1. **Ne pas mélanger les variants sans raison**
   ```tsx
   // ❌ Mauvais - Incohérent
   <Card variant="emphasis">
     <Card variant="compact"> {/* Nested cards */}
   ```

2. **Ne pas override les styles de base**
   ```tsx
   // ❌ Mauvais - Casse la cohérence
   <Card className="rounded-sm shadow-none">
   
   // ✅ Bon - Utiliser les props
   <Card shadow="none">
   ```

3. **Ne pas recréer les styles manuellement**
   ```tsx
   // ❌ Mauvais
   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
   
   // ✅ Bon
   <Card variant="standard">
   ```

## 🔄 Migration depuis l'Ancien Code

### Avant

```tsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <h2>Titre</h2>
  <p>Contenu</p>
</div>
```

### Après

```tsx
<Card variant="compact">
  <h2>Titre</h2>
  <p>Contenu</p>
</Card>
```

## 🎨 Design Tokens Utilisés

- **Background:** `bg-white`
- **Border Radius:** `rounded-xl` (standardisé)
- **Border:** `border border-gray-100` (standardisé)
- **Shadow:** `shadow-sm` (défaut)
- **Padding:** `p-4` (compact), `p-6` (standard), `p-8` (emphasis)
- **Hover:** `hover:shadow-md transition-shadow duration-200`

## 📚 Voir Aussi

- [Design Tokens](../styles/designTokens.ts) - Tokens de design complets
- [Button Component](./Button.md) - Composant bouton
- [Badge Component](./Badge.md) - Composant badge
- [Modal Component](./Modal.md) - Composant modal
- [Audit de Style](../../../docs/AUDIT_STYLE.md) - Rapport d'audit complet

## 🐛 Troubleshooting

### La carte n'a pas de bordure
Vérifiez que vous n'avez pas activé `noBorder`.

```tsx
// ❌ Pas de bordure
<Card noBorder>

// ✅ Avec bordure (défaut)
<Card>
```

### L'effet hover ne fonctionne pas
Assurez-vous d'avoir activé la prop `hover`.

```tsx
// ❌ Pas d'effet
<Card>

// ✅ Avec effet hover
<Card hover>
```

### Le padding est trop grand/petit
Utilisez le variant approprié.

```tsx
<Card variant="compact">  {/* p-4 */}
<Card variant="standard"> {/* p-6 - défaut */}
<Card variant="emphasis"> {/* p-8 */}
```

## 📝 Notes de Version

- **v1.0.0** - Version initiale avec variants et sous-composants
- Basé sur l'audit de style (Note: 7.2/10 → 9/10)
- Standardisation complète de tous les styles de cartes