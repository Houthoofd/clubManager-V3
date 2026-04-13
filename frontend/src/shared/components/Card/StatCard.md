# StatCard

Composant réutilisable pour afficher des statistiques dans un format compact et visuellement attrayant.

## Description

`StatCard` est un wrapper autour du composant `Card` optimisé pour afficher des métriques et statistiques. Il offre une structure cohérente avec support pour des icônes, variations de valeurs, et indicateurs de tendance.

## Caractéristiques

- ✅ Wrapper propre autour de `Card` avec `variant="compact"` et `hover`
- ✅ Support des icônes personnalisées
- ✅ Indicateurs de tendance (up/down/neutral) avec couleurs sémantiques
- ✅ Affichage de variation (change) optionnel
- ✅ Typé avec TypeScript
- ✅ Classes CSS personnalisables

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | **Requis** | Label de la statistique (ex: "Total Membres") |
| `value` | `string \| number` | **Requis** | Valeur principale (ex: "254", "12,450 €") |
| `change` | `string` | `undefined` | Variation optionnelle (ex: "+12%", "-5%") |
| `trend` | `'up' \| 'down' \| 'neutral'` | `undefined` | Tendance déterminant la couleur du change |
| `icon` | `ReactNode` | `undefined` | Icône optionnelle (React node) |
| `className` | `string` | `''` | Classes CSS additionnelles |

### Couleurs de tendance

- **`up`**: `text-green-600` (positif, amélioration)
- **`down`**: `text-red-600` (négatif, diminution)
- **`neutral`** ou absent: `text-gray-500` (neutre, pas de jugement)

## Exemples d'utilisation

### Exemple basique

```tsx
<StatCard
  label="Total Membres"
  value="254"
/>
```

### Avec variation positive

```tsx
<StatCard
  label="Revenus du mois"
  value="12,450 €"
  change="+15%"
  trend="up"
/>
```

### Avec variation négative

```tsx
<StatCard
  label="Absences"
  value="12"
  change="-8%"
  trend="down"
/>
```

### Avec icône

```tsx
import { Users } from 'lucide-react';

<StatCard
  label="Total Membres"
  value="254"
  change="+12%"
  trend="up"
  icon={<Users className="h-5 w-5" />}
/>
```

### Grille de statistiques

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    label="Total Membres"
    value="254"
    change="+12%"
    trend="up"
  />
  <StatCard
    label="Cours Actifs"
    value="18"
    change="+3"
    trend="up"
  />
  <StatCard
    label="Revenus du mois"
    value="12,450 €"
    change="-5%"
    trend="down"
  />
  <StatCard
    label="Taux de présence"
    value="87%"
    change="+2%"
    trend="up"
  />
</div>
```

## Bonnes pratiques

### ✅ À faire

- **Utiliser des labels clairs et concis** : "Total Membres" plutôt que "Membres"
- **Formater les valeurs correctement** : "12,450 €" avec séparateurs de milliers
- **Choisir la bonne tendance** :
  - `up` pour les améliorations (revenus ↑, membres ↑)
  - `down` pour les diminutions (absences ↓ peut être positif, mais utilisez `down` car c'est une diminution)
- **Utiliser des icônes cohérentes** : Préférez une bibliothèque comme `lucide-react` ou `heroicons`
- **Grilles responsives** : Utilisez `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` pour s'adapter aux écrans
- **Grouper les stats liées** : Mettez ensemble les métriques du même domaine

### ❌ À éviter

- **Ne pas utiliser `trend="up"` pour tout** : Soyez honnête avec les tendances négatives
- **Éviter les labels trop longs** : Ils doivent tenir sur une ligne
- **Ne pas mélanger les formats** : Gardez une cohérence (%, €, nombre)
- **Éviter trop de stats** : 4-6 maximum par grille pour ne pas surcharger
- **Ne pas omettre le change si pertinent** : Les utilisateurs veulent voir l'évolution

## Accessibilité

- ✅ Les couleurs de tendance sont accompagnées de symboles (+/-)
- ✅ Le texte est lisible avec un contraste suffisant
- ✅ La structure sémantique est claire (label → valeur → variation)

## Composition

`StatCard` est construit avec :
- **Card** : Composant de base avec `variant="compact"` et `hover`
- **Design Tokens** : Utilise les tokens de couleur et typographie

## Voir aussi

- [Card](./Card.md) - Composant de base
- [Card.examples.tsx](./Card.examples.tsx) - Exemple `StatsCards()` original

## Notes techniques

- Le composant utilise `getTrendColor()` pour mapper les tendances aux classes Tailwind
- La prop `value` accepte `string | number` pour plus de flexibilité
- L'icône est optionnelle et peut être n'importe quel `ReactNode`
- Le `hover` est activé par défaut via `Card variant="compact" hover`
