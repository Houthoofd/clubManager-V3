# PasswordInput Component

Champ de saisie spécialisé pour les mots de passe avec toggle show/hide et indicateur de force optionnel.

## Fonctionnalités

- ✅ **Toggle visibilité** : Bouton pour afficher/masquer le mot de passe
- ✅ **Indicateur de force** : Barre de progression avec label (Faible, Moyen, Fort, Très fort)
- ✅ **Calcul intelligent** : Évaluation basée sur la longueur, la complexité et la variété des caractères
- ✅ **États visuels** : Support des états d'erreur et désactivé
- ✅ **Accessible** : ARIA labels, rôles et descriptions appropriés
- ✅ **Personnalisable** : Classes CSS additionnelles pour le champ et le conteneur

## Import

```tsx
import { PasswordInput } from '@/shared/components/Input';
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | ID unique du champ (requis pour l'accessibilité) |
| `value` | `string` | Valeur contrôlée du champ |
| `onChange` | `(e: ChangeEvent<HTMLInputElement>) => void` | Handler de changement de valeur |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showStrengthIndicator` | `boolean` | `false` | Affiche l'indicateur de force du mot de passe |
| `hasError` | `boolean` | `false` | Affiche l'état d'erreur (bordure rouge) |
| `placeholder` | `string` | `"Entrez votre mot de passe"` | Texte de placeholder |
| `autoComplete` | `string` | `"current-password"` | Valeur d'autocomplétion |
| `disabled` | `boolean` | `false` | Désactive le champ |
| `className` | `string` | `""` | Classes CSS additionnelles pour le champ |
| `containerClassName` | `string` | `""` | Classes CSS additionnelles pour le conteneur |

Hérite également de toutes les props HTML standard de `<input>` (sauf `type`).

## Usage

### Exemple de base

```tsx
import { useState } from 'react';
import { PasswordInput } from '@/shared/components/Input';

function LoginForm() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <label htmlFor="password">Mot de passe</label>
      <PasswordInput
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );
}
```

### Avec indicateur de force

```tsx
<PasswordInput
  id="new-password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  showStrengthIndicator
  autoComplete="new-password"
  placeholder="Créez un mot de passe fort"
/>
```

### Avec gestion d'erreur

```tsx
const [password, setPassword] = useState('');
const [error, setError] = useState('');

const handleSubmit = (e) => {
  e.preventDefault();
  if (password.length < 8) {
    setError('Le mot de passe doit contenir au moins 8 caractères');
  }
};

return (
  <div>
    <label htmlFor="password">Mot de passe</label>
    <PasswordInput
      id="password"
      value={password}
      onChange={(e) => {
        setPassword(e.target.value);
        setError(''); // Reset error on change
      }}
      hasError={!!error}
      showStrengthIndicator
    />
    {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
  </div>
);
```

### Formulaire de changement de mot de passe

```tsx
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="current">Mot de passe actuel</label>
        <PasswordInput
          id="current"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      <div>
        <label htmlFor="new">Nouveau mot de passe</label>
        <PasswordInput
          id="new"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          showStrengthIndicator
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="confirm">Confirmer le mot de passe</label>
        <PasswordInput
          id="confirm"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          hasError={confirmPassword !== '' && confirmPassword !== newPassword}
        />
      </div>
    </form>
  );
}
```

## Critères de force du mot de passe

Le calcul de la force est basé sur les critères suivants :

| Critère | Points |
|---------|--------|
| Longueur ≥ 8 caractères | 25 |
| Longueur ≥ 12 caractères | 25 |
| Majuscules ET minuscules | 25 |
| Chiffres | 12.5 |
| Caractères spéciaux | 12.5 |

### Niveaux de force

- **Faible** (0-24%) : ❌ Rouge - Moins de 8 caractères
- **Moyen** (25-49%) : 🟠 Orange - 8+ caractères avec lettres et chiffres
- **Fort** (50-74%) : 🟡 Jaune - Bonne combinaison de types de caractères
- **Très fort** (75-100%) : ✅ Vert - 12+ caractères avec tous les types

### Exemples de mots de passe

