# FormInput Component

Composant de champ de formulaire réutilisable avec support natif pour **react-hook-form**. Conçu pour éliminer la duplication de code dans les formulaires d'authentification et autres.

## Description

`FormInput` est un composant d'input contrôlé qui encapsule :
- Label avec indicateur de champ requis (*)
- Input avec support d'icônes gauche/droite
- Gestion automatique des états d'erreur
- Messages d'erreur intégrés
- Intégration transparente avec react-hook-form
- Accessibilité complète (ARIA)

**Utilisation recommandée :**
- Formulaires d'authentification (login, register, forgot password)
- Formulaires de création/édition d'entités
- Tout formulaire nécessitant une validation

## Intégration react-hook-form

Le composant accepte directement le retour de la fonction `register()` de react-hook-form :

```tsx
import { useForm } from "react-hook-form";
import { FormInput } from "@/shared/components/FormInput";

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormInput
        label="Email"
        id="email"
        type="email"
        register={register("email", { 
          required: "L'email est requis",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email invalide"
          }
        })}
        error={errors.email?.message as string}
        required
      />
      
      <button type="submit">Soumettre</button>
    </form>
  );
}
```

## API

### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | `string` | **requis** | Label affiché au-dessus de l'input |
| `id` | `string` | **requis** | ID unique pour l'accessibilité (htmlFor) |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` | Type d'input HTML |
| `leftIcon` | `React.ReactNode` | - | Icône affichée à gauche (h-5 w-5 recommandé) |
| `rightElement` | `React.ReactNode` | - | Élément à droite (bouton, icône) |
| `error` | `string` | - | Message d'erreur (active le style rouge) |
| `register` | `UseFormRegisterReturn` | - | Retour de `register()` de react-hook-form |
| `placeholder` | `string` | - | Texte de placeholder |
| `required` | `boolean` | `false` | Affiche un astérisque rouge (*) |
| `disabled` | `boolean` | `false` | Désactive l'input |
| `className` | `string` | `''` | Classes CSS additionnelles (conteneur) |

**Autres props** : Toutes les props HTML standard d'`<input>` sont supportées (`autoComplete`, `maxLength`, `minLength`, etc.)

## Exemples

### 1. Input Simple

```tsx
<FormInput
  label="Nom d'utilisateur"
  id="username"
  placeholder="Entrez votre nom"
/>
```

### 2. Avec Icône Gauche

```tsx
import { UserIcon } from '@patternfly/react-icons';

<FormInput
  label="Identifiant"
  id="userId"
  leftIcon={<UserIcon className="h-5 w-5" />}
  placeholder="user@example.com"
/>
```

### 3. Email avec Validation

```tsx
import { EnvelopeIcon } from '@patternfly/react-icons';

<FormInput
  label="Adresse email"
  id="email"
  type="email"
  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
  register={register("email", { 
    required: "L'email est requis",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Format d'email invalide"
    }
  })}
  error={errors.email?.message}
  required
/>
```

### 4. Password avec Toggle Visibilité

```tsx
import { useState } from 'react';
import { LockIcon, EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

function PasswordField() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormInput
      label="Mot de passe"
      id="password"
      type={showPassword ? "text" : "password"}
      leftIcon={<LockIcon className="h-5 w-5" />}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      }
      register={register("password", { 
        required: "Le mot de passe est requis",
        minLength: {
          value: 8,
          message: "Minimum 8 caractères"
        }
      })}
      error={errors.password?.message}
      required
    />
  );
}
```

### 5. Champ avec Erreur

```tsx
<FormInput
  label="Code postal"
  id="zipCode"
  type="text"
  error="Format invalide. Utilisez 5 chiffres (ex: 75001)"
  defaultValue="ABC"
/>
```

### 6. Champ Requis

```tsx
<FormInput
  label="Nom complet"
  id="fullName"
  required
  placeholder="Jean Dupont"
/>
```

### 7. Formulaire Complet de Login

```tsx
import { useForm } from "react-hook-form";
import { FormInput } from "@/shared/components/FormInput";
import { Button } from "@/shared/components/Button";
import { UserIcon, LockIcon } from '@patternfly/react-icons';

interface LoginFormData {
  userId: string;
  password: string;
}

function LoginForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    // Logique de connexion
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormInput
        label="Identifiant"
        id="userId"
        leftIcon={<UserIcon className="h-5 w-5" />}
        register={register("userId", { 
          required: "L'identifiant est requis" 
        })}
        error={errors.userId?.message}
        placeholder="Votre identifiant"
        required
        autoComplete="username"
      />

      <FormInput
        label="Mot de passe"
        id="password"
        type="password"
        leftIcon={<LockIcon className="h-5 w-5" />}
        register={register("password", { 
          required: "Le mot de passe est requis" 
        })}
        error={errors.password?.message}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      <Button 
        type="submit" 
        variant="primary" 
        fullWidth 
        loading={isSubmitting}
      >
        Se connecter
      </Button>
    </form>
  );
}
```

## Styles et États

