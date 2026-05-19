# SectionHeader

Composant d'en-tête de section réutilisable pour les sous-sections à l'intérieur des pages.

## Description

**SectionHeader** permet de créer des en-têtes cohérents pour les sections et sous-sections d'une page. Contrairement à **PageHeader** qui utilise un `<h1>` pour le titre principal de la page, **SectionHeader** utilise `<h2>` ou `<h3>` pour respecter la hiérarchie sémantique HTML.

### Différence avec PageHeader

| Composant | Niveau HTML | Usage | Taille |
|-----------|-------------|-------|---------|
| **PageHeader** | `<h1>` | Titre principal de la page | `text-2xl` |
| **SectionHeader** (level=2) | `<h2>` | Section principale dans la page | `text-xl` |
| **SectionHeader** (level=3) | `<h3>` | Sous-section | `text-lg` |

### Quand l'utiliser

✅ **Utilisez SectionHeader pour :**
- Séparer les sections à l'intérieur d'une page
- Structurer le contenu des onglets (tabs)
- Organiser les formulaires en plusieurs sections
- Afficher des listes thématiques (Membres, Professeurs, Matériel, etc.)

❌ **N'utilisez PAS SectionHeader pour :**
- Le titre principal de la page (utilisez **PageHeader**)
- Des titres de niveau h4 ou inférieur (créez un composant dédié si nécessaire)

## Hiérarchie sémantique des headings

Respectez toujours la hiérarchie des titres HTML :

```
<PageHeader title="..." />           <!-- h1 -->
  <SectionHeader title="..." />       <!-- h2 (level=2, défaut) -->
    <SectionHeader level={3} />       <!-- h3 -->
```