```tsx
"weak"           // Faible (25%)
"password123"    // Moyen (37.5%)
"Password123"    // Fort (50%)
"P@ssw0rd123"    // Fort (62.5%)
"MyStr0ng!Pass"  // Très fort (75%)
"MyV3ry$tr0ng!P@ssw0rd" // Très fort (100%)
```

## Accessibilité

Le composant implémente les meilleures pratiques d'accessibilité :

- ✅ **ARIA labels** : Le bouton toggle a un label descriptif
- ✅ **ARIA invalid** : L'attribut `aria-invalid` est défini en cas d'erreur
- ✅ **ARIA live region** : L'indicateur de force est annoncé aux lecteurs d'écran
- ✅ **Focus management** : Le bouton toggle a `tabIndex={-1}` pour ne pas perturber la navigation
- ✅ **Keyboard accessible** : Toutes les fonctionnalités sont accessibles au clavier

### Recommandations

1. **Toujours fournir un label** visible associé au champ :
   ```tsx
   <label htmlFor="password">Mot de passe</label>
   <PasswordInput id="password" ... />
   ```

2. **Utiliser l'autoComplete approprié** :
   - `"current-password"` pour la connexion
   - `"new-password"` pour la création/changement de mot de passe

3. **Afficher des messages d'erreur clairs** :
   ```tsx
   {error && <p className="text-xs text-red-600">{error}</p>}
   ```

## Personnalisation

### Classes CSS personnalisées

```tsx
// Personnaliser le champ input
<PasswordInput
  className="border-2 border-purple-500"
  ...
/>

// Personnaliser le conteneur
<PasswordInput
  containerClassName="mb-6"
  ...
/>
```

### Intégration avec react-hook-form

```tsx
import { useForm } from 'react-hook-form';

function RegisterForm() {
  const { register, watch, formState: { errors } } = useForm();
  const password = watch('password', '');

  return (
    <form>
      <label htmlFor="password">Mot de passe</label>
      <PasswordInput
        id="password"
        value={password}
        {...register('password', {
          required: 'Le mot de passe est requis',
          minLength: {
            value: 8,
            message: 'Le mot de passe doit contenir au moins 8 caractères',
          },
        })}
        showStrengthIndicator
        hasError={!!errors.password}
      />
      {errors.password && (
        <p className="text-xs text-red-600">{errors.password.message}</p>
      )}
    </form>
  );
}
```

## Bonnes pratiques

### ✅ À faire

- Utiliser `showStrengthIndicator` pour les formulaires de création/changement de mot de passe
- Définir `autoComplete="current-password"` pour les formulaires de connexion
- Définir `autoComplete="new-password"` pour les formulaires d'inscription
- Toujours fournir un label visible associé au champ
- Afficher des messages d'aide pour guider l'utilisateur vers un mot de passe fort

### ❌ À éviter

- Ne pas utiliser `autoComplete="off"` (mauvais pour l'UX et la sécurité)
- Ne pas limiter la longueur maximale du mot de passe de manière trop restrictive
- Ne pas afficher l'indicateur de force sur les formulaires de connexion
- Ne pas forcer des règles de complexité trop strictes qui nuisent à l'utilisabilité

## Design Tokens

Le composant utilise les design tokens suivants :

- `INPUT.base` : Styles de base du champ
- `INPUT.error` : Styles d'erreur
- `INPUT.disabled` : Styles désactivé
- `INPUT.withIconRight` : Padding pour le bouton toggle

Les couleurs de l'indicateur de force utilisent les couleurs sémantiques de Tailwind :
- Rouge (`red-500`, `red-600`) pour Faible
- Orange (`orange-500`, `orange-600`) pour Moyen
- Jaune (`yellow-500`, `yellow-600`) pour Fort
- Vert (`green-500`, `green-600`) pour Très fort

## Support navigateurs

Compatible avec tous les navigateurs modernes :
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Voir aussi

- [Input.tsx](./Input.tsx) - Composant Input de base
- [FormInput.tsx](./FormInput.tsx) - Input avec label et helper text intégrés
- [Design Tokens](../../styles/designTokens.ts) - Tokens de design du projet