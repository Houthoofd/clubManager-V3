# StatusBadge

Composant spécialisé pour afficher des badges de statut colorés avec des configurations prédéfinies.

## Description

`StatusBadge` est une **extension spécialisée** du composant `Badge` générique. Il simplifie l'affichage de statuts communs en fournissant des configurations prédéfinies (couleurs, labels) pour 7 types de statuts fréquemment utilisés dans l'application.

### Différence avec Badge

| Aspect | Badge | StatusBadge |
|--------|-------|-------------|
| **Usage** | Générique, flexible | Spécialisé pour les statuts |
| **Configuration** | Variants personnalisables | Statuts prédéfinis (7 types) |
| **Contenu** | `children` personnalisé | Labels automatiques avec override possible |
| **Couleurs** | 7 variants génériques | 7 configurations de statut |
| **Cas d'usage** | Badges divers, tags, catégories | Statuts d'entités (actif/inactif, payé/en attente, etc.) |

**Quand utiliser StatusBadge :**
- Affichage de statuts standardisés (actif, inactif, en attente, etc.)
- Dans les tableaux de données (colonnes de statut)
- Dans les cards d'information (statut d'un cours, d'un utilisateur)
- Dans les listes (état d'un paiement, d'une commande)

**Quand utiliser Badge :**
- Badges personnalisés ou non-statuts
- Tags et catégories
- Compteurs et notifications
- Badges avec icônes ou suppression

## Import

```tsx
import StatusBadge from '@/shared/components/StatusBadge';
```

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `status` | `StatusType` | **requis** | Type de statut à afficher |
| `label` | `string` | `undefined` | Label personnalisé (override le label par défaut) |
| `showDot` | `boolean` | `false` | Affiche un point coloré avant le label |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Taille du badge |
| `className` | `string` | `undefined` | Classes CSS additionnelles |

### Types de statuts disponibles

```typescript
type StatusType = 
  | "active"      // Actif (vert)
  | "inactive"    // Inactif (gris)
  | "pending"     // En attente (jaune)
  | "success"     // Payé / Validé (vert)
  | "error"       // Erreur / Rejeté (rouge)
  | "warning"     // Attention (orange)
  | "archived";   // Archivé (gris)
```

### Configuration des statuts (STATUS_CONFIG)

| Status | Label par défaut | Couleur de fond | Couleur de texte | Couleur du dot |
|--------|------------------|-----------------|------------------|----------------|
| `active` | "Actif" | Vert clair | Vert foncé | Vert |
| `inactive` | "Inactif" | Gris clair | Gris foncé | Gris |
| `pending` | "En attente" | Jaune clair | Jaune foncé | Jaune |
| `success` | "Payé / Validé" | Vert clair | Vert foncé | Vert |
| `error` | "Erreur / Rejeté" | Rouge clair | Rouge foncé | Rouge |
| `warning` | "Attention" | Orange clair | Orange foncé | Orange |
| `archived` | "Archivé" | Gris clair | Gris moyen | Gris clair |

### Tailles disponibles

| Taille | Padding | Taille de texte | Taille du dot |
|--------|---------|-----------------|---------------|
| `sm` | `px-2 py-0.5` | `text-xs` | `h-1.5 w-1.5` |
| `md` | `px-2.5 py-0.5` | `text-xs` | `h-2 w-2` |
| `lg` | `px-3 py-1` | `text-sm` | `h-2.5 w-2.5` |

## Exemples

### Statuts de base (avec labels par défaut)

```tsx
<StatusBadge status="active" />
<StatusBadge status="inactive" />
<StatusBadge status="pending" />
<StatusBadge status="success" />
<StatusBadge status="error" />
<StatusBadge status="warning" />
<StatusBadge status="archived" />
```

### Avec points colorés

```tsx
<StatusBadge status="active" showDot />
<StatusBadge status="pending" showDot />
<StatusBadge status="error" showDot />
```

### Labels personnalisés

```tsx
<StatusBadge status="success" label="Payé" />
<StatusBadge status="pending" label="En cours de validation" />
<StatusBadge status="error" label="Paiement échoué" />
<StatusBadge status="active" label="Cours en ligne" />
```

### Différentes tailles

```tsx
<StatusBadge status="success" size="sm" label="Petit" />
<StatusBadge status="success" size="md" label="Moyen" />
<StatusBadge status="success" size="lg" label="Grand" />
```

### Cas d'usage : Statuts de paiement

```tsx
// Paiement validé
<StatusBadge status="success" label="Payé" showDot />

// En attente de paiement
<StatusBadge status="pending" label="En attente" showDot />

// Paiement échoué
<StatusBadge status="error" label="Échoué" showDot />
```

### Cas d'usage : Statuts de cours

```tsx
// Cours actif
<StatusBadge status="active" showDot />  // Affiche "Actif"

// Cours terminé
<StatusBadge status="archived" label="Terminé" />

// Cours à venir
<StatusBadge status="pending" label="Programmé" />
```

### Cas d'usage : Statuts d'utilisateur

```tsx
// Utilisateur actif
<StatusBadge status="active" showDot />

// Utilisateur suspendu
<StatusBadge status="inactive" label="Suspendu" showDot />

// Compte archivé
<StatusBadge status="archived" showDot />
```

