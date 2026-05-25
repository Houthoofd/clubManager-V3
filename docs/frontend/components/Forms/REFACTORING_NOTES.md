# Refactorisation Forms & Input - Tokens FORM & INPUT

## 📅 Date : Janvier 2024

## 🎯 Objectif

Refactoriser les composants `FormField.tsx` et `Input.tsx` pour utiliser les nouveaux tokens de design `FORM` et `INPUT` définis dans `designTokens.ts`, garantissant ainsi une cohérence visuelle et une maintenance facilitée.

---

## ✨ Changements apportés

### 1. **FormField.tsx** - Utilisation des tokens FORM

#### Avant (classes inline) :
```tsx
<div className="space-y-1.5">
  <label className="flex items-center text-sm font-medium text-gray-700">
    {label}
    {required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
</div>
```

#### Après (avec tokens FORM) :
```tsx
<div className={cn(FORM.field, className)}>
  <label htmlFor={id} className={FORM.labelRequired}>
    {label}
  </label>
  {error && <p className={FORM.errorText}>{error}</p>}
  {helpText && <p className={FORM.helpText}>{helpText}</p>}
</div>
```

#### Nouvelles fonctionnalités :
- ✅ Ajout de la prop `optional` : affiche "(optionnel)" après le label
- ✅ Gestion intelligente du label (required/optional/normal)
- ✅ Icône d'erreur SVG intégrée dans le message d'erreur
- ✅ Utilisation des tokens `FORM.field`, `FORM.label`, `FORM.labelRequired`, `FORM.labelOptional`

---

### 2. **Input.tsx** - Utilisation des tokens INPUT

#### Avant (classes inline complexes) :
```tsx
<input
  className={cn(
    'block w-full rounded-lg text-sm transition-colors',
    'placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-blue-500',
    leftIcon ? 'pl-9' : 'pl-3',
    rightIcon ? 'pr-9' : 'pr-3',
    'py-2.5',
    error ? 'border-red-300 focus:border-red-500' : 'border-gray-300',
    disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed'
  )}
/>
```

#### Après (avec tokens INPUT) :
```tsx
<input
  className={cn(
    INPUT.base,
    INPUT.size[size],
    leftIcon ? INPUT.withIconLeft : undefined,
    rightIcon ? INPUT.withIconRight : undefined,
    error ? INPUT.error : undefined,
    disabled ? INPUT.disabled : undefined,
    className
  )}
/>
```

#### Nouvelles fonctionnalités :
- ✅ Ajout de la prop `size` : 'sm' | 'md' | 'lg'
- ✅ Tokens pour icônes gauche/droite : `INPUT.iconLeft`, `INPUT.iconRight`
- ✅ Résolution du conflit TypeScript avec la prop native `size` via `Omit`
- ✅ Icône d'erreur SVG intégrée dans le message d'erreur
- ✅ Utilisation des tokens `INPUT.base`, `INPUT.error`, `INPUT.disabled`

---

## 📦 Tokens utilisés

### FORM tokens (`designTokens.ts`)
```typescript
FORM.field              // "space-y-2"
FORM.fieldInline        // "flex items-center gap-4"
FORM.label              // "block text-sm font-medium text-gray-700"
FORM.labelRequired      // Avec astérisque rouge après
FORM.labelOptional      // Avec "(optionnel)" après
FORM.helpText           // "text-xs text-gray-500 mt-1"
FORM.errorText          // "text-xs text-red-600 mt-1 flex items-center gap-1"
FORM.successText        // "text-xs text-green-600 mt-1 flex items-center gap-1"
```

### INPUT tokens (`designTokens.ts`)
```typescript
INPUT.base              // Styles de base de l'input
INPUT.size.sm           // "px-3 py-1.5 text-sm"
INPUT.size.md           // "px-3 py-2.5 text-sm"
INPUT.size.lg           // "px-4 py-3 text-base"
INPUT.error             // Border rouge pour état d'erreur
INPUT.success           // Border verte pour état de succès
INPUT.disabled          // Styles pour input désactivé
INPUT.withIconLeft      // "pl-10"
INPUT.withIconRight     // "pr-10"
INPUT.iconLeft          // Position de l'icône gauche
INPUT.iconRight         // Position de l'icône droite
```

---

## 🚀 Exemples d'utilisation

### FormField avec champ requis
```tsx
<FormField id="email" label="Adresse email" required>
  <Input type="email" id="email" placeholder="vous@exemple.com" />
</FormField>
```

### FormField avec champ optionnel
```tsx
<FormField id="phone" label="Téléphone" optional>
  <Input type="tel" id="phone" placeholder="+33 6 12 34 56 78" />
</FormField>
```

### Input avec icônes et taille
```tsx
<Input
  type="search"
  placeholder="Rechercher..."
  size="lg"
  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
/>
```

### Input avec erreur
```tsx
<Input
  type="text"
  placeholder="Nom d'utilisateur"
  error="Ce champ est requis"
/>
```

### Exemple complet
```tsx
<FormField 
  id="password" 
  label="Mot de passe" 
  required 
  error={errors.password}
  helpText="Au moins 8 caractères"
>
  <Input
    type="password"
    id="password"
    size="md"
    placeholder="••••••••"
    rightIcon={<LockIcon className="h-5 w-5" />}
  />
</FormField>
```

---

## ✅ Avantages de la refactorisation

1. **Cohérence visuelle** : Tous les formulaires utilisent les mêmes styles
2. **Maintenance simplifiée** : Modification centralisée dans `designTokens.ts`
3. **Accessibilité** : Messages d'erreur avec rôle `alert` et icônes SVG
4. **TypeScript** : Types stricts et autocomplétion améliorée
5. **Réutilisabilité** : Props claires et documentées
6. **Performance** : Classes CSS optimisées et tokens as const

---

## 📝 Notes techniques

### Résolution du conflit TypeScript `size`
```typescript
// Problème : HTMLInputElement a une prop native 'size' (number)
// Solution : Omit de la prop native pour définir notre prop custom
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
}
```

### Gestion intelligente des labels (FormField)
```typescript
const getLabelClass = () => {
  if (icon) {
    return cn(FORM.label, "flex items-center");
  }
  if (required) return FORM.labelRequired;
  if (optional) return FORM.labelOptional;
  return FORM.label;
};
```

---

## 🔄 Fichiers modifiés

- ✅ `frontend/src/shared/components/Forms/FormField.tsx`
- ✅ `frontend/src/shared/components/Input.tsx`
- ✅ Aucune erreur TypeScript
- ✅ Exports maintenus dans `index.ts`

---

## 🎨 Design System

Ces composants font partie du Design System du projet et respectent les guidelines d'accessibilité WCAG 2.1 AA.

Pour plus d'informations sur les tokens de design, consultez :
- `frontend/src/shared/styles/designTokens.ts`
- Documentation du Design System