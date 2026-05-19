# Button Component

Composant de bouton réutilisable avec variants, tailles et états configurables pour garantir la cohérence visuelle de l'application.

## 📦 Installation

```tsx
import { Button } from '@/shared/components/Button';
```

## 🎯 Usage de Base

```tsx
<Button>Cliquer ici</Button>
```

## 📋 Props

### Button

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | **Requis.** Contenu du bouton |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'danger' \| 'success' \| 'ghost'` | `'primary'` | Variant de style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Taille du bouton |
| `loading` | `boolean` | `false` | Afficher le spinner de chargement |
| `icon` | `ReactNode` | - | Icône à afficher |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position de l'icône |
| `fullWidth` | `boolean` | `false` | Bouton pleine largeur |
| `iconOnly` | `boolean` | `false` | Bouton icône uniquement (sans texte) |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `disabled` | `boolean` | `false` | Désactiver le bouton |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type HTML du bouton |

**Note:** Le composant étend `ButtonHTMLAttributes<HTMLButtonElement>`, donc toutes les props HTML standard sont disponibles (`onClick`, `onFocus`, etc.).

### Button.Group

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Boutons à grouper |
| `className` | `string` | Classes CSS additionnelles |

## 🎨 Variants

### Primary (Défaut)
Bouton principal pour les actions importantes.

```tsx
<Button variant="primary">
  Enregistrer
</Button>
```

**Cas d'usage:**
- Soumettre un formulaire
- Confirmer une action
- Action principale de la page

**Style:** Fond bleu, texte blanc, shadow

---

### Secondary
Bouton secondaire pour les actions moins importantes.

```tsx
<Button variant="secondary">
  Annuler
</Button>
```

**Cas d'usage:**
- Annuler une action
- Action alternative
- Navigation secondaire

**Style:** Fond gris, texte gris foncé

---

### Outline
Bouton avec bordure colorée, fond transparent.

```tsx
<Button variant="outline">
  Voir les détails
</Button>
```

**Cas d'usage:**
- Actions tertiaires
- Liens d'action
- Alternatives visuelles

**Style:** Bordure bleue, texte bleu, fond blanc

---

### Danger
Bouton pour les actions destructives.

```tsx
<Button variant="danger">
  Supprimer
</Button>
```

**Cas d'usage:**
- Suppression
- Actions irréversibles
- Confirmations critiques

**Style:** Fond rouge, texte blanc, shadow

---

### Success
Bouton pour les actions positives.

```tsx
<Button variant="success">
  Valider
</Button>
```

**Cas d'usage:**
- Validation
- Approbation
- Confirmation positive

**Style:** Fond vert, texte blanc, shadow

---

### Ghost
Bouton minimal sans fond.

```tsx
<Button variant="ghost">
  Fermer
</Button>
```

**Cas d'usage:**
- Actions discrètes
- Menus
- Navigation légère

**Style:** Transparent, texte gris, hover gris clair

---

## 📏 Tailles

### Extra Small (xs)

```tsx
<Button size="xs">Petit</Button>
```

**Padding:** `px-2.5 py-1.5`  
**Text:** `text-xs`  
**Cas d'usage:** Badges cliquables, tags

### Small (sm)

```tsx
<Button size="sm">Small</Button>
```

**Padding:** `px-3 py-1.5`  
**Text:** `text-xs`  
**Cas d'usage:** Actions dans des cartes compactes

### Medium (md) - Défaut

```tsx
<Button size="md">Medium</Button>
```

**Padding:** `px-4 py-2`  
**Text:** `text-sm`  
**Cas d'usage:** Boutons standard

### Large (lg)

```tsx
<Button size="lg">Large</Button>
```

**Padding:** `px-5 py-2.5`  
**Text:** `text-base`  
**Cas d'usage:** Boutons principaux, CTAs

### Extra Large (xl)

```tsx
<Button size="xl">Extra Large</Button>
```

**Padding:** `px-6 py-3`  
**Text:** `text-base`  
**Cas d'usage:** Landing pages, hero sections

---

## 💡 Exemples d'Utilisation

### 1. Bouton Simple

```tsx
<Button variant="primary">
  Enregistrer
</Button>
```

### 2. Bouton avec Loading

```tsx
<Button variant="primary" loading>
  Enregistrement...
</Button>
```

Le bouton est automatiquement désactivé pendant le chargement.

### 3. Bouton avec Icône (Gauche)

```tsx
<Button variant="primary" icon={<PlusIcon className="h-4 w-4" />}>
  Ajouter un membre