### États de l'Input

| État | Apparence |
|------|-----------|
| **Normal** | Bordure grise, focus bleu |
| **Erreur** | Bordure rouge, focus rouge, texte rouge, message d'erreur |
| **Disabled** | Fond gris clair, curseur interdit |

### Classes CSS Appliquées

**Input de base :**
```css
block w-full py-3 border rounded-lg shadow-sm 
focus:outline-none focus:ring-2 transition-colors
```

**État normal :**
```css
border-gray-300 focus:ring-blue-500 focus:border-blue-500
```

**État erreur :**
```css
border-red-300 focus:ring-red-500 focus:border-red-500 
text-red-900 placeholder-red-300
```

**État disabled :**
```css
bg-gray-50 text-gray-500 cursor-not-allowed
```

### Icônes

- **Taille recommandée** : `h-5 w-5`
- **Couleur normale** : `text-gray-400`
- **Couleur erreur** : `text-red-400`

## Bonnes Pratiques

### ✅ À Faire

1. **Toujours fournir un `id` unique**
   ```tsx
   <FormInput id="email" label="Email" />
   ```

2. **Utiliser les types appropriés**
   ```tsx
   <FormInput type="email" ... />  {/* Pour emails */}
   <FormInput type="password" ... />  {/* Pour mots de passe */}
   <FormInput type="tel" ... />  {/* Pour téléphones */}
   ```

3. **Ajouter l'attribut `required` pour les champs obligatoires**
   ```tsx
   <FormInput label="Email" required ... />
   ```

4. **Utiliser `autoComplete` pour améliorer l'UX**
   ```tsx
   <FormInput autoComplete="email" ... />
   <FormInput autoComplete="current-password" ... />
   ```

5. **Validation côté react-hook-form**
   ```tsx
   register("email", {
     required: "Champ requis",
     pattern: { value: /regex/, message: "Format invalide" }
   })
   ```

### ❌ À Éviter

1. **Ne pas oublier le prop `error`**
   ```tsx
   {/* ❌ Mauvais */}
   <FormInput register={register("email")} />
   
   {/* ✅ Bon */}
   <FormInput 
     register={register("email")} 
     error={errors.email?.message} 
   />
   ```

2. **Ne pas dupliquer la validation**
   ```tsx
   {/* ❌ Mauvais - validation HTML + react-hook-form */}
   <FormInput 
     required 
     register={register("email", { required: true })} 
   />
   
   {/* ✅ Bon - validation react-hook-form uniquement */}
   <FormInput 
     register={register("email", { required: "Requis" })} 
     error={errors.email?.message}
     required  {/* Juste pour l'affichage de l'astérisque */}
   />
   ```

3. **Ne pas utiliser d'ID génériques**
   ```tsx
   {/* ❌ Mauvais */}
   <FormInput id="input" ... />
   
   {/* ✅ Bon */}
   <FormInput id="user-email" ... />
   ```

## Accessibilité

Le composant implémente les bonnes pratiques d'accessibilité :

### Attributs ARIA

- **`aria-invalid`** : Défini automatiquement à `true` quand `error` est présent
- **`aria-describedby`** : Lie l'input au message d'erreur
- **`htmlFor`** : Le label est correctement lié à l'input via l'`id`

### Navigation Clavier

- **Tab** : Navigation entre les champs
- **Enter** : Soumission du formulaire (comportement natif)
- **Espace** : Toggle pour les boutons dans `rightElement`

### Lecteurs d'Écran

```tsx
{/* Le lecteur d'écran annoncera : */}
<FormInput
  label="Email"
  id="email"
  required
  error="Format invalide"
/>
{/* 
  "Email, champ requis, invalide"
  "Format invalide"
*/}
```

### Contraste des Couleurs

- ✅ Texte normal : respecte WCAG AA (4.5:1)
- ✅ Messages d'erreur : rouge foncé sur fond blanc
- ✅ Placeholder : gris suffisamment contrasté

## Migration depuis Input Standard

**Avant (HTML natif) :**
```tsx
<div>
  <label htmlFor="email">Email *</label>
  <input 
    id="email" 
    type="email"
    {...register("email")}
    className="border rounded px-3 py-2"
  />
  {errors.email && <p className="text-red-500">{errors.email.message}</p>}
</div>
```

**Après (FormInput) :**
```tsx
<FormInput
  label="Email"
  id="email"
  type="email"
  register={register("email")}
  error={errors.email?.message}
  required
/>
```

**Réduction de code : ~70% (de 7 lignes à 2 lignes)**

## Performance

- ✅ Pas de re-render inutile (props atomiques)
- ✅ Classes CSS calculées une seule fois
- ✅ Compatible avec React.memo si nécessaire

## Compatibilité

- ✅ React 18+
- ✅ react-hook-form 7+
- ✅ TypeScript
- ✅ Tailwind CSS 3+

## Voir Aussi

- [Button Component](./Button.md)
- [Modal Component](./Modal.md)
- [react-hook-form Documentation](https://react-hook-form.com/)