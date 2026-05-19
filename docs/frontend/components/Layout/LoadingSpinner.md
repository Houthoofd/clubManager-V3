# LoadingSpinner Component

Composant de spinner de chargement réutilisable pour afficher un état de chargement dans l'application. Remplace tous les spinners dupliqués du projet (~250 lignes de code).

## 📦 Installation

```tsx
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
```

## 🎯 Usage de Base

```tsx
<LoadingSpinner />
```

## 📋 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du spinner |
| `text` | `string` | `undefined` | Texte optionnel à afficher |
| `className` | `string` | `undefined` | Classes CSS additionnelles |

### Tailles disponibles

- **`sm`** - `h-4 w-4` - Petit, pour utilisation inline ou dans des boutons
- **`md`** - `h-5 w-5` - Défaut, usage standard dans les pages
- **`lg`** - `h-8 w-8` - Grand, pour les chargements de pages principales

## 🎯 Quand l'Utiliser

### ✅ Utilisez LoadingSpinner quand :

- Vous chargez des données depuis une API
- Une opération asynchrone est en cours
- Vous souhaitez indiquer un état de chargement à l'utilisateur
- Vous remplacez du contenu temporairement pendant le chargement

### ❌ N'utilisez PAS LoadingSpinner pour :

- Les animations décoratives (utilisez CSS)
- Les barres de progression (créez un composant ProgressBar)
- Les skeleton loaders (créez un composant Skeleton)

## 💡 Exemples d'Utilisation

### 1. Spinner Simple (Défaut)

```tsx
<LoadingSpinner />
```

Usage le plus basique, taille moyenne, sans texte.

### 2. Spinner avec Texte

```tsx
<LoadingSpinner text="Chargement des données..." />
```

Affiche un texte explicatif à côté du spinner.

### 3. Spinner de Différentes Tailles

```tsx
{/* Petit spinner */}
<LoadingSpinner size="sm" />

{/* Spinner moyen (défaut) */}
<LoadingSpinner size="md" />

{/* Grand spinner */}
<LoadingSpinner size="lg" />
```

### 4. Spinner Pleine Page

```tsx
<div className="min-h-screen flex items-center justify-center">
  <LoadingSpinner size="lg" text="Chargement de la page..." />
</div>
```

Pour les chargements de pages principales.

### 5. Spinner Inline (Sans Padding)

```tsx
<LoadingSpinner size="sm" className="py-0" />
```

Désactive le padding vertical par défaut pour une utilisation inline.

### 6. Dans un Bouton

```tsx
<button disabled className="flex items-center gap-2">
  <LoadingSpinner size="sm" className="py-0" />
  <span>Chargement...</span>
</button>
```

### 7. Dans une Card

```tsx
<Card>
  <Card.Header>
    <h3>Liste des Membres</h3>
  </Card.Header>
  <Card.Body>
    {loading ? (
      <LoadingSpinner text="Chargement des membres..." />
    ) : (
      <MembersList members={members} />
    )}
  </Card.Body>
</Card>
```

### 8. Avec État de Chargement Conditionnel

```tsx
function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const data = await api.getMembers();
        setMembers(data);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des membres..." />;
  }

  return <MembersTable members={members} />;
}
```

### 9. Dans un Modal

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Suppression en cours</Modal.Header>
  <Modal.Body>
    <LoadingSpinner text="Suppression du membre..." />
  </Modal.Body>
</Modal>
```

### 10. Spinner Centré dans un Conteneur

```tsx
<div className="h-64 flex items-center justify-center">
  <LoadingSpinner text="Chargement du graphique..." />
</div>
```

## 🎨 Personnalisation

### Override du Padding

```tsx
{/* Sans padding */}
<LoadingSpinner className="py-0" />

{/* Padding personnalisé */}
<LoadingSpinner className="py-6" />

{/* Padding horizontal différent */}
<LoadingSpinner className="py-12 px-4" />
```

### Override de la Couleur (Non Recommandé)

```tsx
{/* Utiliser la couleur par défaut (bleu) */}
<LoadingSpinner />

