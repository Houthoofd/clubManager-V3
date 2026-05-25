# Badge Component

Composant de badge réutilisable avec variants, tailles et options configurables pour garantir la cohérence visuelle de l'application.

## 📦 Installation

```tsx
import { Badge } from '@/shared/components/Badge';
```

## 🎯 Usage de Base

```tsx
<Badge variant="success">Validé</Badge>
```

## 📋 Props

### Badge

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | **Requis.** Contenu du badge |
| `variant` | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral' \| 'purple' \| 'orange'` | `'neutral'` | Variant de couleur |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du badge |
| `dot` | `boolean` | `false` | Afficher un dot indicator (●) |
| `icon` | `ReactNode` | - | Icône à afficher |
| `removable` | `boolean` | `false` | Bouton X pour supprimer |
| `onRemove` | `() => void` | - | Callback suppression |
| `className` | `string` | `''` | Classes CSS additionnelles |

**Note:** Le composant étend `HTMLAttributes<HTMLSpanElement>`, donc toutes les props HTML standard sont disponibles.

### Badge.Status

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'active' \| 'inactive' \| 'pending' \| 'error'` | Statut générique |
| `children` | `ReactNode` | Label personnalisé (optionnel) |

### Badge.Stock

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `quantity` | `number` | - | **Requis.** Quantité en stock |
| `threshold` | `number` | `10` | Seuil d'alerte stock bas |
| `children` | `ReactNode` | - | Label personnalisé (optionnel) |

### Badge.Role

| Prop | Type | Description |
|------|------|-------------|
| `role` | `'admin' \| 'professeur' \| 'parent' \| 'eleve'` | Rôle utilisateur |
| `children` | `ReactNode` | Label personnalisé (optionnel) |

### Badge.PaymentStatus

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'paid' \| 'pending' \| 'failed' \| 'refunded'` | Statut paiement |
| `children` | `ReactNode` | Label personnalisé (optionnel) |

### Badge.OrderStatus

| Prop | Type | Description |
|------|------|-------------|
| `status` | `'pending' \| 'processing' \| 'shipped' \| 'delivered' \| 'cancelled'` | Statut commande |
| `children` | `ReactNode` | Label personnalisé (optionnel) |

## 🎨 Variants

### Success (Vert)
Badge pour les statuts positifs.

```tsx
<Badge variant="success">Validé</Badge>
```

**Cas d'usage:**
- Statut validé, approuvé
- Utilisateur actif
- En stock
- Paiement réussi

**Style:** Fond vert-100, texte vert-800, bordure vert-200

---

### Warning (Jaune)
Badge pour les avertissements.

```tsx
<Badge variant="warning">En attente</Badge>
```

**Cas d'usage:**
- En attente de validation
- Stock bas
- Action requise
- Email non vérifié

**Style:** Fond jaune-100, texte jaune-800, bordure jaune-200

---

### Danger (Rouge)
Badge pour les erreurs et annulations.

```tsx
<Badge variant="danger">Erreur</Badge>
```

**Cas d'usage:**
- Erreur, échec
- Annulé, rejeté
- Rupture de stock
- Paiement échoué

**Style:** Fond rouge-100, texte rouge-800, bordure rouge-200

---

### Info (Bleu)
Badge pour les informations.

```tsx
<Badge variant="info">En cours</Badge>
```

**Cas d'usage:**
- Information générale
- En cours de traitement
- Statut neutre informatif

**Style:** Fond bleu-100, texte bleu-800, bordure bleu-200

---

### Neutral (Gris)
Badge neutre par défaut.

```tsx
<Badge variant="neutral">Brouillon</Badge>
```

**Cas d'usage:**
- Statut par défaut
- Inactif
- Autre
- Non défini

**Style:** Fond gris-100, texte gris-700, bordure gris-200

---

### Purple (Violet)
Badge pour les actions spéciales.

```tsx
<Badge variant="purple">Remboursé</Badge>
```

**Cas d'usage:**
- Actions spéciales
- Remboursement
- Expédition
- Rôle professeur

**Style:** Fond violet-100, texte violet-800, bordure violet-200

---

### Orange (Orange)
Badge pour les urgences et alertes.

```tsx
<Badge variant="orange">Stock bas</Badge>
```

**Cas d'usage:**
- Urgent
- Stock critique
- Attention requise

