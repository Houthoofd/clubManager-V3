# ConfirmDialog

Composant de dialogue de confirmation réutilisable pour remplacer `window.confirm()` avec une meilleure UX, un style cohérent et une meilleure accessibilité.

## Description

**ConfirmDialog** est un composant qui affiche une boîte de dialogue modale pour confirmer une action importante ou irréversible. Il utilise le composant `Modal` existant avec une API simplifiée spécifiquement conçue pour les confirmations.

### Pourquoi éviter `window.confirm()` ?

❌ **Problèmes avec `window.confirm()` :**
- **Apparence non stylisée** : L'apparence dépend du navigateur et ne peut pas être personnalisée
- **Bloquant** : Bloque complètement l'exécution JavaScript (synchrone)
- **Mauvaise UX** : Messages limités, pas d'icônes, pas de couleurs selon le contexte
- **Accessibilité limitée** : Pas de support ARIA, navigation clavier basique
- **Mobile** : Rendu très pauvre sur mobile
- **Pas de loading** : Impossible d'afficher un état de chargement pendant une action async

✅ **Avantages de `ConfirmDialog` :**
- **Style cohérent** : S'intègre parfaitement au design system
- **Non-bloquant** : Utilise des callbacks async/await
- **UX améliorée** : Icônes contextuelles, couleurs selon la gravité
- **Accessibilité** : Focus management, Escape key, ARIA labels
- **Responsive** : Adapté mobile et desktop
- **Loading states** : Affiche un spinner pendant les actions async
- **Personnalisable** : Labels, variants, messages détaillés

## Quand l'utiliser

✅ **À utiliser pour :**
- Suppressions définitives (membres, articles, commandes...)
- Actions irréversibles (annulation de paiement, clôture de compte...)
- Actions critiques (changement de rôle admin, modification de permissions...)
- Actions avec conséquences importantes (envoi groupé de messages...)

❌ **À éviter pour :**
- Actions réversibles (masquer/afficher un élément)
- Simples notifications (utiliser `toast` à la place)
- Validations de formulaire (utiliser la validation intégrée)
- Avertissements informatifs (utiliser un simple message)

## API du composant

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `isOpen` | `boolean` | **requis** | Contrôle la visibilité du dialog |
| `onClose` | `() => void` | **requis** | Callback appelé lors de la fermeture (annulation ou ESC) |
| `onConfirm` | `() => void \| Promise<void>` | **requis** | Callback appelé lors de la confirmation (supporte async) |
| `title` | `string` | **requis** | Titre du dialog |
| `message` | `string` | **requis** | Message de confirmation détaillé |
| `variant` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Type d'action (affecte l'icône et le style du bouton) |
| `confirmLabel` | `string` | Selon variant | Label du bouton de confirmation |
| `cancelLabel` | `string` | `'Annuler'` | Label du bouton d'annulation |
| `isLoading` | `boolean` | `false` | Affiche un spinner et désactive les boutons |

## Variants

### `danger` (défaut)

Pour les **actions destructives et irréversibles** (suppressions, désactivations définitives).

- **Icône** : Triangle d'avertissement (⚠️)
- **Couleur** : Rouge
- **Bouton** : `variant="danger"`
- **Label par défaut** : "Supprimer"

```tsx
<ConfirmDialog
  variant="danger"
  title="Supprimer le membre"
  message="Cette action est irréversible."
  // ...
/>
```

### `warning`

Pour les **actions importantes nécessitant attention** (changements de configuration, modifications critiques).

- **Icône** : Cercle d'avertissement
- **Couleur** : Jaune/Orange
- **Bouton** : `variant="primary"`
- **Label par défaut** : "Confirmer"

```tsx
<ConfirmDialog
  variant="warning"
  title="Modifier le rôle"
  message="Cette action donnera des permissions élevées."
  // ...
/>
```

### `info`

Pour les **confirmations informatives** (actions avec conséquences mais non destructives).

- **Icône** : Cercle d'information
- **Couleur** : Bleu
- **Bouton** : `variant="primary"`
- **Label par défaut** : "Confirmer"

```tsx
<ConfirmDialog
  variant="info"
  title="Envoyer le message"
  message="Le message sera envoyé à 45 membres."
  // ...
/>
```

## Exemples d'utilisation

### 1. Suppression simple (pattern de base)

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Button } from '@/shared/components/Button';
import { toast } from 'sonner';

function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Action synchrone simple
    console.log('Élément supprimé');
    toast.success('Supprimé avec succès');
  };

  return (
    <>
      <Button
        variant="danger"
        onClick={() => setShowConfirm(true)}
      >
        Supprimer
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'élément"
        message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
        variant="danger"
      />
    </>
  );
}
```

### 2. Action asynchrone avec loading

```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { deleteMember } from '@/api/members';
import { toast } from 'sonner';

function DeleteMemberButton({ memberId, memberName }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMember(memberId);
      toast.success(`${memberName} a été supprimé`);
      // Optionnel : rafraîchir la liste
      // refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      throw error; // Empêche la fermeture de la modal
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setShowConfirm(true)}>
        Supprimer
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${memberName} ? Toutes ses données seront définitivement perdues.`}
        variant="danger"
        confirmLabel="Supprimer"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### 3. Labels personnalisés

```tsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleArchive}
  title="Archiver la commande"
  message="La commande sera déplacée vers les archives et ne sera plus visible dans la liste principale."
  variant="warning"
  confirmLabel="Archiver maintenant"
  cancelLabel="Non, garder visible"
