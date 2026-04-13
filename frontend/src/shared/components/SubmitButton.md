# SubmitButton Component

Composant de bouton de soumission optimisé pour les formulaires avec gestion automatique de l'état de chargement. Wrapper spécialisé du composant Button avec une API simplifiée pour les actions asynchrones.

## 📦 Installation

```tsx
import { SubmitButton } from '@/shared/components/SubmitButton';
```

## 🎯 Usage de Base

```tsx
<SubmitButton isLoading={isSubmitting}>
  Enregistrer
</SubmitButton>
```

## 💡 Quand l'Utiliser

### ✅ Utilisez SubmitButton pour :

- **Soumission de formulaires** - Action principale d'un formulaire
- **Actions asynchrones** - Opérations qui nécessitent un feedback de chargement
- **Boutons de connexion/inscription** - Authentification utilisateur
- **Actions de sauvegarde** - Enregistrement de données
- **Opérations CRUD** - Création, mise à jour, suppression avec API
- **Confirmations d'actions** - Validation d'opérations importantes

### ❌ N'utilisez PAS SubmitButton pour :

- **Navigation simple** - Utilisez plutôt `<Button>` ou `<Link>`
- **Actions instantanées** - Sans chargement asynchrone, utilisez `<Button>`
- **Boutons de menu** - Utilisez `<Button variant="ghost">`
- **Toggles/Switches** - Utilisez un composant dédié
- **Boutons icône uniquement** - Utilisez `<Button iconOnly>`

> **Note :** SubmitButton est conçu spécifiquement pour les formulaires et actions asynchrones. Pour d'autres cas d'usage, préférez le composant [Button](./Button.md).

---

## 📋 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `isLoading` | `boolean` | - | **Requis.** État de chargement (affiche spinner + désactive) |
| `children` | `ReactNode` | - | **Requis.** Contenu du bouton (texte) |
| `loadingText` | `string` | `children` | Texte à afficher pendant le chargement |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'success' \| 'outline' \| 'ghost'` | `'primary'` | Variant visuel du bouton |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Taille du bouton |
| `fullWidth` | `boolean` | `false` | Largeur pleine (recommandé pour formulaires) |
| `type` | `'submit' \| 'button'` | `'submit'` | Type HTML du bouton |
| `disabled` | `boolean` | `false` | Désactiver le bouton (en plus de loading) |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `onClick` | `() => void` | - | Callback onClick optionnel |
| `icon` | `ReactNode` | - | Icône à afficher |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Position de l'icône |

**Note :** Le bouton est automatiquement désactivé pendant le chargement (`isLoading={true}`).

---

## 🎨 Variants

SubmitButton hérite de tous les variants du composant Button :

### Primary (Défaut)
Action principale du formulaire.

```tsx
<SubmitButton 
  isLoading={isSubmitting}
  variant="primary"
>
  Enregistrer
</SubmitButton>
```

**Cas d'usage :** Soumettre un formulaire, Confirmer une action, Connexion

---

### Secondary
Action alternative ou annulation.

```tsx
<SubmitButton 
  isLoading={isCanceling}
  variant="secondary"
  type="button"
>
  Annuler
</SubmitButton>
```

**Cas d'usage :** Annuler, Retour, Action secondaire

---

### Danger
Actions destructives nécessitant confirmation.

```tsx
<SubmitButton 
  isLoading={isDeleting}
  loadingText="Suppression..."
  variant="danger"
  type="button"
>
  Supprimer
</SubmitButton>
```

**Cas d'usage :** Suppression, Actions irréversibles

---

### Success
Validation ou approbation.

```tsx
<SubmitButton 
  isLoading={isValidating}
  variant="success"
>
  Valider
