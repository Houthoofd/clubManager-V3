# 📋 Forms Components - Design System

> Composants de formulaire cohérents et accessibles utilisant les tokens de design FORM et INPUT.

---

## 📦 Composants disponibles

### 🎯 Composants principaux

| Composant | Description | Tokens utilisés |
|-----------|-------------|----------------|
| **FormField** | Wrapper pour champs de formulaire avec label, erreur et aide | `FORM.*` |
| **Input** | Champ de saisie avec icônes et états | `INPUT.*` |
| **SearchBar** | Barre de recherche avec icône et bouton clear | `FORM.search*` |
| **SelectField** | Menu déroulant stylisé | `FORM.select*` |
| **DateRangePicker** | Sélecteur de plage de dates | `FORM.date*` |

---

## 🚀 Installation et imports

```tsx
// Import global depuis le barrel export
import { FormField, Input } from '@/shared/components';

// Import spécifique depuis le dossier Forms
import { FormField, Input, SearchBar, SelectField } from '@/shared/components/Forms';

// Import des tokens (si besoin)
import { FORM, INPUT } from '@/shared/styles/designTokens';
```

---

## 📖 Guide d'utilisation

### 1. FormField - Champ de formulaire complet

Le composant `FormField` encapsule un champ de formulaire avec son label, ses messages d'erreur et d'aide.

#### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `id` | `string` | *requis* | ID unique du champ (pour accessibilité) |
| `label` | `string` | *requis* | Texte du label |
| `required` | `boolean` | `false` | Affiche un astérisque rouge (*) |
| `optional` | `boolean` | `false` | Affiche "(optionnel)" |
| `error` | `string` | - | Message d'erreur (remplace helpText) |
| `helpText` | `string` | - | Texte d'aide descriptif |
| `icon` | `ReactNode` | - | Icône à gauche du label |
| `inline` | `boolean` | `false` | Affichage inline (label à côté) |
| `children` | `ReactNode` | *requis* | Champ input/select/textarea |
| `className` | `string` | - | Classes CSS additionnelles |

#### Exemples

**Champ requis simple :**
```tsx
<FormField id="email" label="Email" required>
  <Input type="email" id="email" placeholder="vous@exemple.com" />
</FormField>
```

**Champ optionnel avec aide :**
```tsx
<FormField 
  id="phone" 
  label="Téléphone" 
  optional
  helpText="Format international recommandé"
>
  <Input type="tel" id="phone" placeholder="+33 6 12 34 56 78" />
</FormField>
```

**Avec erreur de validation :**
```tsx
<FormField 
  id="password" 
  label="Mot de passe" 
  required
  error={errors.password?.message}
>
  <Input type="password" id="password" />
</FormField>
```

**Avec icône :**
```tsx
<FormField 
  id="username" 
  label="Nom d'utilisateur" 
  required
  icon={<UserIcon className="h-4 w-4" />}
>
  <Input id="username" />
</FormField>
```

---

### 2. Input - Champ de saisie

Le composant `Input` est un champ de saisie avec support d'icônes, d'états et de tailles.

#### Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `leftIcon` | `ReactNode` | - | Icône à gauche |
| `rightIcon` | `ReactNode` | - | Icône à droite |
| `error` | `string` | - | Message d'erreur (border rouge + message) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Taille du champ |
| `className` | `string` | - | Classes CSS additionnelles |
| `...props` | `InputHTMLAttributes` | - | Toutes les props HTML natives |

#### Exemples

**Input simple :**
```tsx
<Input 
  type="text" 
  placeholder="Entrez votre nom"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Avec icône de recherche :**
```tsx
<Input
  type="search"
  placeholder="Rechercher..."
  leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
/>
```

**Avec double icône :**
```tsx
<Input
  type="email"
  placeholder="email@exemple.com"
  leftIcon={<EnvelopeIcon className="h-5 w-5 text-gray-400" />}
  rightIcon={<CheckIcon className="h-5 w-5 text-green-500" />}
/>
```

**Tailles différentes :**
```tsx
<Input size="sm" placeholder="Petit" />
<Input size="md" placeholder="Moyen (défaut)" />
<Input size="lg" placeholder="Grand" />
```

**Avec erreur inline :**
```tsx
<Input
  type="text"
  placeholder="Nom d'utilisateur"
  error="Ce nom d'utilisateur est déjà pris"
/>
```

---

## 🎨 Design Tokens

Les composants utilisent les tokens de design centralisés dans `designTokens.ts`.

### FORM Tokens

```typescript
FORM.field              // Wrapper du champ
FORM.label              // Label standard
FORM.labelRequired      // Label avec astérisque (*)
FORM.labelOptional      // Label avec "(optionnel)"
FORM.helpText           // Texte d'aide (gris)
FORM.errorText          // Message d'erreur (rouge + icône)
FORM.successText        // Message de succès (vert + icône)
```

### INPUT Tokens

```typescript
INPUT.base              // Styles de base
INPUT.size.sm           // Petite taille
INPUT.size.md           // Taille moyenne
INPUT.size.lg           // Grande taille
INPUT.error             // État d'erreur (border rouge)
INPUT.success           // État de succès (border verte)
INPUT.disabled          // État désactivé
INPUT.withIconLeft      // Padding pour icône gauche
INPUT.withIconRight     // Padding pour icône droite
INPUT.iconLeft          // Position icône gauche
INPUT.iconRight         // Position icône droite
```

---

## 🔥 Patterns courants

### Formulaire avec React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { FormField, Input } from '@/shared/components/Forms';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField 
        id="email" 
        label="Email" 
        required
        error={errors.email?.message}
      >
        <Input
          type="email"
          id="email"
          {...register('email', {
            required: 'Email requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide'
            }
          })}
        />
      </FormField>

      <FormField 
        id="password" 
        label="Mot de passe" 
        required
        error={errors.password?.message}
        helpText="Au moins 8 caractères"
      >
        <Input
          type="password"
          id="password"
          rightIcon={<LockIcon className="h-5 w-5" />}
          {...register('password', {
            required: 'Mot de passe requis',
            minLength: {
              value: 8,
              message: 'Minimum 8 caractères'
            }
          })}
        />
      </FormField>

      <Button type="submit" fullWidth>Connexion</Button>
    </form>
  );
}
```