/>
```

### 4. Variant `warning` (changement de rôle)

```tsx
function ChangeRoleButton({ userId, currentRole }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangeRole = async () => {
    await updateUserRole(userId, 'ADMIN');
    toast.success('Rôle modifié');
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        Promouvoir admin
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleChangeRole}
        title="Promouvoir en administrateur"
        message="Cette personne aura accès à toutes les fonctionnalités d'administration, y compris la gestion des utilisateurs et des paiements."
        variant="warning"
        confirmLabel="Promouvoir"
      />
    </>
  );
}
```

### 5. Variant `info` (envoi groupé)

```tsx
function BroadcastButton({ recipientCount }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSend = async () => {
    await sendBroadcast();
    toast.success('Message envoyé');
  };

  return (
    <>
      <Button onClick={() => setShowConfirm(true)}>
        Envoyer à tous
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSend}
        title="Envoyer le message"
        message={`Le message sera envoyé à ${recipientCount} membres. Ils recevront une notification immédiatement.`}
        variant="info"
        confirmLabel="Envoyer maintenant"
      />
    </>
  );
}
```

### 6. Migration depuis `window.confirm()`

**❌ Avant (window.confirm) :**

```tsx
function DeleteButton({ itemId }) {
  const handleDelete = async () => {
    // Bloquant, pas stylisé, mauvaise UX
    if (window.confirm('Êtes-vous sûr ?')) {
      await deleteItem(itemId);
      alert('Supprimé !'); // Encore du blocage...
    }
  };

  return <button onClick={handleDelete}>Supprimer</button>;
}
```

**✅ Après (ConfirmDialog) :**

```tsx
function DeleteButton({ itemId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteItem(itemId);
      toast.success('Supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setShowConfirm(true)}>
        Supprimer
      </Button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer l'élément"
        message="Cette action est irréversible. Êtes-vous sûr ?"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### 7. Utilisation dans une table avec actions

```tsx
function MembersTable({ members }) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteMember(confirmDelete);
      toast.success('Membre supprimé');
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <table>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmDelete(member.id)}
                >
                  Supprimer
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Êtes-vous sûr de vouloir supprimer ${
          members.find((m) => m.id === confirmDelete)?.name
        } ? Cette action est irréversible.`}
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
```

## Bonnes pratiques

### ✅ Messages clairs et explicites

```tsx
// ✅ BON : Message clair avec contexte et conséquences
<ConfirmDialog
  title="Supprimer le membre"
  message="Êtes-vous sûr de vouloir supprimer Jean Dupont ? Toutes ses données (profil, historique de paiements, commandes) seront définitivement perdues."
/>

// ❌ MAUVAIS : Message vague
<ConfirmDialog
  title="Supprimer"
  message="Êtes-vous sûr ?"
/>
```

### ✅ Utiliser le bon variant

```tsx
// ✅ BON : danger pour suppression
<ConfirmDialog variant="danger" title="Supprimer..." />

// ✅ BON : warning pour changement important
<ConfirmDialog variant="warning" title="Changer le rôle..." />

// ✅ BON : info pour action non destructive
<ConfirmDialog variant="info" title="Envoyer le message..." />
```

### ✅ Gestion des erreurs

```tsx
const handleConfirm = async () => {
  try {
    await dangerousAction();
    toast.success('Action réussie');
  } catch (error) {
    toast.error('Erreur lors de l\'action');
    // ⚠️ Important : throw pour empêcher la fermeture de la modal
    throw error;
  }
};
```

### ✅ Loading state pour actions async

```tsx
// ✅ BON : Toujours gérer le loading
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  try {
    await asyncAction();
  } finally {
    setIsLoading(false);
  }
};

<ConfirmDialog isLoading={isLoading} />
```

### ❌ Ne PAS utiliser pour tout

```tsx
// ❌ MAUVAIS : Pour une action réversible
<ConfirmDialog
  title="Marquer comme lu"
  message="Marquer ce message comme lu ?"
/>
// → Utiliser plutôt une action directe avec toast de succès

// ❌ MAUVAIS : Pour une notification
<ConfirmDialog
  title="Succès"
  message="L'opération a réussi"
/>
// → Utiliser plutôt toast.success()
```

## Accessibilité

### Focus Management

- **Ouverture** : Le focus est automatiquement placé sur le premier élément focusable (bouton Annuler)
- **Navigation** : Tab/Shift+Tab pour naviguer entre les boutons
- **Fermeture** : Le focus retourne à l'élément qui a ouvert le dialog

### Clavier

- **Escape** : Ferme le dialog (équivalent à "Annuler")
- **Enter** : Confirme l'action si le bouton Confirmer a le focus
- **Tab** : Navigue entre les boutons

### ARIA

- `role="dialog"` : Identifie la modal comme un dialogue
- `aria-modal="true"` : Indique que c'est une fenêtre modale
- `aria-labelledby` : Lie le titre au dialog

### Screen Readers

- Le titre est annoncé à l'ouverture
- L'icône a `aria-hidden="true"` (purement décorative)
- Les boutons ont des labels clairs

## Dépendances

- **Modal** : Composant modal de base (gère overlay, ESC, focus trap)
- **Button** : Composant bouton (variants, loading)
- **@patternfly/react-icons** : Icônes (ExclamationTriangleIcon, ExclamationCircleIcon, InfoCircleIcon)

## Limitations connues

- **Pas de custom content** : Le dialog est optimisé pour titre + message simple. Pour des contenus complexes, utiliser directement `Modal`.
- **Un seul bouton de confirmation** : Pas de support pour plusieurs actions (utiliser `Modal` si besoin).
- **Pas de checkbox "Ne plus afficher"** : Cette fonctionnalité n'est pas supportée (antipattern UX).

## Voir aussi

- [Modal.md](./Modal.md) - Composant modal de base
- [Button.md](./Button.md) - Composant bouton
- [Toast/Sonner](https://sonner.emilkowal.ski/) - Pour les notifications