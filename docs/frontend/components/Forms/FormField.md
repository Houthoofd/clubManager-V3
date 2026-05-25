# FormField Component

Composant wrapper réutilisable pour gérer les champs de formulaire avec label, validation et messages d'erreur.

## Description

`FormField` fournit une structure cohérente et accessible pour tous les types de champs de formulaire (inputs, selects, textareas). Il gère automatiquement l'association label/input, l'affichage des erreurs, des messages d'aide et des indicateurs de champs requis.

## Import

```tsx
import { FormField } from '@/shared/components/Forms';
// ou
import { FormField } from '@/shared/components/Forms/FormField';
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | - | **Requis**. Identifiant unique du champ pour l'association label/input |
| `label` | `string` | - | **Requis**. Texte du label affiché au-dessus du champ |
| `required` | `boolean` | `false` | Indique si le champ est requis (affiche *) |
| `error` | `string` | - | Message d'erreur à afficher sous le champ en rouge |
| `helpText` | `string` | - | Texte d'aide descriptif affiché en gris (masqué si erreur présente) |
| `icon` | `ReactNode` | - | Icône à afficher à gauche du label |
| `children` | `ReactNode` | - | **Requis**. Composant input/select/textarea à wrapper |
| `className` | `string` | `''` | Classes CSS additionnelles pour le container |

## Utilisation de base

### Champ simple

```tsx
<FormField id="email" label="Email">
  <Input type="email" id="email" />
</FormField>
```

### Champ requis

```tsx
<FormField id="password" label="Mot de passe" required>
  <Input type="password" id="password" />
</FormField>
```

### Avec message d'erreur

```tsx
<FormField 
  id="email" 
  label="Email" 
  required 
  error="Cette adresse email est invalide"
>
  <Input type="email" id="email" />
</FormField>
```

### Avec texte d'aide

```tsx
<FormField 
  id="username" 
  label="Nom d'utilisateur" 
  helpText="3-20 caractères alphanumériques uniquement"
>
  <Input id="username" />
</FormField>
```

### Avec icône

```tsx
import { MailIcon } from '@heroicons/react/24/outline';

<FormField 
  id="email" 
  label="Email" 
  icon={<MailIcon />}
  required
>
  <Input type="email" id="email" />
</FormField>
```

## Exemples avancés

### Avec Select

```tsx
<FormField 
  id="country" 
  label="Pays de résidence" 
  required
  helpText="Sélectionnez votre pays dans la liste"
>
  <select id="country" className="...">
    <option>France</option>
    <option>Belgique</option>
    <option>Suisse</option>
  </select>
</FormField>
```

### Avec Textarea

```tsx
<FormField 
  id="message" 
  label="Message"
  helpText="Décrivez votre demande"
>
  <textarea id="message" rows={4} className="..." />
</FormField>
```

### Formulaire complet

```tsx
function SignupForm() {
  const [errors, setErrors] = useState({});

  return (
    <form className="space-y-4">
      <FormField 
        id="name" 
        label="Nom complet" 
        icon={<UserIcon />}
        required
        error={errors.name}
      >
        <Input id="name" placeholder="Jean Dupont" />
      </FormField>

      <FormField 
        id="email" 
        label="Adresse email" 
        icon={<MailIcon />}
        required
        error={errors.email}
      >
        <Input type="email" id="email" placeholder="jean.dupont@example.com" />
      </FormField>

      <FormField 
        id="password" 
        label="Mot de passe" 
        icon={<LockIcon />}
        required
        helpText="Au moins 8 caractères"
        error={errors.password}
      >
        <Input type="password" id="password" />
      </FormField>

      <Button type="submit">S'inscrire</Button>
    </form>
  );
}
```

## Structure HTML générée

```html
<div class="space-y-1.5">
  <!-- Label -->
  <label for="email" class="flex items-center text-sm font-medium text-gray-700">
    <span class="mr-2 h-4 w-4 flex-shrink-0"><!-- Icon --></span>
    <span>Email</span>
    <span class="ml-0.5 text-red-500">*</span>
  </label>

  <!-- Input wrapper -->
  <div class="mt-1">
    <!-- Children (Input/Select/Textarea) -->
  </div>

  <!-- Feedback -->
  <div class="feedback">
    <p class="mt-1 text-xs text-red-600" role="alert"><!-- Error message --></p>
    <!-- OU -->
    <p class="mt-1 text-xs text-gray-500"><!-- Help text --></p>
  </div>
</div>
```

## Styles appliqués

### Container
- `space-y-1.5` : Espacement vertical entre les éléments

### Label
- `flex items-center` : Alignement horizontal des éléments
- `text-sm font-medium text-gray-700` : Typographie du label

### Icône
- `mr-2 h-4 w-4 flex-shrink-0` : Taille et espacement

### Indicateur requis (*)
- `ml-0.5 text-red-500` : Astérisque rouge

### Message d'erreur
- `mt-1 text-xs text-red-600` : Texte rouge petit
- `role="alert"` : Attribut ARIA pour l'accessibilité

### Texte d'aide
- `mt-1 text-xs text-gray-500` : Texte gris petit

## Accessibilité

### Association label/input
Le composant utilise `htmlFor={id}` pour associer automatiquement le label avec le champ :

```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Messages d'erreur
Les messages d'erreur incluent `role="alert"` pour être annoncés par les lecteurs d'écran :

```tsx
<p role="alert">Message d'erreur</p>
```

### Indicateur de champ requis
L'astérisque inclut un attribut `aria-label` :

```tsx
<span aria-label="requis">*</span>
```

### Bonnes pratiques

1. **ID unique** : Toujours fournir un `id` unique pour chaque champ
2. **Synchronisation** : L'`id` du `FormField` doit correspondre à l'`id` du champ enfant
3. **Messages clairs** : Utiliser des messages d'erreur descriptifs et actionnables
4. **Validation** : Afficher les erreurs seulement après interaction ou soumission

## Intégration avec React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { FormField } from '@/shared/components/Forms';

function MyForm() {
  const { register, formState: { errors }, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="email"
        label="Email"
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide'
            }
          })}
        />
      </FormField>
    </form>
  );
}
```

## Personnalisation

### Classes CSS additionnelles

```tsx
<FormField 
  id="email" 
  label="Email"
  className="my-custom-class"
>
  <Input id="email" />
</FormField>
```

### Icône personnalisée

```tsx
<FormField 
  id="custom" 
  label="Champ personnalisé"
  icon={<CustomIcon className="text-purple-500" />}
>
  <Input id="custom" />
</FormField>
```

## Notes importantes

1. **Priorité des messages** : Le message d'erreur a la priorité sur le texte d'aide
2. **ID synchronisé** : Le `FormField.id` doit toujours correspondre à l'`id` du champ enfant
3. **Children unique** : Le composant attend un seul enfant (input/select/textarea)
4. **Validation visuelle** : Le composant affiche l'erreur mais ne gère pas la logique de validation

## Voir aussi

- [Input Component](../Input/Input.md)
- [Button Component](../Button/Button.md)
- [Design Tokens](../../styles/designTokens.ts)
- [React Hook Form Documentation](https://react-hook-form.com/)

## Exemples visuels

Pour voir tous les exemples en action, consultez :
```tsx
import { FormFieldExamples } from '@/shared/components/Forms/FormField.examples';
```