</SubmitButton>
```

**Cas d'usage :** Validation, Approbation, Confirmation positive

---

## 💡 Exemples d'Utilisation

### 1. Formulaire de Connexion

```tsx
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData);
      toast.success('Connexion réussie');
    } catch (error) {
      toast.error('Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      
      <SubmitButton
        isLoading={isLoading}
        loadingText="Connexion en cours..."
        fullWidth
      >
        Se connecter
      </SubmitButton>
    </form>
  );
}
```

---

### 2. Formulaire de Création de Membre

```tsx
function CreateMemberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createMember(formData);
      toast.success('Membre créé avec succès');
      router.push('/members');
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Champs du formulaire */}
      
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button 
          variant="secondary" 
          type="button"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <SubmitButton
          isLoading={isSubmitting}
          loadingText="Création en cours..."
        >
          Créer le membre
        </SubmitButton>
      </div>
    </form>
  );
}
```

---

### 3. Action de Suppression avec Confirmation

```tsx
function DeleteMemberButton({ memberId }: { memberId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMember(memberId);
      toast.success('Membre supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SubmitButton
      isLoading={isDeleting}
      loadingText="Suppression..."
      variant="danger"
      type="button"
      onClick={handleDelete}
      icon={<TrashIcon className="h-4 w-4" />}
    >
      Supprimer
    </SubmitButton>
  );
}
```

---

### 4. Formulaire avec Validation

```tsx
function UpdateProfileForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.email.includes('@')) newErrors.email = 'Email invalide';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Profil mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.email.includes('@');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
      />
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      
      <SubmitButton
        isLoading={isSaving}
        loadingText="Enregistrement..."
        disabled={!isFormValid}
        fullWidth
      >
        Mettre à jour
      </SubmitButton>
    </form>
  );
}
```

---

### 5. Modal avec Actions Asynchrones

```tsx
function ConfirmationModal({ isOpen, onClose, onConfirm }: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmer l'action">
      <p className="text-gray-600 mb-6">
        Êtes-vous sûr de vouloir effectuer cette action ?
      </p>
      
      <div className="flex items-center justify-end gap-3">
        <Button 
          variant="secondary" 
          onClick={onClose}
          disabled={isProcessing}
        >
          Annuler
        </Button>
        <SubmitButton
          isLoading={isProcessing}
          loadingText="Traitement..."
          variant="primary"
          type="button"
          onClick={handleConfirm}
        >
          Confirmer
        </SubmitButton>
      </div>
    </Modal>
  );
}
```

---

### 6. Bouton avec Icône

```tsx
function SaveButton({ onSave }: { onSave: () => Promise<void> }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      toast.success('Enregistré');
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SubmitButton
      isLoading={isSaving}
      loadingText="Enregistrement..."
      type="button"
      onClick={handleSave}
      icon={<SaveIcon className="h-4 w-4" />}
    >
      Enregistrer
    </SubmitButton>
  );
}
```

---

### 7. Formulaire d'Inscription

```tsx
function RegisterForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsRegistering(true);
    try {
      await register(formData);
      toast.success('Inscription réussie');
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Champs du formulaire */}
      
      <SubmitButton
        isLoading={isRegistering}
        loadingText="Création du compte..."
        variant="success"
        fullWidth
        size="lg"
      >
        Créer mon compte
      </SubmitButton>
    </form>
  );
}
```

---

### 8. Actions Multiples dans un Formulaire

```tsx
function DocumentForm() {
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveDocument();
      toast.success('Brouillon enregistré');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishDocument();
      toast.success('Document publié');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <form>
      {/* Champs du formulaire */}
      
      <div className="flex items-center justify-end gap-3 mt-6">
        <SubmitButton
          isLoading={isSaving}
          loadingText="Enregistrement..."
          variant="secondary"
          type="button"
          onClick={handleSave}
        >
          Enregistrer le brouillon
        </SubmitButton>
        <SubmitButton
          isLoading={isPublishing}
          loadingText="Publication..."
          variant="success"
          type="button"
          onClick={handlePublish}
        >
          Publier
        </SubmitButton>
      </div>
    </form>
  );
}
```

---

## 🎯 Bonnes Pratiques

### ✅ À FAIRE

1. **Utiliser fullWidth pour les formulaires**
   ```tsx
   // ✅ Bon - Meilleure UX sur mobile
   <SubmitButton isLoading={loading} fullWidth>
     Se connecter
   </SubmitButton>
   ```

2. **Fournir un texte de chargement descriptif**
   ```tsx
   // ✅ Bon - L'utilisateur sait ce qui se passe
   <SubmitButton 
     isLoading={loading}
     loadingText="Connexion en cours..."
   >
     Se connecter
   </SubmitButton>
   ```

3. **Désactiver si le formulaire est invalide**
   ```tsx
   // ✅ Bon - Empêche la soumission invalide
   <SubmitButton
     isLoading={isSubmitting}
     disabled={!isFormValid}
   >
     Enregistrer
   </SubmitButton>
   ```

4. **Gérer les erreurs proprement**
   ```tsx
   // ✅ Bon - Toujours un bloc finally
   try {
     await submit();
   } catch (error) {
     toast.error('Erreur');
   } finally {
     setIsLoading(false); // Important !
   }
   ```

5. **Utiliser type="button" pour les actions non-submit**
   ```tsx
   // ✅ Bon - Évite la soumission accidentelle
   <SubmitButton
     type="button"
     isLoading={loading}
     onClick={handleAction}
   >
     Action
   </SubmitButton>
   ```

6. **Combiner avec la validation de formulaire**
   ```tsx
   // ✅ Bon - UX optimale
   const isValid = email && password.length >= 8;
   
   <SubmitButton
     isLoading={isSubmitting}
     disabled={!isValid}
   >
     Se connecter
   </SubmitButton>
   ```

---

### ❌ À ÉVITER

1. **Ne pas oublier de remettre isLoading à false**
   ```tsx
   // ❌ Mauvais - Le bouton reste bloqué
   const handleSubmit = async () => {
     setIsLoading(true);
     await submit();
     // Oubli de setIsLoading(false)
   };
   
   // ✅ Bon - Toujours dans finally
   const handleSubmit = async () => {
     setIsLoading(true);
     try {
       await submit();
     } finally {
       setIsLoading(false);
     }
   };
   ```

2. **Ne pas utiliser plusieurs boutons primary**
   ```tsx
   // ❌ Mauvais - Pas de hiérarchie claire
   <SubmitButton variant="primary">Enregistrer</SubmitButton>
   <SubmitButton variant="primary">Publier</SubmitButton>
   
   // ✅ Bon - Hiérarchie visuelle
   <SubmitButton variant="secondary">Enregistrer</SubmitButton>
   <SubmitButton variant="primary">Publier</SubmitButton>
   ```

3. **Ne pas désactiver manuellement pendant loading**
   ```tsx
   // ❌ Mauvais - Redondant
   <SubmitButton isLoading={true} disabled={true}>
   
   // ✅ Bon - Auto-désactivé par isLoading
   <SubmitButton isLoading={true}>
   ```

4. **Ne pas utiliser pour la navigation**
   ```tsx
   // ❌ Mauvais - Utiliser Link ou Button
   <SubmitButton isLoading={false} onClick={() => router.push('/page')}>
   
   // ✅ Bon - Composant approprié
   <Button onClick={() => router.push('/page')}>
   ```

5. **Ne pas oublier le feedback utilisateur**
   ```tsx
   // ❌ Mauvais - Pas de feedback après action
   const handleSubmit = async () => {
     setIsLoading(true);
     await submit();
     setIsLoading(false);
   };
   
   // ✅ Bon - Toast de confirmation
   const handleSubmit = async () => {
     setIsLoading(true);
     try {
       await submit();
       toast.success('Enregistré avec succès');
     } catch (error) {
       toast.error('Erreur');
     } finally {
       setIsLoading(false);
     }
   };
   ```

---

## 🎭 États du Composant

| État | Comportement | Visuel |
|------|--------------|--------|
| **Normal** | Cliquable, couleurs normales | Couleur pleine, hover actif |
| **Loading** | Spinner visible, auto-désactivé | Spinner + texte de chargement |
| **Disabled** | Non cliquable, opacité réduite | Opacité 40%, cursor not-allowed |
| **Loading + Disabled** | Non cliquable, spinner visible | Spinner + opacité réduite |
| **Hover** | Couleur plus foncée (si non disabled) | Transition douce |
| **Focus** | Ring de focus visible | Anneau coloré, outline none |

---

## ♿ Accessibilité

### Texte Descriptif

```tsx
// ✅ Bon - Texte clair et descriptif
<SubmitButton isLoading={loading}>
  Se connecter