**Style:** Fond orange-100, texte orange-800, bordure orange-200

---

## 📏 Tailles

### Small (sm)

```tsx
<Badge size="sm">Petit</Badge>
```

**Padding:** `px-2 py-0.5`  
**Text:** `text-xs`  
**Cas d'usage:** Badges compacts, tags

### Medium (md) - Défaut

```tsx
<Badge size="md">Medium</Badge>
```

**Padding:** `px-2.5 py-0.5`  
**Text:** `text-xs`  
**Cas d'usage:** Badge standard

### Large (lg)

```tsx
<Badge size="lg">Large</Badge>
```

**Padding:** `px-3 py-1`  
**Text:** `text-sm`  
**Cas d'usage:** Badges importants, en-têtes

---

## 💡 Exemples d'Utilisation

### 1. Badge Simple

```tsx
<Badge variant="success">Actif</Badge>
```

### 2. Badge avec Dot Indicator

```tsx
<Badge variant="success" dot>
  En ligne
</Badge>
```

Le dot indicator (●) ajoute un point coloré avant le texte.

### 3. Badge avec Icône

```tsx
<Badge variant="info" icon={<CheckIcon className="h-3.5 w-3.5" />}>
  Vérifié
</Badge>
```

### 4. Badge Supprimable (Tag)

```tsx
function TagExample() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind']);

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="info"
          removable
          onRemove={() => removeTag(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
```

### 5. Badge de Statut Générique

```tsx
<Badge.Status status="active" />
<Badge.Status status="inactive" />
<Badge.Status status="pending" />
<Badge.Status status="error" />
```

Avec labels personnalisés :

```tsx
<Badge.Status status="active">En ligne</Badge.Status>
<Badge.Status status="pending">En révision</Badge.Status>
```

### 6. Badge de Stock

```tsx
// Stock normal (> 10)
<Badge.Stock quantity={50} />  // "50 en stock" (vert)

// Stock bas (<= 10)
<Badge.Stock quantity={5} />   // "Stock bas (5)" (orange)

// Rupture de stock
<Badge.Stock quantity={0} />   // "Rupture de stock" (rouge)

// Seuil personnalisé
<Badge.Stock quantity={15} threshold={20} />  // Stock bas à partir de 20
```

### 7. Badge de Rôle

```tsx
<Badge.Role role="admin" />         // "Admin" (rouge)
<Badge.Role role="professeur" />    // "Professeur" (violet)
<Badge.Role role="parent" />        // "Parent" (bleu)
<Badge.Role role="eleve" />         // "Élève" (vert)
```

Avec labels personnalisés :

```tsx
<Badge.Role role="admin">Administrateur</Badge.Role>
<Badge.Role role="professeur">Prof. de Piano</Badge.Role>
```

### 8. Badge de Statut de Paiement

```tsx
<Badge.PaymentStatus status="paid" />      // "Payé" (vert)
<Badge.PaymentStatus status="pending" />   // "En attente" (jaune)
<Badge.PaymentStatus status="failed" />    // "Échoué" (rouge)
<Badge.PaymentStatus status="refunded" />  // "Remboursé" (violet)
```

### 9. Badge de Statut de Commande

```tsx
<Badge.OrderStatus status="pending" />     // "En attente" (jaune)
<Badge.OrderStatus status="processing" />  // "En préparation" (bleu)
<Badge.OrderStatus status="shipped" />     // "Expédiée" (violet)
<Badge.OrderStatus status="delivered" />   // "Livrée" (vert)
<Badge.OrderStatus status="cancelled" />   // "Annulée" (rouge)
```

### 10. Liste de Membres avec Badges

```tsx
function MemberList() {
  const members = [
    { name: 'Jean Dupont', role: 'admin', status: 'active' },
    { name: 'Marie Martin', role: 'professeur', status: 'active' },
    { name: 'Paul Durand', role: 'parent', status: 'inactive' },
  ];

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.name} className="flex items-center gap-2">
          <span className="text-sm font-medium">{member.name}</span>
          <Badge.Role role={member.role} size="sm" />
          <Badge.Status status={member.status} size="sm" />
        </div>
      ))}
    </div>
  );
}
```

### 11. Grille de Produits avec Stock