### Formulaire de recherche

```tsx
import { useState } from 'react';
import { Input } from '@/shared/components/Forms';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <Input
      type="search"
      size="lg"
      placeholder="Rechercher un membre..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
    />
  );
}
```

### Formulaire de profil

```tsx
function ProfileForm() {
  return (
    <div className="space-y-6">
      <FormField id="firstName" label="Prénom" required>
        <Input id="firstName" placeholder="Jean" />
      </FormField>

      <FormField id="lastName" label="Nom" required>
        <Input id="lastName" placeholder="Dupont" />
      </FormField>

      <FormField 
        id="nickname" 
        label="Surnom" 
        optional
        helpText="Comment souhaitez-vous être appelé ?"
      >
        <Input id="nickname" placeholder="JD" />
      </FormField>

      <FormField 
        id="bio" 
        label="Biographie" 
        optional
        helpText="Quelques mots sur vous (max 200 caractères)"
      >
        <textarea 
          id="bio" 
          rows={4}
          className={FORM.select}
          placeholder="Je suis passionné de..."
        />
      </FormField>
    </div>
  );
}
```

---

## ♿ Accessibilité

Les composants respectent les normes **WCAG 2.1 AA** :

- ✅ **Labels associés** : `htmlFor` + `id` pour navigation clavier
- ✅ **Messages d'erreur** : `role="alert"` pour lecteurs d'écran
- ✅ **Focus visible** : Ring bleu au focus
- ✅ **Contraste** : Ratio de contraste minimum 4.5:1
- ✅ **États visuels** : Erreur, succès, désactivé clairement indiqués
- ✅ **Navigation clavier** : Tab, Shift+Tab, Enter fonctionnent

---

## 📚 Documentation complémentaire

- **[REFACTORING_NOTES.md](./REFACTORING_NOTES.md)** - Détails techniques de la refactorisation
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guide pour migrer depuis les anciens composants
- **[FormField.md](./FormField.md)** - Documentation détaillée de FormField
- **[SearchBar.md](./SearchBar.md)** - Documentation détaillée de SearchBar

---

## 🧪 Tests

Les composants sont testés avec :
- **React Testing Library** pour les tests unitaires
- **Storybook** pour les tests visuels
- **Jest** pour les tests de régression

---

## 🔧 Maintenance

Pour modifier les styles des composants Forms :

1. **Éditer les tokens** dans `frontend/src/shared/styles/designTokens.ts`
2. Les changements se propagent automatiquement à tous les composants
3. Pas besoin de modifier les composants individuellement

Exemple :
```typescript
// designTokens.ts
export const FORM = {
  errorText: "text-xs text-red-600 mt-1 flex items-center gap-1", // ← Modifier ici
  // ...
} as const;
```

---

## 🎯 Bonnes pratiques

### ✅ À faire

- Toujours utiliser `FormField` pour wrapper les inputs dans les formulaires
- Utiliser la prop `required` au lieu d'ajouter manuellement l'astérisque
- Préférer `error` au lieu de gérer manuellement l'affichage d'erreurs
- Utiliser les tokens pour les styles customs (`FORM.*`, `INPUT.*`)

### ❌ À éviter

- Ne pas créer de wrappers custom autour de `FormField`
- Ne pas dupliquer les styles inline, utiliser les tokens
- Ne pas oublier l'attribut `id` sur les inputs (accessibilité)
- Ne pas utiliser `size` native HTML avec Input (conflit TypeScript résolu)

---

## 📦 Export

Tous les composants sont exportés depuis :

```tsx
// Barrel export principal
export * from './Forms';

// Composants disponibles
export { FormField } from './FormField';
export { Input } from '../Input';
export { SearchBar } from './SearchBar';
export { SelectField } from './SelectField';
export { DateRangePicker } from './DateRangePicker';

// Types
export type { FormFieldProps } from './FormField';
export type { InputProps } from '../Input';
// ...
```

---

## 🤝 Contribution

Pour contribuer à ces composants :

1. Lire la documentation complète
2. Respecter les tokens de design existants
3. Ajouter des tests pour les nouvelles fonctionnalités
4. Mettre à jour la documentation

---

## 📝 Changelog

### v2.0.0 - Refactorisation FORM & INPUT tokens (Janvier 2024)
- ✨ Ajout des tokens FORM et INPUT dans designTokens
- ✨ Nouvelle prop `optional` pour FormField
- ✨ Nouvelle prop `size` pour Input
- 🎨 Refactorisation complète des styles avec tokens
- 📝 Documentation complète et guides de migration
- ♿ Améliorations accessibilité (icônes SVG, role="alert")
- 🐛 Correction du conflit TypeScript sur la prop `size`

---

**Dernière mise à jour : Janvier 2024**  
**Mainteneur : Équipe Frontend**