</Button>
```

### 4. Bouton avec Icône (Droite)

```tsx
<Button 
  variant="outline" 
  icon={<ArrowRightIcon className="h-4 w-4" />}
  iconPosition="right"
>
  Suivant
</Button>
```

### 5. Bouton Icône Uniquement

```tsx
<Button 
  variant="ghost" 
  icon={<XIcon className="h-5 w-5" />}
  iconOnly
  aria-label="Fermer"
/>
```

**Important:** Toujours ajouter `aria-label` pour l'accessibilité.

### 6. Bouton Désactivé

```tsx
<Button variant="primary" disabled>
  Action impossible
</Button>
```

### 7. Bouton Pleine Largeur

```tsx
<Button variant="primary" fullWidth>
  Continuer
</Button>
```

### 8. Bouton de Suppression avec Confirmation

```tsx
function DeleteButton() {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteItem();
      toast.success('Supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="danger" 
      loading={loading}
      onClick={handleDelete}
      icon={<TrashIcon className="h-4 w-4" />}
    >
      Supprimer
    </Button>
  );
}
```

### 9. Groupe de Boutons

```tsx
<Button.Group>
  <Button variant="outline" size="sm">Gauche</Button>
  <Button variant="outline" size="sm">Centre</Button>
  <Button variant="outline" size="sm">Droite</Button>
</Button.Group>
```

### 10. Footer de Modal

```tsx
<div className="flex items-center justify-end gap-3">
  <Button variant="secondary" onClick={onClose}>
    Annuler
  </Button>
  <Button variant="primary" onClick={onConfirm} loading={saving}>
    Confirmer
  </Button>
</div>
```

### 11. Actions de Formulaire

```tsx
<form onSubmit={handleSubmit}>
  {/* Champs du formulaire */}
  
  <div className="flex items-center justify-end gap-3 mt-6">
    <Button 
      variant="secondary" 
      type="button"
      onClick={() => router.back()}
    >
      Retour
    </Button>
    <Button 
      variant="primary" 
      type="submit"
      loading={isSubmitting}
    >
      Enregistrer
    </Button>
  </div>
</form>
```

### 12. Bouton avec Icône + Loading

```tsx
<Button 
  variant="success" 
  loading={loading}
  icon={<CheckIcon className="h-4 w-4" />}
>
  {loading ? 'Validation...' : 'Valider'}
</Button>
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser le bon variant**
   ```tsx
   // ✅ Bon - Variant approprié
   <Button variant="danger">Supprimer</Button>
   <Button variant="success">Valider</Button>
   <Button variant="secondary">Annuler</Button>
   ```

2. **Ajouter aria-label pour boutons icône**
   ```tsx
   // ✅ Bon - Accessible
   <Button iconOnly icon={<XIcon />} aria-label="Fermer" />
   ```

3. **Utiliser loading pour les actions asynchrones**
   ```tsx
   // ✅ Bon - UX claire
   <Button loading={isSaving}>
     {isSaving ? 'Enregistrement...' : 'Enregistrer'}
   </Button>
   ```

4. **Grouper les boutons liés**
   ```tsx
   // ✅ Bon - Boutons groupés
   <div className="flex items-center gap-3">
     <Button variant="secondary">Annuler</Button>
     <Button variant="primary">Confirmer</Button>
   </div>
   ```

5. **Utiliser type="submit" pour les formulaires**
   ```tsx
   // ✅ Bon
   <Button type="submit" variant="primary">
     Envoyer
   </Button>
   ```

### ❌ À ÉVITER

1. **Ne pas mélanger les tailles sans raison**
   ```tsx
   // ❌ Mauvais - Incohérent
   <Button size="xl">OK</Button>
   <Button size="xs">Annuler</Button>
   
   // ✅ Bon - Cohérent
   <Button size="md">OK</Button>
   <Button size="md">Annuler</Button>
   ```

2. **Ne pas oublier aria-label**
   ```tsx
   // ❌ Mauvais - Non accessible
   <Button iconOnly icon={<XIcon />} />
   
   // ✅ Bon
   <Button iconOnly icon={<XIcon />} aria-label="Fermer" />
   ```

3. **Ne pas désactiver manuellement pendant le loading**
   ```tsx
   // ❌ Mauvais - Redondant
   <Button loading={true} disabled={true}>
   
   // ✅ Bon - Auto-désactivé
   <Button loading={true}>
   ```

