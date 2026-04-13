# Input Component

Composants de formulaire réutilisables avec support complet des états, validations, icônes et accessibilité. Inclut : `Input`, `Textarea`, `Select`, `Checkbox`, et `Radio`.

## 📋 Table des matières

- [Installation](#installation)
- [Import](#import)
- [Props](#props)
- [Tailles](#tailles)
- [Exemples](#exemples)
- [États](#états)
- [Features avancées](#features-avancées)
- [Bonnes pratiques](#bonnes-pratiques)
- [Accessibilité](#accessibilité)
- [Intégration react-hook-form](#intégration-react-hook-form)

---

## Installation

Le composant est déjà disponible dans `frontend/src/shared/components/Input.tsx`.

---

## Import

```tsx
import { Input } from '@/shared/components/Input';
```

---

## Props

### Input (champ de saisie)

| Prop                | Type                                      | Défaut | Description                                      |
| ------------------- | ----------------------------------------- | ------ | ------------------------------------------------ |
| `label`             | `string`                                  | -      | Libellé du champ                                 |
| `type`              | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'date' \| 'time' \| 'datetime-local'` | `'text'` | Type du champ |
| `size`              | `'sm' \| 'md' \| 'lg'`                    | `'md'` | Taille du champ                                  |
| `error`             | `string`                                  | -      | Message d'erreur (active l'état error)           |
| `success`           | `string`                                  | -      | Message de succès (active l'état success)        |
| `helperText`        | `string`                                  | -      | Texte d'aide sous le champ                       |
| `iconLeft`          | `ReactNode`                               | -      | Icône à gauche                                   |
| `iconRight`         | `ReactNode`                               | -      | Icône à droite                                   |
| `prefix`            | `string`                                  | -      | Préfixe textuel (ex: "https://")                 |
| `suffix`            | `string`                                  | -      | Suffixe textuel (ex: "€")                        |
| `showCharCount`     | `boolean`                                 | `false`| Affiche le compteur de caractères                |
| `required`          | `boolean`                                 | `false`| Affiche * après le label                         |
| `containerClassName`| `string`                                  | `''`   | Classes CSS pour le conteneur                    |
| `labelClassName`    | `string`                                  | `''`   | Classes CSS pour le label                        |
| ...                 | `InputHTMLAttributes`                     | -      | Tous les props HTML natifs sont supportés        |

### Input.Textarea

| Prop                | Type                                      | Défaut | Description                                      |
| ------------------- | ----------------------------------------- | ------ | ------------------------------------------------ |
| `label`             | `string`                                  | -      | Libellé du champ                                 |
| `size`              | `'sm' \| 'md' \| 'lg'`                    | `'md'` | Taille du champ                                  |
| `error`             | `string`                                  | -      | Message d'erreur                                 |
| `success`           | `string`                                  | -      | Message de succès                                |
| `helperText`        | `string`                                  | -      | Texte d'aide                                     |
| `showCharCount`     | `boolean`                                 | `false`| Affiche le compteur de caractères                |
| `required`          | `boolean`                                 | `false`| Affiche * après le label                         |
| ...                 | `TextareaHTMLAttributes`                  | -      | Tous les props HTML natifs sont supportés        |

### Input.Select

| Prop                | Type                                      | Défaut | Description                                      |
| ------------------- | ----------------------------------------- | ------ | ------------------------------------------------ |
| `label`             | `string`                                  | -      | Libellé du champ                                 |
| `size`              | `'sm' \| 'md' \| 'lg'`                    | `'md'` | Taille du champ                                  |
| `error`             | `string`                                  | -      | Message d'erreur                                 |
| `success`           | `string`                                  | -      | Message de succès                                |
| `helperText`        | `string`                                  | -      | Texte d'aide                                     |
| `required`          | `boolean`                                 | `false`| Affiche * après le label                         |
| `options`           | `Array<{value, label, disabled?}>`        | -      | Options du select (alternative à children)       |
| ...                 | `SelectHTMLAttributes`                    | -      | Tous les props HTML natifs sont supportés        |

### Input.Checkbox

| Prop                | Type                                      | Défaut | Description                                      |
| ------------------- | ----------------------------------------- | ------ | ------------------------------------------------ |
| `label`             | `string`                                  | -      | **Requis.** Libellé du checkbox                  |
| `error`             | `string`                                  | -      | Message d'erreur                                 |
| `helperText`        | `string`                                  | -      | Texte d'aide                                     |
| ...                 | `InputHTMLAttributes`                     | -      | Tous les props HTML natifs sont supportés        |

### Input.Radio

| Prop                | Type                                      | Défaut | Description                                      |
| ------------------- | ----------------------------------------- | ------ | ------------------------------------------------ |
| `label`             | `string`                                  | -      | **Requis.** Libellé du radio                     |
| `error`             | `string`                                  | -      | Message d'erreur                                 |
| `helperText`        | `string`                                  | -      | Texte d'aide                                     |
| ...                 | `InputHTMLAttributes`                     | -      | Tous les props HTML natifs sont supportés        |

---

## Tailles

Trois tailles sont disponibles pour tous les composants :

| Taille | Padding       | Font size | Cas d'usage                                |
| ------ | ------------- | --------- | ------------------------------------------ |
| `sm`   | `px-3 py-1.5` | `text-xs` | Formulaires compacts, filtres, tableaux    |
| `md`   | `px-3 py-2.5` | `text-sm` | **Défaut.** La plupart des formulaires     |
| `lg`   | `px-4 py-3`   | `text-base` | Formulaires d'authentification, landing |

---

## Exemples

### 1. Input simple

```tsx
import { Input } from '@/shared/components/Input';

function MyForm() {
  return (
    <Input
      label="Email"
      type="email"
      placeholder="vous@example.com"
      required
    />
  );
}
```

### 2. Input avec erreur

```tsx
<Input
  label="Email"
  type="email"
  value="invalid-email"
  error="L'email n'est pas valide"
  required
/>
```

### 3. Input avec succès

```tsx
<Input
  label="Email"
  type="email"
  value="marie@example.com"
  success="Email valide !"
/>
```

### 4. Input avec texte d'aide

```tsx
<Input
  label="Mot de passe"
  type="password"
  helperText="Au moins 8 caractères, incluant une majuscule et un chiffre"
  required
/>
```

### 5. Input avec icône à gauche

```tsx
import { EnvelopeIcon } from '@heroicons/react/24/outline';

<Input
  label="Email"
  type="email"
  placeholder="vous@example.com"
  iconLeft={<EnvelopeIcon className="h-5 w-5" />}
/>
```

### 6. Input avec icône à droite

```tsx
import { CheckCircleIcon } from '@heroicons/react/24/solid';

<Input
  label="Email"
  type="email"
  value="marie@example.com"
  iconRight={<CheckCircleIcon className="h-5 w-5 text-green-500" />}
  success="Email vérifié"
/>
```

### 7. Input avec préfixe

```tsx
<Input
  label="Site web"
  type="url"
  placeholder="monsite.com"
  prefix="https://"
/>
```

### 8. Input avec suffixe

```tsx
<Input
  label="Prix"
  type="number"
  placeholder="0.00"
  suffix="€"
/>
```

### 9. Input avec compteur de caractères

```tsx
<Input
  label="Nom d'utilisateur"
  type="text"
  maxLength={20}
  showCharCount
  helperText="Choisissez un nom d'utilisateur unique"
/>
```

### 10. Textarea

```tsx
<Input.Textarea
  label="Description"
  rows={4}
  placeholder="Décrivez votre projet..."
  helperText="Soyez aussi précis que possible"
/>
```

### 11. Textarea avec compteur

```tsx
<Input.Textarea
  label="Bio"
  rows={3}
  maxLength={500}
  showCharCount
  placeholder="Parlez-nous de vous..."
/>
```

### 12. Select simple

```tsx
<Input.Select
  label="Rôle"
  required
>
  <option value="">Sélectionner un rôle...</option>
  <option value="admin">Administrateur</option>
  <option value="manager">Gestionnaire</option>
  <option value="member">Membre</option>
</Input.Select>
```

### 13. Select avec options prop

```tsx
<Input.Select
  label="Pays"
  required
  options={[
    { value: '', label: 'Sélectionner un pays...' },
    { value: 'fr', label: 'France' },
    { value: 'be', label: 'Belgique' },
    { value: 'ch', label: 'Suisse' },
  ]}
/>
```

### 14. Checkbox simple

```tsx
<Input.Checkbox
  id="terms"
  label="J'accepte les conditions d'utilisation"
/>
```

### 15. Checkbox avec erreur

```tsx
<Input.Checkbox
  id="newsletter"
  label="Recevoir la newsletter"
  helperText="Nous ne partagerons jamais votre email"
/>
```

### 16. Radio buttons (groupe)

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Genre <span className="text-red-500">*</span>
  </label>
  <Input.Radio
    id="genre-homme"
    name="genre"
    value="homme"
    label="Homme"
  />
  <Input.Radio
    id="genre-femme"
    name="genre"
    value="femme"
    label="Femme"
  />
  <Input.Radio
    id="genre-autre"
    name="genre"
    value="autre"
    label="Autre / Non spécifié"
  />
</div>
```

### 17. Différentes tailles

```tsx
<div className="space-y-4">
  <Input
    label="Small"
    size="sm"
    placeholder="Taille small"
  />
  <Input
    label="Medium (défaut)"
    size="md"
    placeholder="Taille medium"
  />
  <Input
    label="Large"
    size="lg"
    placeholder="Taille large"
  />
</div>
```

---

## États

### État Error

L'état error s'active automatiquement quand la prop `error` contient un message.

```tsx
<Input
  label="Email"
  type="email"
  value="invalid"
  error="Format d'email invalide"
/>
```

**Visuellement :**
- Bordure rouge (`border-red-400`)
- Focus ring rouge (`focus:ring-red-500`)
- Message d'erreur rouge sous le champ

### État Success

L'état success s'active quand la prop `success` contient un message.

```tsx
<Input
  label="Email"
  type="email"
  value="marie@example.com"
  success="Email disponible !"
/>
```

**Visuellement :**
- Bordure verte (`border-green-400`)
- Focus ring vert (`focus:ring-green-500`)
- Message de succès vert sous le champ

### État Disabled

Utilisez la prop `disabled` native.

```tsx
<Input
  label="Champ désactivé"
  disabled
  value="Non modifiable"
/>
```

**Visuellement :**
- Background gris (`bg-gray-50`)
- Texte grisé (`text-gray-500`)
- Curseur interdit (`cursor-not-allowed`)

---

## Features avancées

### Icônes

Ajoutez des icônes à gauche ou à droite du champ.

```tsx
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

<Input
  placeholder="Rechercher..."
  iconLeft={<MagnifyingGlassIcon className="h-5 w-5" />}
  iconRight={<XMarkIcon className="h-5 w-5 cursor-pointer" />}
/>
```

### Prefix / Suffix

Ajoutez du texte fixe avant ou après la saisie.

```tsx
{/* URL avec préfixe */}
<Input
  label="Site web"
  type="url"
  prefix="https://"
  placeholder="example.com"
/>

{/* Prix avec suffixe */}
<Input
  label="Prix"
  type="number"
  suffix="€"
  placeholder="0.00"
/>

{/* Email avec suffixe */}
<Input
  label="Email professionnel"
  type="text"
  suffix="@entreprise.com"
  placeholder="prenom.nom"
/>
```

### Compteur de caractères

Affichez le nombre de caractères saisis.

```tsx
<Input
  label="Titre"
  maxLength={100}
  showCharCount
/>
```

**Note :** Le compteur devient rouge si la limite est dépassée.

### Helper Text

Ajoutez des instructions ou du contexte.

```tsx
<Input
  label="Code postal"
  type="text"
  pattern="[0-9]{5}"
  helperText="Format: 5 chiffres (ex: 75001)"
/>
```

---

## Bonnes pratiques

### ✅ À faire

- **Toujours fournir un label** (sauf exceptions justifiées)
- **Utiliser `required`** pour les champs obligatoires (affiche l'astérisque *)
- **Associer les erreurs** avec la prop `error` pour une meilleure UX
- **Utiliser `helperText`** pour guider l'utilisateur
- **Utiliser `type` approprié** (email, tel, url, etc.) pour le clavier mobile
- **Ajouter `placeholder`** descriptifs
- **Utiliser `maxLength` + `showCharCount`** pour limiter la saisie
- **Toujours fournir un `id`** unique pour chaque champ
- **Utiliser `Input.Select`** plutôt que `<select>` natif
- **Grouper les Radio** avec le même `name`

### ❌ À éviter

- ❌ Ne pas omettre le label (mauvaise accessibilité)
- ❌ Ne pas utiliser `placeholder` comme label (disparaît à la saisie)
- ❌ Ne pas oublier le `name` sur les Radio/Checkbox dans un formulaire
- ❌ Ne pas utiliser `type="text"` pour email/tel/url (mauvaise UX mobile)
- ❌ Ne pas afficher error ET success en même temps (error prime)
- ❌ Ne pas utiliser des messages d'erreur génériques ("Erreur")

---

## Accessibilité

Le composant Input respecte les bonnes pratiques d'accessibilité :

### Labels

- Tous les champs ont un `<label>` associé via `htmlFor` / `id`
- Les champs requis affichent un astérisque visuel `*`
- Les labels sont cliquables (focus sur le champ)

### ARIA

- `aria-invalid="true"` quand une erreur est présente
- `aria-describedby` pointe vers le message d'erreur/succès/aide
- Les messages d'aide ont des IDs uniques générés automatiquement

### États visuels

- **Focus** : Ring bleu de 2px (`focus:ring-2 focus:ring-blue-500`)
- **Error** : Bordure + ring rouge
- **Success** : Bordure + ring vert
- **Disabled** : Opacity réduite + curseur interdit

### Clavier

- **Tab** : Navigation entre les champs
- **Espace** : Toggle les Checkbox/Radio
- **Flèches** : Navigation dans les Select (natif)

### Recommandations

- Utilisez `autoComplete` approprié (email, tel, name, etc.)
- Ajoutez `aria-label` si vous n'avez pas de label visible
- Pour les formulaires complexes, utilisez `<fieldset>` et `<legend>`
- Testez avec un lecteur d'écran (NVDA, JAWS, VoiceOver)

---

## Intégration react-hook-form

### Exemple simple

```tsx
import { useForm } from 'react-hook-form';
import { Input } from '@/shared/components/Input';

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email requis',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Email invalide',
          },
        })}
      />

      <Input
        label="Mot de passe"
        type="password"
        error={errors.password?.message}
        {...register('password', {
          required: 'Mot de passe requis',
          minLength: {
            value: 8,
            message: 'Au moins 8 caractères',
          },
        })}
      />

      <Button type="submit">S'inscrire</Button>
    </form>
  );
}
```

### Avec validation Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/Input';

const schema = z.object({
  firstName: z.string().min(2, 'Au moins 2 caractères'),
  lastName: z.string().min(2, 'Au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  age: z.number().min(18, 'Vous devez avoir 18 ans ou plus'),
  bio: z.string().max(500, 'Maximum 500 caractères'),
  role: z.string().min(1, 'Sélectionnez un rôle'),
  terms: z.boolean().refine((val) => val === true, 'Vous devez accepter'),
});

type FormData = z.infer<typeof schema>;

function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          error={errors.firstName?.message}
          required
          {...register('firstName')}
        />
        <Input
          label="Nom"
          error={errors.lastName?.message}
          required
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="Âge"
        type="number"
        error={errors.age?.message}
        required
        {...register('age', { valueAsNumber: true })}
      />

      <Input.Textarea
        label="Bio"
        rows={4}
        maxLength={500}
        showCharCount
        error={errors.bio?.message}
        {...register('bio')}
      />

      <Input.Select
        label="Rôle"
        error={errors.role?.message}
        required
        {...register('role')}
        options={[
          { value: '', label: 'Sélectionner...' },
          { value: 'admin', label: 'Administrateur' },
          { value: 'user', label: 'Utilisateur' },
        ]}
      />

      <Input.Checkbox
        id="terms"
        label="J'accepte les conditions d'utilisation"
        error={errors.terms?.message}
        {...register('terms')}
      />

      <Button type="submit" loading={isSubmitting}>
        S'inscrire
      </Button>
    </form>
  );
}
```

### Avec Controller (pour les champs contrôlés)

```tsx
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/shared/components/Input';

function MyForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{ required: 'Email requis' }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            label="Email"
            type="email"
            error={fieldState.error?.message}
          />
        )}
      />
    </form>
  );
}
```

---

## Patterns courants

### Formulaire de connexion

```tsx
<div className="space-y-4">
  <Input
    label="Email"
    type="email"
    placeholder="vous@example.com"
    autoComplete="email"
    required
  />
  <Input
    label="Mot de passe"
    type="password"
    placeholder="••••••••"
    autoComplete="current-password"
    required
  />
  <Input.Checkbox
    id="remember"
    label="Se souvenir de moi"
  />
</div>
```

### Formulaire d'inscription

```tsx
<div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <Input label="Prénom" required />
    <Input label="Nom" required />
  </div>
  <Input label="Email" type="email" required />
  <Input
    label="Mot de passe"
    type="password"
    helperText="Au moins 8 caractères"
    required
  />
  <Input
    label="Confirmer le mot de passe"
    type="password"
    required
  />
  <Input.Checkbox
    id="terms"
    label="J'accepte les conditions d'utilisation"
  />
</div>
```

### Recherche avec icône

```tsx
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

<Input
  placeholder="Rechercher..."
  iconLeft={<MagnifyingGlassIcon className="h-5 w-5" />}
  size="sm"
/>
```

### Prix avec devise

```tsx
<div className="grid grid-cols-2 gap-4">
  <Input
    label="Prix minimum"
    type="number"
    suffix="€"
    placeholder="0.00"
  />
  <Input
    label="Prix maximum"
    type="number"
    suffix="€"
    placeholder="999.99"
  />
</div>
```

---

## Ressources

- **Design Tokens** : `frontend/src/shared/styles/designTokens.ts`
- **Composant Button** : `frontend/src/shared/components/Button.tsx`
- **Exemples live** : `frontend/src/shared/components/Input.examples.tsx`
- **react-hook-form** : https://react-hook-form.com/

---

**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe Dev ClubManager V3