{/* Si vraiment nécessaire, override via className */}
<LoadingSpinner className="[&>svg]:text-green-600" />
```

⚠️ **Note :** Il est recommandé de garder la couleur par défaut pour la cohérence visuelle.

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours fournir un contexte**
   ```tsx
   // ✅ Bon - L'utilisateur sait ce qui charge
   <LoadingSpinner text="Chargement des cours..." />
   
   // ❌ Moins bon - Pas de contexte
   <LoadingSpinner />
   ```

2. **Utiliser la bonne taille**
   ```tsx
   // ✅ Bon - Spinner inline petit
   <button>
     <LoadingSpinner size="sm" className="py-0" />
   </button>
   
   // ✅ Bon - Spinner de page grand
   <LoadingSpinner size="lg" text="Chargement..." />
   ```

3. **Centrer pour les chargements principaux**
   ```tsx
   // ✅ Bon - Spinner centré verticalement
   <div className="min-h-[400px] flex items-center justify-center">
     <LoadingSpinner />
   </div>
   ```

4. **Désactiver le padding pour inline**
   ```tsx
   // ✅ Bon - Pas de padding vertical
   <div className="flex items-center gap-2">
     <LoadingSpinner size="sm" className="py-0" />
     <span>Traitement...</span>
   </div>
   ```

### ❌ À ÉVITER

1. **Ne pas utiliser plusieurs spinners simultanément**
   ```tsx
   // ❌ Mauvais - Confus pour l'utilisateur
   <div>
     <LoadingSpinner text="Chargement A..." />
     <LoadingSpinner text="Chargement B..." />
   </div>
   
   // ✅ Bon - Un seul message
   <LoadingSpinner text="Chargement en cours..." />
   ```

2. **Ne pas créer de spinners custom**
   ```tsx
   // ❌ Mauvais - Crée de la duplication
   <div className="animate-spin h-5 w-5">...</div>
   
   // ✅ Bon - Utiliser le composant
   <LoadingSpinner />
   ```

3. **Ne pas oublier l'accessibilité**
   ```tsx
   // ✅ Bon - Le composant gère déjà l'accessibilité
   <LoadingSpinner text="Chargement..." />
   
   // Les attributs role="status" et aria-live="polite" sont automatiques
   ```

## ♿ Accessibilité

Le composant LoadingSpinner est conçu pour être accessible :

### Attributs ARIA

- **`role="status"`** - Indique qu'il s'agit d'un statut dynamique
- **`aria-live="polite"`** - Annonce le changement aux lecteurs d'écran
- **`aria-hidden="true"`** sur le SVG - Cache l'icône des lecteurs d'écran
- **`.sr-only`** - Texte caché visuellement mais lu par les lecteurs d'écran

### Texte pour les Lecteurs d'Écran

```tsx
{/* Si un texte est fourni, il est lu */}
<LoadingSpinner text="Chargement des données..." />

{/* Sinon, texte par défaut */}
<LoadingSpinner />
{/* Annonce : "Chargement en cours..." */}
```

### Bonnes Pratiques d'Accessibilité

1. **Toujours fournir un texte descriptif**
   ```tsx
   // ✅ Bon
   <LoadingSpinner text="Chargement de la liste des membres..." />
   ```

2. **Annoncer les changements d'état**
   ```tsx
   {loading && <LoadingSpinner text="Chargement..." />}
   {!loading && <div role="status">Chargement terminé</div>}
   ```

3. **Ne pas bloquer la navigation au clavier**
   ```tsx
   // Le spinner n'empêche pas l'utilisation du clavier
   <LoadingSpinner />
   ```

## 🎨 Design Tokens Utilisés

- **Couleur du spinner :** `text-blue-600` (COLORS.primary.600)
- **Couleur du texte :** `text-gray-500` (COLORS.gray.500)
- **Animation :** `animate-spin` (Tailwind built-in)
- **Padding vertical :** `py-12` (SPACING.3xl = 48px)
- **Gap :** `gap-3` (SPACING.md = 12px)
- **Taille du texte :** `text-sm` (14px)

### Tailles des Spinners

| Size | Classes | Dimensions | Utilisation |
|------|---------|------------|-------------|
| `sm` | `h-4 w-4` | 16px × 16px | Inline, boutons |
| `md` | `h-5 w-5` | 20px × 20px | Standard, cards |
| `lg` | `h-8 w-8` | 32px × 32px | Pages, modals |

## 🔄 Migration depuis l'Ancien Code

### Avant (Code Dupliqué)

```tsx
<div className="flex justify-center items-center py-12">
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
</div>
```

### Après (Composant Réutilisable)

```tsx
<LoadingSpinner />
```

### Avantages

- ✅ **-250 lignes de code** dupliqué supprimées
- ✅ **Cohérence visuelle** garantie
- ✅ **Accessibilité** intégrée
- ✅ **Maintenance** simplifiée (un seul endroit à modifier)
- ✅ **Typage TypeScript** complet

## 📊 Statistiques

- **Utilisé dans :** 7/9 pages du projet
- **Code dupliqué éliminé :** ~250 lignes
- **Taille du composant :** ~100 lignes (incluant types et docs)
- **Impact :** Réduction de 60% du code de spinner

## 📚 Voir Aussi

- [Design Tokens](../styles/designTokens.ts) - Tokens de design complets
- [Card Component](./Card.md) - Composant carte
- [Button Component](./Button.md) - Composant bouton
- [Modal Component](./Modal.md) - Composant modal
- [Audit de Style](../../../docs/AUDIT_STYLE.md) - Rapport d'audit complet

## 🐛 Troubleshooting

### Le spinner ne tourne pas
Vérifiez que Tailwind CSS est bien configuré et que `animate-spin` est disponible.

### Le texte n'apparaît pas
Assurez-vous de passer la prop `text` :
```tsx
<LoadingSpinner text="Mon texte" />
```

### Le spinner prend trop de place verticalement
Désactivez le padding par défaut :
```tsx
<LoadingSpinner className="py-0" />
```

### Le spinner n'est pas centré
Utilisez les classes Flexbox sur le conteneur parent :
```tsx
<div className="flex items-center justify-center">
  <LoadingSpinner />
</div>
```

## 📝 Notes de Version

- **v1.0.0** - Version initiale
  - 3 tailles (sm, md, lg)
  - Texte optionnel
  - Accessibilité complète (ARIA, screen readers)
  - Basé sur l'audit de style (7/9 pages)
  - Élimination de ~250 lignes de code dupliqué