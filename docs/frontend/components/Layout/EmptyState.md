# EmptyState Component

Composant réutilisable pour afficher les états vides (no data) de manière cohérente dans toute l'application.

## Description

Le composant `EmptyState` est utilisé pour communiquer clairement à l'utilisateur qu'une section, liste ou page ne contient pas de données. Il offre une interface visuelle cohérente avec un titre, une description et optionnellement une icône et un bouton d'action.

## Quand l'utiliser

Utilisez `EmptyState` dans les situations suivantes :

- **Listes vides** : Aucun membre, aucune cotisation, aucun événement
- **Recherches sans résultats** : Aucun résultat trouvé pour les critères de recherche
- **Boîtes de réception vides** : Aucun message, aucune notification
- **Nouvelles fonctionnalités** : Section non encore utilisée par l'utilisateur
- **Tableaux de bord vides** : Pas encore de données à afficher
- **Filtres trop restrictifs** : Aucun élément ne correspond aux filtres appliqués

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | *requis* | Titre principal de l'état vide |
| `description` | `string` | *requis* | Description explicative pour guider l'utilisateur |
| `icon` | `ReactNode` | `undefined` | Icône à afficher en haut (recommandé) |
| `action` | `{ label: string, onClick: () => void }` | `undefined` | Action optionnelle sous forme de bouton |
| `variant` | `"default" \| "dashed"` | `"default"` | Variant visuel du conteneur |
| `className` | `string` | `undefined` | Classes CSS additionnelles |

### Variants

- **`default`** : Bordure pleine, idéal pour les cartes et sections standards
- **`dashed`** : Bordure en pointillés, idéal pour les zones de drag & drop ou contenus à créer

## Exemples

### Basique (titre + description)

```tsx
import { EmptyState } from '@/shared/components/EmptyState';

function MyComponent() {
  return (
    <EmptyState
      title="Aucune donnée disponible"
      description="Les données apparaîtront ici une fois configurées."
    />
  );
}
```

### Avec icône

```tsx
import { EmptyState } from '@/shared/components/EmptyState';
import { UsersIcon } from '@patternfly/react-icons';

function MembersList() {
  return (
    <EmptyState
      icon={<UsersIcon />}
      title="Aucun membre"
      description="Votre club ne contient aucun membre pour le moment."
    />
  );
}
```

### Avec action

```tsx
import { EmptyState } from '@/shared/components/EmptyState';
import { UsersIcon } from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';

function MembersList() {
  const navigate = useNavigate();

  return (
    <EmptyState
      icon={<UsersIcon />}
      title="Aucun membre"
      description="Commencez par ajouter votre premier membre au club."
      action={{
        label: "Ajouter un membre",
        onClick: () => navigate('/members/new')
      }}
    />
  );
}
```

### Variant dashed

```tsx
import { EmptyState } from '@/shared/components/EmptyState';
import { UploadIcon } from '@patternfly/react-icons';

function UploadZone() {
  return (
    <EmptyState
      variant="dashed"
      icon={<UploadIcon />}
      title="Aucun fichier"
      description="Glissez-déposez vos fichiers ici ou cliquez pour parcourir."
      action={{
        label: "Parcourir les fichiers",
        onClick: handleBrowseFiles
      }}
    />
  );
}
```

### Recherche sans résultats

```tsx
import { EmptyState } from '@/shared/components/EmptyState';
import { SearchIcon } from '@patternfly/react-icons';

function SearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<SearchIcon />}
      title="Aucun résultat trouvé"
      description={`Aucun résultat pour "${query}". Essayez d'autres mots-clés.`}
    />
  );
}
```

### Boîte de réception vide

```tsx
import { EmptyState } from '@/shared/components/EmptyState';
import { InboxIcon } from '@patternfly/react-icons';

