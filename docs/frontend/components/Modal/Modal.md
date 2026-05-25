# Modal Component

Composant modal réutilisable avec overlay, header, body et footer. Supporte plusieurs tailles, la fermeture automatique (ESC, overlay click), le focus trap et toutes les bonnes pratiques d'accessibilité.

## 📋 Table des matières

- [Installation](#installation)
- [Import](#import)
- [Props](#props)
- [Tailles](#tailles)
- [Exemples](#exemples)
- [Bonnes pratiques](#bonnes-pratiques)
- [Accessibilité](#accessibilité)
- [Migration](#migration)

---

## Installation

Le composant est déjà disponible dans `frontend/src/shared/components/Modal.tsx`.

---

## Import

```tsx
import { Modal } from '@/shared/components/Modal';
```

---

## Props

### Modal (composant principal)

| Prop                    | Type                                        | Défaut  | Description                                           |
| ----------------------- | ------------------------------------------- | ------- | ----------------------------------------------------- |
| `isOpen`                | `boolean`                                   | -       | **Requis.** Contrôle la visibilité de la modal       |
| `onClose`               | `() => void`                                | -       | **Requis.** Callback appelé lors de la fermeture     |
| `size`                  | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'` | `'md'` | Taille de la modal |
| `closeOnOverlayClick`   | `boolean`                                   | `true`  | Ferme la modal au clic sur l'overlay                  |
| `closeOnEscape`         | `boolean`                                   | `true`  | Ferme la modal avec la touche Escape                  |
| `ariaLabelledBy`        | `string`                                    | auto    | ID pour aria-labelledby (auto-généré si non fourni)   |
| `children`              | `ReactNode`                                 | -       | **Requis.** Contenu de la modal                       |
| `className`             | `string`                                    | `''`    | Classes CSS additionnelles                            |

### Modal.Header

| Prop              | Type       | Défaut | Description                                      |
| ----------------- | ---------- | ------ | ------------------------------------------------ |
| `title`           | `string`   | -      | **Requis.** Titre principal de la modal         |
| `subtitle`        | `string`   | -      | Sous-titre / description optionnelle             |
| `showCloseButton` | `boolean`  | `true` | Affiche le bouton X de fermeture                 |
| `onClose`         | `() => void` | -    | Callback de fermeture (pour le bouton X)         |
| `id`              | `string`   | auto   | ID pour l'accessibilité                          |
| `className`       | `string`   | `''`   | Classes CSS additionnelles                       |

### Modal.Body

| Prop        | Type       | Défaut          | Description                          |
| ----------- | ---------- | --------------- | ------------------------------------ |
| `children`  | `ReactNode` | -              | **Requis.** Contenu du body          |
| `className` | `string`   | `''`            | Classes CSS additionnelles           |
| `padding`   | `string`   | `'px-6 py-5'`   | Padding personnalisé                 |

### Modal.Footer

| Prop        | Type                                    | Défaut   | Description                                 |
| ----------- | --------------------------------------- | -------- | ------------------------------------------- |
| `children`  | `ReactNode`                             | -        | **Requis.** Actions (boutons)               |
| `align`     | `'left' \| 'center' \| 'right' \| 'between'` | `'right'` | Alignement des actions                 |
| `className` | `string`                                | `''`     | Classes CSS additionnelles                  |
| `padding`   | `string`                                | `'px-6 py-4'` | Padding personnalisé                   |

---

## Tailles

Le composant Modal propose **7 tailles** pour s'adapter à tous les cas d'usage :

| Taille | max-width | Pixels | Cas d'usage                                    |
| ------ | --------- | ------ | ---------------------------------------------- |
| `sm`   | `max-w-sm` | 384px  | Confirmations, alertes simples                 |
| `md`   | `max-w-md` | 512px  | **Défaut.** Formulaires simples, la plupart des cas |
| `lg`   | `max-w-lg` | 640px  | Formulaires complexes, plusieurs champs        |
| `xl`   | `max-w-xl` | 768px  | Édition de contenu, WYSIWYG                    |
| `2xl`  | `max-w-2xl` | 896px | Tableaux, listes de données                    |
| `3xl`  | `max-w-3xl` | 1024px | Dashboards, prévisualisations                  |
| `4xl`  | `max-w-4xl` | 1280px | Plein écran, éditeurs complets                 |

**Recommandation :** Privilégiez `md` (défaut) pour 80% des cas. Montez en taille uniquement si nécessaire.

---

## Exemples

### 1. Modal simple (confirmation)

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Header
        title="Confirmer la suppression"
        subtitle="Cette action est irréversible."
        onClose={onClose}
      />
      <Modal.Body>
        <p className="text-sm text-gray-700">
          Êtes-vous sûr de vouloir supprimer cet élément ?
        </p>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Supprimer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 2. Modal avec formulaire

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useForm } from 'react-hook-form';

function AddUserModal({ isOpen, onClose, onSubmit }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title="Ajouter un utilisateur"
        subtitle="Remplissez les informations ci-dessous"
        onClose={onClose}
      />
      <Modal.Body>
        <form id="add-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: true })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', { required: true })}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" form="add-user-form" loading={isSubmitting}>
          Ajouter
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 3. Modal avec contenu scrollable

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

function TermsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title="Conditions d'utilisation"
        subtitle="Dernière mise à jour : 15 janvier 2025"
        onClose={onClose}
      />
      <Modal.Body>
        <div className="prose prose-sm max-w-none">
          <h3>1. Acceptation des conditions</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
          
          <h3>2. Utilisation du service</h3>
          <p>Sed do eiusmod tempor incididunt ut labore et dolore...</p>
          
          {/* Beaucoup de contenu ici... Le body scrolle automatiquement */}
          
          <h3>10. Contact</h3>
          <p>Pour toute question, contactez-nous à support@example.com</p>
        </div>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}>J'ai compris</Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 4. Modal sans bouton X (fermeture uniquement par action)

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

function CriticalActionModal({ isOpen, onClose, onConfirm }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={false}  // Empêche la fermeture par clic overlay
      closeOnEscape={false}         // Empêche la fermeture par ESC
    >
      <Modal.Header
        title="Action critique"
        subtitle="Vous devez explicitement confirmer ou annuler."
        showCloseButton={false}  // Pas de bouton X
      />
      <Modal.Body>
        <p className="text-sm text-gray-700">
          Cette action modifiera définitivement les données. Voulez-vous continuer ?
        </p>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Je confirme
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 5. Modal avec footer custom (alignement entre)

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

function AdvancedModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header title="Options avancées" onClose={onClose} />
      <Modal.Body>
        <p>Contenu de la modal...</p>
      </Modal.Body>
      <Modal.Footer align="between">
        <Button variant="ghost" size="sm">
          Aide
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onClose}>
            Valider
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
```

### 6. Modal très large (4xl)

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';

function DataTableModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <Modal.Header
        title="Tous les utilisateurs"
        subtitle="1,234 résultats"
        onClose={onClose}
      />
      <Modal.Body padding="p-0">
        {/* Tableau pleine largeur sans padding */}
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rôle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Lignes du tableau... */}
          </tbody>
        </table>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button onClick={onClose}>Fermer</Button>
      </Modal.Footer>
    </Modal>
  );
}
```

### 7. Modal avec loading state

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useState } from 'react';

function AsyncModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await someAsyncOperation();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={!isLoading}  // Empêche la fermeture pendant le chargement
      closeOnEscape={!isLoading}
    >
      <Modal.Header
        title="Traitement en cours"
        onClose={!isLoading ? onClose : undefined}  // Pas de bouton X pendant le chargement
      />
      <Modal.Body>
        <p>Cliquez sur Démarrer pour lancer le traitement.</p>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} loading={isLoading}>
          Démarrer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## Bonnes pratiques

### ✅ À faire

- **Toujours fournir un titre clair** via `Modal.Header`
- **Utiliser `size="md"` par défaut**, monter uniquement si nécessaire
- **Désactiver les boutons pendant les requêtes async** avec `disabled={isSubmitting}`
- **Utiliser `loading` sur les boutons** de soumission (voir `Button.loading`)
- **Ajouter un sous-titre** si l'action nécessite un contexte (`Modal.Header subtitle`)
- **Utiliser `Modal.Footer align="right"`** pour les actions principales (standard UX)
- **Empêcher la fermeture pendant les requêtes** : `closeOnOverlayClick={!isSubmitting}`
- **Réinitialiser les formulaires** dans `onClose` (via `reset()` de react-hook-form)
- **Tester sur mobile** : la modal est responsive et s'adapte automatiquement

### ❌ À éviter

- ❌ Ne pas empiler plusieurs modals (nested modals)
- ❌ Ne pas utiliser des tailles trop grandes sans raison (`4xl` uniquement si vraiment nécessaire)
- ❌ Ne pas oublier de gérer la fermeture proprement (reset state, formulaire, etc.)
- ❌ Ne pas mettre de contenu non-scrollable trop haut (risque de débordement sur mobile)
- ❌ Ne pas supprimer le bouton X sans raison (mauvaise UX)
- ❌ Ne pas utiliser `closeOnOverlayClick={false}` sans justification forte

---

## Accessibilité

Le composant Modal respecte toutes les bonnes pratiques d'accessibilité :

### Attributs ARIA

- `role="dialog"` sur l'overlay
- `aria-modal="true"` pour indiquer que c'est une modal
- `aria-labelledby` pointe vers le titre (auto-généré ou custom)

### Gestion du focus

- **Focus trap** : Le focus est automatiquement placé sur le premier élément focusable à l'ouverture
- **Restauration du focus** : Le focus revient à l'élément déclencheur après fermeture (géré par React)
- **Navigation clavier** : Tous les éléments sont accessibles au clavier (Tab, Shift+Tab)

### Fermeture

- **Touche Escape** : Ferme la modal (désactivable via `closeOnEscape={false}`)
- **Bouton X** : Visible et accessible avec `aria-label="Fermer la modal"`
- **Overlay click** : Ferme la modal (désactivable via `closeOnOverlayClick={false}`)

### Blocage du scroll

- Le scroll du `body` est automatiquement bloqué quand la modal est ouverte
- Compense la disparition de la scrollbar pour éviter le "jump" de la page

### Recommandations

- Toujours fournir un **titre descriptif** dans `Modal.Header`
- Si vous utilisez un formulaire, associez les `<label>` aux `<input>` avec `htmlFor` / `id`
- Pour les boutons avec icônes uniquement, ajoutez `aria-label`
- Testez la navigation au clavier (Tab, Shift+Tab, Enter, Escape)

---

## Migration

### Depuis les modals existants

Si vous avez une modal existante comme `AddFamilyMemberModal`, voici comment migrer :

#### Avant (ancien code)

```tsx
<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Ajouter un membre
    </h2>
    {/* Contenu... */}
    <div className="flex items-center justify-end gap-3 pt-2">
      <button onClick={onClose}>Annuler</button>
      <button type="submit">Ajouter</button>
    </div>
  </div>
</div>
```

#### Après (avec le composant Modal)

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="md">
  <Modal.Header
    title="Ajouter un membre"
    onClose={onClose}
  />
  <Modal.Body>
    {/* Contenu... */}
  </Modal.Body>
  <Modal.Footer align="right">
    <Button variant="outline" onClick={onClose}>Annuler</Button>
    <Button type="submit">Ajouter</Button>
  </Modal.Footer>
</Modal>
```

### Checklist de migration

- [ ] Remplacer la structure HTML custom par `<Modal>`
- [ ] Utiliser `Modal.Header` avec `title` et optionnellement `subtitle`
- [ ] Placer le contenu dans `Modal.Body`
- [ ] Placer les actions dans `Modal.Footer` (avec align="right" par défaut)
- [ ] Remplacer les boutons custom par le composant `Button`
- [ ] Supprimer la gestion manuelle du scroll / Escape / overlay (c'est automatique)
- [ ] Tester la fermeture (ESC, overlay, bouton X)
- [ ] Vérifier le responsive (mobile, tablet, desktop)

### Problèmes connus corrigés

Le nouveau composant Modal corrige automatiquement :

- ✅ **Overlay opacity inconsistante** : Toujours `bg-black/50`
- ✅ **Border-radius inconsistent** : Toujours `rounded-2xl`
- ✅ **Borders inconsistents** : Toujours `border-gray-100` (header/footer)
- ✅ **Bouton X manquant** : Toujours présent (désactivable si besoin)
- ✅ **Focus trap manquant** : Implémenté automatiquement
- ✅ **Compensation scrollbar** : Le "jump" de page est éliminé

---

## Personnalisation avancée

### Padding custom

```tsx
<Modal.Body padding="p-8">
  {/* Padding plus large */}
</Modal.Body>

<Modal.Footer padding="px-8 py-6">
  {/* Footer avec plus d'espace */}
</Modal.Footer>
```

### Classes CSS additionnelles

```tsx
<Modal className="my-custom-modal" size="lg">
  <Modal.Header className="bg-blue-50" title="Custom header" />
  <Modal.Body className="bg-gray-50">
    {/* ... */}
  </Modal.Body>
</Modal>
```

### ID personnalisé pour aria-labelledby

```tsx
<Modal ariaLabelledBy="my-custom-title" isOpen={isOpen} onClose={onClose}>
  <Modal.Header id="my-custom-title" title="Mon titre" />
  <Modal.Body>{/* ... */}</Modal.Body>
</Modal>
```

---

## Intégration avec react-hook-form

```tsx
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
});

function FormModal({ isOpen, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleClose = () => {
    reset(); // Important : réinitialiser le formulaire
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <Modal.Header title="Formulaire" onClose={!isSubmitting ? handleClose : undefined} />
      <Modal.Body>
        <form id="my-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-400' : 'border-gray-300'}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer align="right">
        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" form="my-form" loading={isSubmitting}>
          Soumettre
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
```

---

## Ressources

- **Design Tokens** : `frontend/src/shared/styles/designTokens.ts`
- **Composant Button** : `frontend/src/shared/components/Button.tsx`
- **Exemples live** : `frontend/src/shared/components/Modal.examples.tsx`
- **Audit de style** : `docs/AUDIT_STYLE.md`

---

**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe Dev ClubManager V3