```tsx
function ProductGrid() {
  const products = [
    { name: 'Piano', quantity: 25 },
    { name: 'Guitare', quantity: 3 },
    { name: 'Violon', quantity: 0 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.name} className="p-4 bg-white rounded-lg">
          <h3>{product.name}</h3>
          <Badge.Stock quantity={product.quantity} />
        </div>
      ))}
    </div>
  );
}
```

### 12. Filtres avec Badges Supprimables

```tsx
function FilterTags() {
  const [filters, setFilters] = useState(['Actif', 'Professeur', 'Paris']);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Filtres actifs:</span>
      {filters.map((filter) => (
        <Badge
          key={filter}
          variant="info"
          size="sm"
          removable
          onRemove={() => setFilters(filters.filter(f => f !== filter))}
        >
          {filter}
        </Badge>
      ))}
    </div>
  );
}
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser le bon variant pour la sémantique**
   ```tsx
   // ✅ Bon - Cohérent avec la signification
   <Badge variant="success">Validé</Badge>
   <Badge variant="danger">Annulé</Badge>
   <Badge variant="warning">En attente</Badge>
   ```

2. **Utiliser les sous-composants spécialisés**
   ```tsx
   // ✅ Bon - Plus maintenable
   <Badge.PaymentStatus status="paid" />
   
   // ❌ Moins bon - Répétition de logique
   <Badge variant="success">Payé</Badge>
   ```

3. **Ajouter des dots pour les statuts en temps réel**
   ```tsx
   // ✅ Bon - Le dot indique un statut actif
   <Badge variant="success" dot>En ligne</Badge>
   <Badge variant="danger" dot>Hors ligne</Badge>
   ```

4. **Grouper les badges liés**
   ```tsx
   // ✅ Bon - Badges regroupés
   <div className="flex items-center gap-2">
     <Badge.Role role="professeur" size="sm" />
     <Badge.Status status="active" size="sm" />
   </div>
   ```

5. **Utiliser removable pour les tags/filtres**
   ```tsx
   // ✅ Bon - Tags supprimables
   <Badge variant="info" removable onRemove={handleRemove}>
     JavaScript
   </Badge>
   ```

### ❌ À ÉVITER

1. **Ne pas mélanger les couleurs sans raison**
   ```tsx
   // ❌ Mauvais - Incohérent
   <Badge variant="danger">Actif</Badge>  // Rouge pour "actif" ?
   
   // ✅ Bon
   <Badge variant="success">Actif</Badge>
   ```

2. **Ne pas utiliser trop de badges différents**
   ```tsx
   // ❌ Mauvais - Trop de variants
   <Badge variant="success">A</Badge>
   <Badge variant="warning">B</Badge>
   <Badge variant="danger">C</Badge>
   <Badge variant="info">D</Badge>
   <Badge variant="purple">E</Badge>
   
   // ✅ Bon - Cohérent
   <Badge variant="info">A</Badge>
   <Badge variant="info">B</Badge>
   <Badge variant="info">C</Badge>
   ```

3. **Ne pas recréer les styles manuellement**
   ```tsx
   // ❌ Mauvais
   <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100...">
   
   // ✅ Bon
   <Badge variant="success">
   ```

4. **Ne pas oublier onRemove si removable**
   ```tsx
   // ❌ Mauvais - Removable sans callback
   <Badge removable>Tag</Badge>
   
   // ✅ Bon
   <Badge removable onRemove={handleRemove}>Tag</Badge>
   ```

---

## 🔄 Migration depuis l'Ancien Code

### Avant

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200">
  Validé
</span>
```

### Après

```tsx
<Badge variant="success">
  Validé
</Badge>
```

---

### Avant (avec dot)

```tsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200">
  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
  En ligne
</span>
```

### Après

```tsx
<Badge variant="success" dot>
  En ligne
</Badge>
```

---

### Avant (PaymentStatusBadge custom)