function Inbox() {
  return (
    <EmptyState
      icon={<InboxIcon />}
      title="Boîte de réception vide"
      description="Vous n'avez aucun message. Profitez de ce moment de calme !"
    />
  );
}
```

## Bonnes pratiques

### ✅ À faire

- **Utiliser des icônes pertinentes** : Choisissez une icône qui représente le type de contenu manquant
- **Messages clairs et concis** : Le titre doit être court (3-5 mots), la description explicative
- **Proposer une action** : Quand c'est possible, guidez l'utilisateur vers la création du contenu
- **Ton positif** : Formulez les messages de manière encourageante plutôt que négative
- **Contexte** : Adaptez le message selon le contexte (nouvelle fonctionnalité vs recherche vide)

### ❌ À éviter

- **Messages techniques** : Évitez "No data in database" → Préférez "Aucun membre enregistré"
- **Trop de texte** : La description ne doit pas dépasser 2 lignes
- **Absence d'explication** : Ne laissez pas l'utilisateur sans comprendre pourquoi c'est vide
- **Actions non pertinentes** : Ne proposez pas d'action si l'utilisateur n'a pas les permissions
- **Surutilisation du variant dashed** : Réservez-le aux zones interactives (upload, création)

## Accessibilité

Le composant `EmptyState` respecte les bonnes pratiques d'accessibilité :

- **Structure sémantique** : Utilise des balises `<p>` pour le texte
- **Contraste** : Les couleurs respectent les ratios WCAG AA (text-gray-700, text-gray-500)
- **Bouton accessible** : Le composant Button intégré gère focus et keyboard navigation
- **Lisibilité** : Police et taille adaptées (text-sm avec font-semibold pour le titre)

### Recommandations supplémentaires

- Si l'état vide est dynamique (résultat de recherche), considérez l'utilisation d'une région ARIA live
- Pour les zones interactives (drag & drop), ajoutez des attributs ARIA appropriés

```tsx
<div role="region" aria-live="polite">
  <EmptyState
    title="Aucun résultat"
    description="Modifiez vos critères de recherche."
  />
</div>
```

## Styling

Le composant utilise les classes Tailwind suivantes :

- **Container** : `rounded-xl px-6 py-12 text-center`
- **Bordure default** : `border border-gray-200 bg-white`
- **Bordure dashed** : `border border-dashed border-gray-300 bg-white`
- **Icône** : `h-12 w-12 text-gray-300`
- **Titre** : `text-sm font-semibold text-gray-700`
- **Description** : `mt-2 text-sm text-gray-500`

Les classes peuvent être étendues via la prop `className`.

## Intégration avec d'autres composants

### Avec Card

```tsx
<Card>
  <Card.Header>
    <Card.Title>Membres du club</Card.Title>
  </Card.Header>
  <Card.Body>
    <EmptyState
      icon={<UsersIcon />}
      title="Aucun membre"
      description="Ajoutez votre premier membre pour commencer."
      action={{
        label: "Ajouter un membre",
        onClick: () => navigate('/members/new')
      }}
    />
  </Card.Body>
</Card>
```

### Avec Modal

```tsx
<Modal isOpen={isOpen} onClose={onClose} title="Rechercher un membre">
  {searchResults.length === 0 ? (
    <EmptyState
      icon={<SearchIcon />}
      title="Aucun résultat"
      description="Essayez avec d'autres mots-clés."
    />
  ) : (
    <MembersList members={searchResults} />
  )}
</Modal>
```

## Migration depuis du code existant

Si vous avez du code dupliqué pour gérer les états vides, vous pouvez le remplacer par `EmptyState` :

**Avant :**
```tsx
{members.length === 0 && (
  <div className="text-center py-12 border border-gray-200 rounded-lg">
    <p className="text-gray-600 font-medium">Aucun membre</p>
    <p className="text-gray-500 text-sm mt-1">Ajoutez votre premier membre</p>
    <button onClick={handleAdd} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
      Ajouter
    </button>
  </div>
)}
```

**Après :**
```tsx
{members.length === 0 && (
  <EmptyState
    icon={<UsersIcon />}
    title="Aucun membre"
    description="Ajoutez votre premier membre au club."
    action={{
      label: "Ajouter un membre",
      onClick: handleAdd
    }}
  />
)}
```

## Support

Pour toute question ou suggestion d'amélioration, contactez l'équipe frontend.