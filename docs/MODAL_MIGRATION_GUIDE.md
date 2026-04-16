# Guide de Migration des Modals vers Modal Partagé

Ce guide explique comment migrer un modal custom vers le composant Modal partagé de ClubManager V3.

---

## 📖 Table des matières

- [Pourquoi migrer ?](#pourquoi-migrer-)
- [Imports nécessaires](#imports-nécessaires)
- [Étapes de migration](#étapes-de-migration)
- [Exemple complet](#exemple-complet)
- [Patterns communs](#patterns-communs)
- [Pièges à éviter](#pièges-à-éviter)
- [Référence API](#référence-api)

---

## Pourquoi migrer ?

Le composant Modal partagé offre :
- ✅ Gestion automatique du scroll lock
- ✅ Fermeture sur ESC (configurable)
- ✅ Fermeture sur clic overlay (configurable)
- ✅ Focus trap automatique
- ✅ Accessibilité (ARIA)
- ✅ Tokens de design standardisés
- ✅ Animations uniformes
- ✅ Moins de code à maintenir

---

## Imports nécessaires

```typescript
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";
```

---

## Étapes de migration

### 1️⃣ Identifier le code à supprimer

Supprimez ces patterns car ils sont gérés par Modal :

```typescript
// ❌ À SUPPRIMER
useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose]);

// ❌ À SUPPRIMER
useEffect(() => {
  document.body.style.overflow = isOpen ? "hidden" : "";
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);

// ❌ À SUPPRIMER
if (!isOpen) return null;
```

### 2️⃣ Remplacer la structure custom

**AVANT :**
```typescript
return (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Contenu */}
    </div>
  </div>
);
```

**APRÈS :**
```typescript
return (
  <Modal isOpen={isOpen} onClose={onClose} size="md">
    <Modal.Header title="Mon titre" showCloseButton onClose={onClose} />
    <Modal.Body>
      {/* Contenu */}
    </Modal.Body>
    <Modal.Footer>
      {/* Boutons */}
    </Modal.Footer>
  </Modal>
);
```

### 3️⃣ Migrer le header

**AVANT :**
```typescript
<div className="px-6 pt-6 pb-4 border-b border-gray-100">
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-semibold text-gray-900">
      Mon titre
    </h2>
    <button onClick={onClose} className="...">
      <svg>...</svg>
    </button>
  </div>
  <p className="mt-1 text-sm text-gray-500">Description</p>
</div>
```

**APRÈS :**
```typescript
<Modal.Header
  title="Mon titre"
  subtitle="Description"
  showCloseButton
  onClose={onClose}
/>
```

### 4️⃣ Migrer le body

**AVANT :**
```typescript
<div className="px-6 py-5">
  {/* Contenu */}
</div>
```

**APRÈS :**
```typescript
<Modal.Body>
  {/* Contenu */}
</Modal.Body>

// Ou sans padding :
<Modal.Body padding="px-0 py-0">
  {/* Contenu */}
</Modal.Body>
```

### 5️⃣ Migrer le footer

**AVANT :**
```typescript
<div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
  <button className="px-4 py-2 bg-gray-100 ...">Annuler</button>
  <button className="px-4 py-2 bg-blue-600 ...">Confirmer</button>
</div>
```

**APRÈS :**
```typescript
<Modal.Footer>
  <button
    type="button"
    onClick={onClose}
    className={cn(BUTTON.base, BUTTON.variant.secondary, BUTTON.size.md)}
  >
    Annuler
  </button>
  <button
    type="submit"
    form="my-form-id"
    className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
  >
    Confirmer
  </button>
</Modal.Footer>
```

### 6️⃣ Gérer la désactivation de fermeture

Si vous voulez bloquer la fermeture pendant un chargement :

```typescript
const handleClose = () => {
  if (!isSubmitting) {
    onClose();
  }
};

return (
  <Modal
    isOpen={isOpen}
    onClose={handleClose}
    closeOnOverlayClick={!isSubmitting}
    closeOnEscape={!isSubmitting}
  >
    {/* ... */}
  </Modal>
);
```

---

## Exemple complet

### Avant migration

```typescript
export const MyModal: React.FC<MyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { handleSubmit, register, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Mon formulaire</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
          <input {...register("name")} />
        </form>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose}>Annuler</button>
          <button type="submit">Valider</button>
        </div>
      </div>
    </div>
  );
};
```

### Après migration

```typescript
import { Modal } from "@/shared/components/Modal/Modal";
import { BUTTON, cn } from "@/shared/styles/designTokens";

export const MyModal: React.FC<MyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { handleSubmit, register, formState: { isSubmitting } } = useForm();

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header
        title="Mon formulaire"
        showCloseButton
        onClose={handleClose}
      />

      <Modal.Body>
        <form id="my-form" onSubmit={handleSubmit(onSubmit)}>
          <input {...register("name")} />
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.secondary, BUTTON.size.md)}
        >
          Annuler
        </button>
        <button
          type="submit"
          form="my-form"
          disabled={isSubmitting}
          className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
        >
          Valider
        </button>
      </Modal.Footer>
    </Modal>
  );
};
```

**Résultat :** -40 lignes, même fonctionnalité ! 🎉

---

## Patterns communs

### 1. Formulaire avec soumission

```typescript
<Modal.Body>
  <form id="my-form" onSubmit={handleSubmit(onFormSubmit)}>
    {/* Champs */}
  </form>
</Modal.Body>

<Modal.Footer>
  <button type="button" onClick={onClose} className={...}>Annuler</button>
  <button type="submit" form="my-form" className={...}>Enregistrer</button>
</Modal.Footer>
```

### 2. Modal avec contenu scrollable

```typescript
<Modal size="lg">
  <Modal.Header title="Long contenu" />
  <Modal.Body>
    {/* Le body scrolle automatiquement si contenu dépasse */}
    <div className="space-y-4">
      {longContent.map(item => <div key={item.id}>{item.content}</div>)}
    </div>
  </Modal.Body>
  <Modal.Footer>{/* ... */}</Modal.Footer>
</Modal>
```

### 3. Modal sans padding (pour images ou tableaux)

```typescript
<Modal.Body padding="px-0 py-0">
  <img src={imageUrl} className="w-full" />
  <div className="px-6 py-4">
    {/* Contenu avec padding personnalisé */}
  </div>
</Modal.Body>
```

### 4. Footer avec alignement personnalisé

```typescript
<Modal.Footer align="between">
  <span className="text-sm text-gray-500">Total: 100€</span>
  <div className="flex gap-3">
    <button className={...}>Annuler</button>
    <button className={...}>Valider</button>
  </div>
</Modal.Footer>
```

### 5. Footer avec fond coloré

```typescript
<Modal.Footer className="bg-gray-50">
  {/* Boutons */}
</Modal.Footer>
```

---

## Pièges à éviter

### ❌ Ne pas oublier l'ID du formulaire

**Mauvais :**
```typescript
<Modal.Body>
  <form onSubmit={handleSubmit}>{/* ... */}</form>
</Modal.Body>
<Modal.Footer>
  <button type="submit">Enregistrer</button> {/* Ne fonctionnera pas ! */}
</Modal.Footer>
```

**Bon :**
```typescript
<Modal.Body>
  <form id="my-form" onSubmit={handleSubmit}>{/* ... */}</form>
</Modal.Body>
<Modal.Footer>
  <button type="submit" form="my-form">Enregistrer</button>
</Modal.Footer>
```

### ❌ Ne pas utiliser cn() incorrectement

**Mauvais :**
```typescript
className={BUTTON.base + " " + BUTTON.variant.primary}
```

**Bon :**
```typescript
className={cn(BUTTON.base, BUTTON.variant.primary, BUTTON.size.md)}
```

### ❌ Ne pas oublier closeOnEscape/closeOnOverlayClick

Si vous avez un état de chargement, pensez à désactiver la fermeture :

```typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  closeOnOverlayClick={!isSubmitting}  // ✅
  closeOnEscape={!isSubmitting}        // ✅
>
```

---

## Référence API

### Modal (composant principal)

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `isOpen` | `boolean` | - | **Requis.** Contrôle la visibilité |
| `onClose` | `() => void` | - | **Requis.** Callback de fermeture |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl"` | `"md"` | Taille de la modal |
| `closeOnOverlayClick` | `boolean` | `true` | Fermer sur clic overlay |
| `closeOnEscape` | `boolean` | `true` | Fermer sur touche ESC |
| `className` | `string` | `""` | Classes CSS additionnelles |

### Modal.Header

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | **Requis.** Titre de la modal |
| `subtitle` | `string` | - | Sous-titre optionnel |
| `showCloseButton` | `boolean` | `true` | Afficher le bouton X |
| `onClose` | `() => void` | - | Callback de fermeture |
| `className` | `string` | `""` | Classes CSS additionnelles |

### Modal.Body

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | **Requis.** Contenu du body |
| `padding` | `string` | `"px-6 py-5"` | Padding personnalisé |
| `className` | `string` | `""` | Classes CSS additionnelles |

### Modal.Footer

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `children` | `ReactNode` | - | **Requis.** Boutons d'action |
| `align` | `"left" \| "center" \| "right" \| "between"` | `"right"` | Alignement des boutons |
| `padding` | `string` | `"px-6 py-4"` | Padding personnalisé |
| `className` | `string` | `""` | Classes CSS additionnelles |

### Tailles de modals

| Taille | Largeur | Usage recommandé |
|--------|---------|------------------|
| `sm` | 384px | Confirmations simples |
| `md` | 512px | Formulaires standards (défaut) |
| `lg` | 640px | Formulaires avec image |
| `xl` | 768px | Listes, édition de contenu |
| `2xl` | 896px | Tableaux, détails complexes |
| `3xl` | 1024px | Dashboards, prévisualisations |
| `4xl` | 1280px | Plein écran, éditeurs |

---

## Checklist de migration

Avant de considérer la migration terminée, vérifiez :

- [ ] Imports corrects (`Modal`, `BUTTON`, `cn`)
- [ ] Structure `<Modal>` / `<Modal.Header>` / `<Modal.Body>` / `<Modal.Footer>`
- [ ] Code ESC/scroll lock supprimé
- [ ] Tokens BUTTON utilisés pour tous les boutons
- [ ] Fonction `cn()` utilisée pour combiner classes
- [ ] Props `closeOnEscape` et `closeOnOverlayClick` gérées si nécessaire
- [ ] Formulaires avec `id` et `form` attribute
- [ ] Logique métier 100% préservée
- [ ] 0 erreur TypeScript
- [ ] Tests manuels réussis

---

## Ressources

- **Composant source :** `frontend/src/shared/components/Modal/Modal.tsx`
- **Design tokens :** `frontend/src/shared/styles/designTokens.ts`
- **Exemples de migration :** `frontend/src/features/store/components/`
  - `StockAdjustModal.tsx`
  - `QuickOrderModal.tsx`
  - `OrderDetailModal.tsx`
  - `CartModal.tsx`

---

**Besoin d'aide ?** Consultez les modals déjà migrés dans le dossier `store/components` pour des exemples concrets ! 🚀