</SubmitButton>
```

Le texte du bouton doit décrire clairement l'action.

### État de Chargement

```tsx
// ✅ Bon - Le texte change pendant le chargement
<SubmitButton 
  isLoading={loading}
  loadingText="Connexion en cours..."
>
  Se connecter
</SubmitButton>
```

Le lecteur d'écran annoncera "Connexion en cours..." pendant le chargement.

### Désactivation

Le bouton est automatiquement désactivé pendant le chargement :
- `disabled` est défini à `true`
- `cursor: not-allowed`
- Les lecteurs d'écran annoncent l'état désactivé

### Navigation Clavier

- **Tab :** Focus le bouton
- **Enter/Space :** Soumet le formulaire (si type="submit")
- **Shift+Tab :** Focus précédent

### ARIA

Le composant Button sous-jacent gère automatiquement les attributs ARIA :
- `aria-disabled` quand disabled ou loading
- `aria-busy` pendant le chargement (si implémenté)

---

## 🔄 Migration depuis l'Ancien Code

### Avant (Code Dupliqué)

```tsx
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
```

### Après (Avec SubmitButton)

```tsx
function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <SubmitButton
        isLoading={isLoading}
        loadingText="Connexion en cours..."
        fullWidth
      >
        Se connecter
      </SubmitButton>
    </form>
  );
}
```

**Réduction :** ~220 lignes → ~10 lignes (95% de code en moins)

---

## 🐛 Troubleshooting

### Le bouton reste bloqué en état loading

**Cause :** `isLoading` n'est pas remis à `false`

**Solution :**
```tsx
// Toujours utiliser try/finally
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submit();
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false); // Important !
  }
};
```

---

### Le bouton soumet le formulaire par accident

**Cause :** `type="button"` manquant pour une action non-submit

**Solution :**
```tsx
// Pour les actions autres que submit
<SubmitButton type="button" onClick={handleAction}>
```

---

### Le texte de chargement ne s'affiche pas

**Cause :** La prop `loadingText` n'est pas fournie

**Solution :**
```tsx
// Ajouter loadingText
<SubmitButton 
  isLoading={loading}
  loadingText="Chargement..."