4. **Ne pas utiliser plusieurs variants primaires**
   ```tsx
   // ❌ Mauvais - Trop de boutons primaires
   <Button variant="primary">Action 1</Button>
   <Button variant="primary">Action 2</Button>
   
   // ✅ Bon - Hiérarchie claire
   <Button variant="primary">Action Principale</Button>
   <Button variant="secondary">Action Secondaire</Button>
   ```

5. **Ne pas recréer les styles manuellement**
   ```tsx
   // ❌ Mauvais
   <button className="px-4 py-2 text-white bg-blue-600...">
   
   // ✅ Bon
   <Button variant="primary">
   ```

---

## 🔄 Migration depuis l'Ancien Code

### Avant

```tsx
<button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
  Enregistrer
</button>
```

### Après

```tsx
<Button variant="primary">
  Enregistrer
</Button>
```

---

### Avant (avec icône)

```tsx
<button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
  <PlusIcon className="h-4 w-4" />
  Ajouter
</button>
```

### Après

```tsx
<Button variant="primary" icon={<PlusIcon className="h-4 w-4" />}>
  Ajouter
</Button>
```

---

### Avant (loading)

```tsx
<button disabled={loading} className="...">
  {loading ? (
    <>
      <svg className="animate-spin h-4 w-4 mr-2">...</svg>
      Chargement...
    </>
  ) : (
    'Enregistrer'
  )}
</button>
```

### Après

```tsx
<Button variant="primary" loading={loading}>
  {loading ? 'Chargement...' : 'Enregistrer'}
</Button>
```

---

## 🎨 Design Tokens Utilisés

- **Base:** `inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`
- **Disabled:** `opacity-40 cursor-not-allowed`
- **Primary:** `text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 shadow-sm`
- **Secondary:** `text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500`
- **Danger:** `text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm`

---

## 🎭 États du Composant

| État | Comportement |
|------|--------------|
| **Normal** | Couleurs normales, hover actif, cliquable |
| **Hover** | Couleur plus foncée, cursor pointer |
| **Focus** | Ring bleu (ou couleur variant), outline none |
| **Disabled** | Opacité 40%, cursor not-allowed, pas d'interaction |
| **Loading** | Spinner visible, auto-désactivé, pas cliquable |
| **Active (pressed)** | Légèrement plus foncé (natif navigateur) |

---

## ♿ Accessibilité

### Boutons Standard

```tsx
<Button variant="primary">
  Texte descriptif de l'action
</Button>
```

Le texte est suffisant pour l'accessibilité.

### Boutons Icône Uniquement

```tsx
<Button 
  iconOnly 
  icon={<XIcon />} 
  aria-label="Fermer la fenêtre"
/>
```

**Requis:** `aria-label` décrivant l'action.

### Boutons avec Loading

```tsx
<Button loading={true}>
  Enregistrement en cours...
</Button>
```

Le texte doit indiquer l'état de chargement.

### Navigation Clavier

- **Tab:** Focus le bouton
- **Enter/Space:** Déclenche l'action
- **Shift+Tab:** Focus précédent

Tous les états sont gérés nativement par `<button>`.

---

## 🐛 Troubleshooting

### Le bouton n'est pas cliquable

**Cause:** `disabled` ou `loading` à `true`

**Solution:**
```tsx
// Vérifier les props
<Button loading={false} disabled={false}>
```

### L'icône ne s'affiche pas

**Cause:** L'icône n'est pas un composant React valide

**Solution:**
```tsx
// ✅ Bon
<Button icon={<PlusIcon className="h-4 w-4" />}>

// ❌ Mauvais
<Button icon="plus">
```

### Le spinner ne s'affiche pas

**Cause:** `loading` est `false` ou bouton `iconOnly` sans `loading`

**Solution:**
```tsx
<Button loading={true}>Texte</Button>
```

### Le bouton est trop petit/grand

**Cause:** Mauvaise taille ou padding personnalisé

**Solution:**
```tsx
// Utiliser les tailles prédéfinies
<Button size="lg">Grande action</Button>
```

---

## 📚 Voir Aussi

- [Design Tokens](../styles/designTokens.ts) - Tokens de design complets
- [Card Component](./Card.md) - Composant carte
- [Badge Component](./Badge.md) - Composant badge
- [Input Component](./Input.md) - Composant input
- [Audit de Style](../../../docs/AUDIT_STYLE.md) - Rapport d'audit complet

---

## 📝 Notes de Version

- **v1.0.0** - Version initiale avec 6 variants et 5 tailles
- Support loading state avec spinner
- Support icône (gauche/droite)
- Support bouton icône uniquement
- Accessibilité complète
- Basé sur l'audit de style (Note: 7.2/10 → 9/10)