### Dans un tableau

```tsx
<table>
  <thead>
    <tr>
      <th>Nom</th>
      <th>Statut</th>
      <th>Paiement</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Jean Dupont</td>
      <td><StatusBadge status="active" showDot /></td>
      <td><StatusBadge status="success" label="Payé" showDot /></td>
    </tr>
    <tr>
      <td>Marie Martin</td>
      <td><StatusBadge status="inactive" showDot /></td>
      <td><StatusBadge status="pending" label="En attente" showDot /></td>
    </tr>
    <tr>
      <td>Paul Durand</td>
      <td><StatusBadge status="archived" showDot /></td>
      <td><StatusBadge status="error" label="Échoué" showDot /></td>
    </tr>
  </tbody>
</table>
```

### Dans une Card

```tsx
import Card from './Card';

<Card>
  <Card.Header>
    <div className="flex items-center justify-between">
      <h3>Cours de Tennis</h3>
      <StatusBadge status="active" showDot />
    </div>
  </Card.Header>
  <Card.Content>
    <p>Cours tous les mercredis de 14h à 16h</p>
    <div className="mt-4 flex gap-2">
      <StatusBadge status="success" label="15 inscrits" size="sm" />
      <StatusBadge status="warning" label="3 places restantes" size="sm" />
    </div>
  </Card.Content>
</Card>
```

## Bonnes pratiques

### ✅ À faire

- Utiliser `StatusBadge` pour les statuts standardisés et répétitifs
- Activer `showDot` pour améliorer la distinction visuelle dans les tableaux
- Personnaliser le label seulement quand nécessaire (respecter les labels par défaut)
- Utiliser `size="sm"` dans les tableaux denses pour gagner de l'espace
- Combiner plusieurs badges pour afficher des informations complémentaires

```tsx
// ✅ Bon : Statut clair avec point coloré
<StatusBadge status="active" showDot />

// ✅ Bon : Label personnalisé pertinent
<StatusBadge status="pending" label="En cours de traitement" showDot />

// ✅ Bon : Taille adaptée au contexte
<td><StatusBadge status="success" size="sm" showDot /></td>
```

### ❌ À éviter

- N'utilisez pas `StatusBadge` pour des badges non-statuts (préférez `Badge`)
- N'abusez pas des labels personnalisés (cohérence de l'UI)
- Évitez les badges trop grands dans les tableaux
- Ne mélangez pas les styles (avec/sans dot dans la même colonne)

```tsx
// ❌ Mauvais : Utiliser StatusBadge pour une catégorie
<StatusBadge status="success" label="Sport" /> // Utilisez Badge

// ❌ Mauvais : Labels incohérents
<StatusBadge status="active" label="Actif" />
<StatusBadge status="active" label="En ligne" />
<StatusBadge status="active" label="Disponible" />
// Choisissez UN label par statut dans votre contexte

// ❌ Mauvais : Taille inappropriée
<h1>
  <StatusBadge status="active" size="lg" /> // Trop grand pour un titre
</h1>
```

## Accessibilité

### Contraste des couleurs

Toutes les combinaisons de couleurs respectent les normes **WCAG 2.1 niveau AA** pour le contraste :
- Fond clair + Texte foncé = ratio de contraste ≥ 4.5:1
- Les couleurs sont suffisamment distinctes pour les personnes daltoniennes

### Texte visible

- Le label est **toujours visible** (pas uniquement via la couleur)
- Le point coloré (`showDot`) est un indicateur visuel **supplémentaire**, pas le seul moyen de transmission de l'information
- Les utilisateurs avec déficiences visuelles peuvent comprendre le statut grâce au texte

### Recommandations

```tsx
// ✅ Accessible : Le texte transmet l'information
<StatusBadge status="success" label="Payé" showDot />

// ⚠️ Acceptable mais moins clair : Label par défaut
<StatusBadge status="success" showDot /> // "Payé / Validé"

// 💡 Conseil : Ajoutez le dot pour renforcer la distinction visuelle
<StatusBadge status="error" label="Échec" showDot />
```

### Attributs ARIA

Le composant utilise `aria-hidden="true"` sur le point coloré car :
- Le point est purement décoratif
- L'information est transmise par le texte du label
- Les lecteurs d'écran ne lisent que le texte, pas la couleur

## Notes techniques

### Performance

- Le composant est **stateless** (aucun state interne)
- Configuration en `const` pour optimisation du bundle
- Pas de re-render inutile
- Utilise `cn()` pour la composition de classes (performant)

### Personnalisation

Si les 7 statuts prédéfinis ne suffisent pas, vous pouvez :
1. **Utiliser le composant Badge générique** pour des cas spécifiques
2. **Étendre STATUS_CONFIG** (modification du composant)
3. **Proposer un nouveau statut** si c'est un besoin récurrent

```tsx
// Pour un cas spécifique, préférez Badge
import Badge from './Badge';
<Badge variant="purple" dot>Statut personnalisé</Badge>
```

## Voir aussi

- [Badge](./Badge.md) - Composant générique parent
- [Card](./Card.md) - Conteneur pour afficher des badges de statut
- Design Tokens - Variables de couleurs et espacements