>
  Action
</SubmitButton>
```

---

### Le bouton n'est pas cliquable

**Cause :** `disabled={true}` ou `isLoading={true}`

**Solution :**
```tsx
// Vérifier les props
console.log({ isLoading, disabled });
```

---

## 📊 Comparaison : SubmitButton vs Button

| Critère | SubmitButton | Button |
|---------|--------------|--------|
| **Usage principal** | Formulaires, actions async | Actions générales |
| **Type par défaut** | `submit` | `button` |
| **API loading** | `isLoading` + `loadingText` | `loading` seulement |
| **Simplicité** | API simplifiée | API complète |
| **Cas d'usage** | Soumissions de formulaire | Boutons génériques |
| **Recommandé pour** | Formulaires | Navigation, actions |

---

## 🎓 Cas d'Usage Avancés

### Soumission avec React Hook Form

```tsx
import { useForm } from 'react-hook-form';

function FormWithHookForm() {
  const { register, handleSubmit, formState } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.submit(data);
      toast.success('Enregistré');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Champs avec register */}
      
      <SubmitButton
        isLoading={isSubmitting}
        disabled={!formState.isValid}
      >
        Enregistrer
      </SubmitButton>
    </form>
  );
}
```

### Avec Debounce pour Éviter Double-Click

```tsx
import { useCallback } from 'react';

function FormWithDebounce() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Évite les double-clicks
    
    setIsSubmitting(true);
    try {
      await submit();
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return (
    <form onSubmit={handleSubmit}>
      <SubmitButton isLoading={isSubmitting}>
        Enregistrer
      </SubmitButton>
    </form>
  );
}
```

---

## 📚 Voir Aussi

- [Button Component](./Button.md) - Composant bouton de base
- [FormInput Component](./FormInput.md) - Composant input pour formulaires
- [Input Component](./Input.md) - Composant input de base
- [Modal Component](./Modal.md) - Composant modal
- [LoadingSpinner Component](./LoadingSpinner.md) - Spinner de chargement

---

## 📝 Notes de Version

- **v1.0.0** - Version initiale
  - Wrapper spécialisé du composant Button
  - API simplifiée pour formulaires (`isLoading`, `loadingText`)
  - Type par défaut `submit`
  - Support de tous les variants Button
  - Réduction de ~220 lignes de code dupliqué
  - Basé sur l'audit de style

---

## 💬 FAQ

**Q : Quelle est la différence entre `<Button loading>` et `<SubmitButton isLoading>` ?**

R : `SubmitButton` est un wrapper optimisé pour les formulaires avec :
- Type par défaut `submit` (au lieu de `button`)
- API plus claire (`isLoading` + `loadingText`)
- Sémantique orientée formulaire

**Q : Puis-je utiliser SubmitButton en dehors d'un formulaire ?**

R : Oui, avec `type="button"`. Mais pour les actions générales, préférez `<Button>`.

**Q : Comment gérer plusieurs boutons submit dans un formulaire ?**

R : Utilisez `type="button"` + `onClick` pour les boutons secondaires, et `type="submit"` pour l'action principale.

**Q : SubmitButton gère-t-il la validation de formulaire ?**

R : Non. Utilisez `disabled={!isFormValid}` ou un hook comme React Hook Form.