⚠️ **Ne jamais sauter de niveau :**
- ❌ h1 → h3 (saute h2)
- ✅ h1 → h2 → h3

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | **Required** | Titre de la section |
| `description` | `string` | `undefined` | Description optionnelle (sous-titre) affichée sous le titre |
| `badge` | `number \| string` | `undefined` | Badge optionnel (ex: nombre d'items) affiché à droite du titre |
| `actions` | `ReactNode` | `undefined` | Actions à droite (boutons, etc.) |
| `level` | `2 \| 3` | `2` | Niveau de heading (`h2` pour section principale, `h3` pour sous-section) |
| `divider` | `boolean` | `false` | Afficher une ligne de séparation sous l'en-tête |
| `className` | `string` | `''` | Classes CSS additionnelles |

### Styles selon le niveau

- **level={2}** (défaut) : `text-xl font-semibold` - Pour les sections principales
- **level={3}** : `text-lg font-semibold` - Pour les sous-sections

## Exemples

### Basique (sans options)

```tsx
<SectionHeader title="Membres de la famille" />
```

### Avec badge (nombre d'items)

Idéal pour afficher le nombre d'éléments dans une liste :

```tsx
<SectionHeader 
  title="Membres actifs" 
  badge={24} 
/>

<SectionHeader 
  title="Professeurs" 
  badge="5 actifs" 
/>
```

### Avec description

Pour ajouter un contexte ou une explication :

```tsx
<SectionHeader
  title="Articles disponibles"
  description="Liste des produits actuellement en stock"
/>
```

### Avec actions

Pour permettre d'ajouter ou modifier des éléments :

```tsx
<SectionHeader
  title="Équipements"
  badge={12}
  actions={
    <Button size="sm" variant="primary">
      Ajouter un équipement
    </Button>
  }
/>
```

### Avec divider

Pour séparer visuellement les sections :

```tsx
<SectionHeader
  title="Informations personnelles"
  description="Données du profil utilisateur"
  divider
/>
{/* Contenu de la section */}
```

### Sous-section (level={3})

Pour les sous-sections à l'intérieur d'une section :

```tsx
<SectionHeader title="Informations générales" level={2} />
{/* Contenu... */}

<SectionHeader 
  title="Coordonnées" 
  level={3}
  description="Adresse et contact"
/>
{/* Contenu des coordonnées... */}

<SectionHeader 
  title="Informations bancaires" 
  level={3}
/>
{/* Contenu bancaire... */}
```

### Exemple complet

Tous les props utilisés ensemble :

```tsx
<SectionHeader
  title="Cours disponibles"
  description="Planning des séances à venir"
  badge={18}
  level={2}
  actions={
    <div className="flex gap-2">
      <Button size="sm" variant="outline">
        Filtrer
      </Button>
      <Button size="sm" variant="primary">
        Nouveau cours
      </Button>
    </div>
  }
  divider
/>
```

### Dans le contenu des onglets

```tsx
<TabGroup tabs={['Informations', 'Membres', 'Documents']}>
  <TabGroup.Panel>
    <SectionHeader 
      title="Informations générales" 
      description="Détails de la famille"
    />
    {/* Contenu... */}
  </TabGroup.Panel>
  
  <TabGroup.Panel>
    <SectionHeader 
      title="Membres" 
      badge={5}
      actions={<Button size="sm">Ajouter</Button>}
    />
    {/* Liste des membres... */}
  </TabGroup.Panel>
</TabGroup>
```

### Sections imbriquées (hiérarchie complète)

```tsx
{/* Titre de page (h1) */}
<PageHeader 
  title="Profil de la famille" 
  icon={<UsersIcon />}
/>

{/* Section principale (h2) */}
<SectionHeader 
  title="Membres de la famille" 
  badge={4}
  divider
/>

{/* Sous-sections (h3) */}
<SectionHeader 
  title="Parents" 
  level={3}
  badge={2}
/>
{/* Liste des parents... */}

<SectionHeader 
  title="Enfants" 
  level={3}
  badge={2}
/>
{/* Liste des enfants... */}
```

## Bonnes pratiques

### ✅ À faire

- **Respecter la hiérarchie sémantique** : h1 → h2 → h3
- **Utiliser le badge** pour les compteurs d'éléments
- **Ajouter une description** pour clarifier le contenu de la section
- **Utiliser `divider`** pour séparer visuellement des sections importantes
- **Grouper les actions** avec flexbox si plusieurs boutons

### ❌ À éviter

- Ne pas sauter de niveaux de heading (h1 → h3 directement)
- Ne pas utiliser plusieurs h1 dans une page (réservé à PageHeader)
- Ne pas abuser du badge (uniquement pour des infos utiles)
- Ne pas mettre trop d'actions (max 2-3 boutons)

## Accessibilité

### Hiérarchie des headings

Les lecteurs d'écran utilisent la hiérarchie des headings pour naviguer dans la page. Il est **crucial** de :

1. **Ne jamais sauter de niveau** (h1 → h2 → h3, jamais h1 → h3)
2. **Avoir un seul h1 par page** (géré par PageHeader)
3. **Utiliser les headings pour la structure**, pas pour le style

### Navigation au clavier

Les utilisateurs peuvent naviguer entre les headings avec les raccourcis clavier des lecteurs d'écran :
- **NVDA/JAWS** : Touche `H` pour aller au heading suivant
- **VoiceOver** : `VO + Cmd + H`

### Bonne structure d'exemple

```tsx
{/* Page : Gestion des membres */}
<PageHeader title="Gestion des membres" />  {/* h1 */}

<SectionHeader title="Familles" />          {/* h2 */}
<SectionHeader title="Adultes" level={3} /> {/* h3 */}
<SectionHeader title="Enfants" level={3} /> {/* h3 */}

<SectionHeader title="Professeurs" />       {/* h2 */}
```

### ARIA

Le composant n'a pas besoin d'attributs ARIA spécifiques car il utilise les éléments HTML sémantiques natifs (`<h2>` et `<h3>`).

## Exemples d'utilisation dans l'application

### Page de détail famille

```tsx
<SectionHeader 
  title="Membres de la famille" 
  badge={familyMembers.length}
  actions={<Button size="sm">Ajouter un membre</Button>}
  divider
/>
```

### Page de cours

```tsx
<SectionHeader 
  title="Séances à venir" 
  badge={upcomingSessions}
  description="Planning des 30 prochains jours"
/>
```

### Formulaire multi-sections

```tsx
<SectionHeader title="Informations personnelles" divider />
{/* Champs du formulaire... */}

<SectionHeader title="Coordonnées" divider />
{/* Champs d'adresse... */}

<SectionHeader title="Préférences" divider />
{/* Options... */}
```

## Notes techniques

- **Spacing** : Utilise `space-y-2` pour l'espacement vertical interne
- **Badge** : Style `bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs`
- **Divider** : Bordure supérieure grise avec `mt-3` pour l'espacement
- **Responsive** : Le layout est responsive avec `flex-shrink-0` sur les actions