```tsx
function PaymentStatusBadge({ status }: { status: string }) {
  let colorClass = '';
  let label = '';
  
  if (status === 'valide') {
    colorClass = 'bg-green-100 text-green-800 ring-green-200';
    label = 'Payé';
  } else if (status === 'en_attente') {
    colorClass = 'bg-yellow-100 text-yellow-800 ring-yellow-200';
    label = 'En attente';
  }
  // ...
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${colorClass}`}>
      {label}
    </span>
  );
}
```

### Après

```tsx
<Badge.PaymentStatus status="paid" />
```

---

## 🎨 Design Tokens Utilisés

- **Base:** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1`
- **Success:** `bg-green-100 text-green-800 ring-green-200`
- **Warning:** `bg-yellow-100 text-yellow-800 ring-yellow-200`
- **Danger:** `bg-red-100 text-red-800 ring-red-200`
- **Info:** `bg-blue-100 text-blue-800 ring-blue-200`
- **Neutral:** `bg-gray-100 text-gray-700 ring-gray-200`
- **Purple:** `bg-purple-100 text-purple-800 ring-purple-200`
- **Orange:** `bg-orange-100 text-orange-800 ring-orange-200`

---

## 📊 Mapping Sémantique

### Recommandations d'usage par contexte

| Contexte | Valeur | Variant | Exemple |
|----------|--------|---------|---------|
| **Utilisateur** | Actif | `success` | <Badge variant="success">Actif</Badge> |
| **Utilisateur** | Inactif | `neutral` | <Badge variant="neutral">Inactif</Badge> |
| **Paiement** | Payé | `success` | <Badge variant="success">Payé</Badge> |
| **Paiement** | En attente | `warning` | <Badge variant="warning">En attente</Badge> |
| **Paiement** | Échoué | `danger` | <Badge variant="danger">Échoué</Badge> |
| **Paiement** | Remboursé | `purple` | <Badge variant="purple">Remboursé</Badge> |
| **Stock** | Disponible | `success` | <Badge variant="success">En stock</Badge> |
| **Stock** | Bas | `orange` | <Badge variant="orange">Stock bas</Badge> |
| **Stock** | Rupture | `danger` | <Badge variant="danger">Rupture</Badge> |
| **Commande** | En préparation | `info` | <Badge variant="info">En cours</Badge> |
| **Commande** | Expédiée | `purple` | <Badge variant="purple">Expédiée</Badge> |
| **Commande** | Livrée | `success` | <Badge variant="success">Livrée</Badge> |
| **Commande** | Annulée | `danger` | <Badge variant="danger">Annulée</Badge> |

---

## ♿ Accessibilité

### Badge Standard

```tsx
<Badge variant="success">Validé</Badge>
```

Le texte est suffisant pour l'accessibilité.

### Badge avec Icône

```tsx
<Badge variant="info" icon={<CheckIcon />}>
  Vérifié
</Badge>
```

L'icône a `aria-hidden="true"` car le texte est descriptif.

### Badge Removable

```tsx
<Badge removable onRemove={handleRemove}>
  Tag
</Badge>
```

Le bouton X a automatiquement `aria-label="Supprimer"`.

### Badge avec Dot

```tsx
<Badge variant="success" dot>
  En ligne
</Badge>
```

Le dot a `aria-hidden="true"` car c'est purement décoratif.

---

## 🐛 Troubleshooting

### Le badge est trop grand/petit

**Solution:** Utiliser la prop `size`

```tsx
<Badge size="sm">Petit</Badge>
<Badge size="md">Moyen</Badge>
<Badge size="lg">Grand</Badge>
```

### La couleur ne correspond pas au statut

**Solution:** Vérifier le variant utilisé

```tsx
// ❌ Incohérent
<Badge variant="danger">Actif</Badge>

// ✅ Cohérent
<Badge variant="success">Actif</Badge>
```

### Le dot ne s'affiche pas

**Solution:** Vérifier que `dot={true}`

```tsx
<Badge variant="success" dot>En ligne</Badge>
```

### Le bouton X ne fonctionne pas

**Solution:** Ajouter le callback `onRemove`

```tsx
<Badge removable onRemove={() => console.log('Removed')}>
  Tag
</Badge>
```

---

## 📚 Voir Aussi

- [Design Tokens](../styles/designTokens.ts) - Tokens de design complets
- [Button Component](./Button.md) - Composant bouton
- [Card Component](./Card.md) - Composant carte
- [Audit de Style](../../../docs/AUDIT_STYLE.md) - Rapport d'audit complet

---

## 📝 Notes de Version

- **v1.0.0** - Version initiale
- 7 variants de couleur
- 3 tailles
- Support dot, icon, removable
- 5 sous-composants spécialisés (Status, Stock, Role, PaymentStatus, OrderStatus)
- Accessibilité complète
- Basé sur l'audit de style (Note: 7.2/10 → 9/10)
- Remplace 6 composants de badges existants