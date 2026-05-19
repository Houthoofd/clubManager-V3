# SelectField Component

## Vue d'ensemble

`SelectField` est un composant réutilisable de champ de sélection (dropdown) qui utilise les **tokens FORM** du Design System. Il fournit une interface cohérente avec label, validation, messages d'erreur et accessibilité intégrée.

## Tokens FORM utilisés

Le composant utilise les tokens suivants de `designTokens.ts` :

| Token | Utilisation | Classes CSS |
|-------|-------------|-------------|
| `FORM.field` | Container principal | `space-y-2` |
| `FORM.label` | Label du champ | `block text-sm font-medium text-gray-700` |
| `FORM.labelRequired` | Label avec astérisque rouge | `+ after:content-["*"] after:ml-0.5 after:text-red-500` |
| `FORM.select` | Champ select de base | `block w-full px-3 py-2.5 border border-gray-300 rounded-lg...` |
| `FORM.selectError` | Select en état d'erreur | `border-red-300 focus:ring-red-500...` |
| `FORM.errorText` | Message d'erreur | `text-xs text-red-600 mt-1 flex items-center gap-1` |
| `FORM.helpText` | Texte d'aide | `text-xs text-gray-500 mt-1` |

## Import

```tsx
import { SelectField } from '@/shared/components/Forms';
import type { SelectFieldProps, SelectOption } from '@/shared/components/Forms';
```

## Props

### SelectFieldProps

```typescript
interface SelectFieldProps {
  // Requis
  id: string;                           // ID unique pour accessibilité
  label: string;                        // Label du champ
  options: SelectOption[];              // Liste des options

  // Valeur et changement
  value?: string | number;              // Valeur sélectionnée
  onChange?: (value: string | number) => void;  // Handler de changement

  // États
  required?: boolean;                   // Champ obligatoire (défaut: false)
  disabled?: boolean;                   // Champ désactivé (défaut: false)

  // Validation et feedback
  error?: string;                       // Message d'erreur
  helpText?: string;                    // Texte d'aide

  // UI
  placeholder?: string;                 // Texte placeholder (option vide)
  icon?: ReactNode;                     // Icône à gauche du label
  className?: string;                   // Classes CSS additionnelles

  // Autres props HTML native de <select>
  ...SelectHTMLAttributes
}
```

### SelectOption

```typescript
interface SelectOption {
  value: string | number;    // Valeur de l'option
  label: string;             // Texte affiché
  disabled?: boolean;        // Option désactivée
}
```

## Exemples d'utilisation

### 1. Select simple

```tsx
const roles = [
  { value: 'member', label: 'Membre' },
  { value: 'admin', label: 'Administrateur' },
];

<SelectField
  id="role"
  label="Rôle"
  options={roles}
  value={role}
  onChange={setRole}
/>
```

**Rendu :**
- ✅ Utilise `FORM.field` pour l'espacement
- ✅ Utilise `FORM.label` pour le label
- ✅ Utilise `FORM.select` pour le select

---

### 2. Champ requis avec placeholder

```tsx
<SelectField
  id="country"
  label="Pays"
  placeholder="Sélectionnez un pays"
  options={countries}
  required
  value={country}
  onChange={setCountry}
/>
```

**Rendu :**
- ✅ Astérisque rouge `*` automatique via `FORM.labelRequired`
- ✅ Option vide avec texte placeholder en première position
- ✅ Attribut `required` HTML pour validation native

---

### 3. Avec message d'erreur

```tsx
<SelectField
  id="category"
  label="Catégorie"
  placeholder="Choisissez une catégorie"
  options={categories}
  required
  value={category}
  onChange={setCategory}
  error="Vous devez sélectionner une catégorie"
/>
```

**Rendu :**
- ✅ `FORM.selectError` appliqué → bordure rouge
- ✅ `FORM.errorText` pour le message → texte rouge
- ✅ `aria-invalid="true"` pour accessibilité
- ✅ `aria-describedby` pointe vers le message d'erreur

---

### 4. Avec texte d'aide

```tsx
<SelectField
  id="plan"
  label="Plan tarifaire"
  options={plans}
  value={plan}
  onChange={setPlan}
  helpText="Vous pourrez changer de plan à tout moment"
/>
```

**Rendu :**
- ✅ `FORM.helpText` appliqué → texte gris informatif
- ✅ `aria-describedby` pointe vers le texte d'aide

---

### 5. Avec options désactivées

```tsx
const plans = [
  { value: 'free', label: 'Gratuit' },
  { value: 'basic', label: 'Basic - 9€/mois' },
  { value: 'pro', label: 'Pro - 29€/mois', disabled: true },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];

<SelectField
  id="plan"
  label="Plan"
  options={plans}
  value={plan}
  onChange={setPlan}
/>
```

**Rendu :**
- ✅ Options "Pro" et "Enterprise" visibles mais non sélectionnables
- ✅ Attribut `disabled` sur les `<option>`

---

### 6. Avec icône

```tsx
import { GlobeIcon } from '@heroicons/react/24/outline';

<SelectField
  id="country"
  label="Pays"
  icon={<GlobeIcon />}
  placeholder="Sélectionnez un pays"
  options={countries}
  helpText="Votre pays de résidence"
/>
```

**Rendu :**
- ✅ Icône affichée à gauche du label
- ✅ Label utilise toujours `FORM.label` avec `flex items-center`

---

### 7. État désactivé

```tsx
<SelectField
  id="role"
  label="Rôle"
  options={roles}
  value="member"
  disabled
  helpText="Votre rôle est défini par l'administrateur"
/>
```

**Rendu :**
- ✅ Select non modifiable
- ✅ Fond grisé, curseur `not-allowed`
- ✅ Opacité réduite (60%)

---

## Accessibilité

Le composant respecte les normes WCAG 2.1 :

| Attribut | Utilisation |
|----------|-------------|
| `htmlFor` | Association label ↔ select via `id` |
| `aria-invalid` | `"true"` si erreur, sinon `"false"` |
| `aria-describedby` | Pointe vers message d'erreur ou d'aide |
| `role="alert"` | Sur message d'erreur pour lecteurs d'écran |
| `aria-hidden="true"` | Sur icônes décoratives |
| `required` | Validation native HTML |

## Validation

### Validation côté client

```tsx
const [category, setCategory] = useState('');
const [error, setError] = useState('');

const handleSubmit = () => {
  if (!category) {
    setError('Vous devez sélectionner une catégorie');
    return;
  }
  // Traiter le formulaire...
};

<SelectField
  id="category"
  label="Catégorie"
  options={categories}
  required
  value={category}
  onChange={(val) => {
    setCategory(val);
    setError(''); // Effacer l'erreur au changement
  }}
  error={error}
/>
```

### Validation avec React Hook Form

```tsx
import { useForm, Controller } from 'react-hook-form';

const { control, formState: { errors } } = useForm();

<Controller
  name="category"
  control={control}
  rules={{ required: 'La catégorie est obligatoire' }}
  render={({ field }) => (
    <SelectField
      id="category"
      label="Catégorie"
      options={categories}
      required
      error={errors.category?.message}
      {...field}
    />
  )}
/>
```

## Comparaison Avant/Après refactoring

### ❌ Avant (classes hardcodées)

```tsx
<label className="flex items-center text-sm font-medium text-gray-700">
  {label}
</label>

<select className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg...">
  {/* options */}
</select>

<p className="text-xs text-red-600">{error}</p>
<p className="text-xs text-gray-500">{helpText}</p>
```

**Problèmes :**
- ❌ Classes Tailwind dupliquées partout
- ❌ Difficile de maintenir la cohérence
- ❌ Modifications nécessitent de toucher tous les fichiers

---

### ✅ Après (tokens FORM)

```tsx
<label className={FORM.label}>
  {label}
</label>

<select className={cn(FORM.select, error && FORM.selectError)}>
  {/* options */}
</select>

<p className={FORM.errorText}>{error}</p>
<p className={FORM.helpText}>{helpText}</p>
```

**Avantages :**
- ✅ Tokens centralisés dans `designTokens.ts`
- ✅ Cohérence garantie dans toute l'app
- ✅ Modifications en un seul endroit
- ✅ Facilite le theming et la maintenance

---

## Bonnes pratiques

### ✅ À faire

```tsx
// 1. Toujours fournir un ID unique
<SelectField id="user-role" label="Rôle" options={roles} />

// 2. Utiliser required pour champs obligatoires
<SelectField id="country" label="Pays" options={countries} required />

// 3. Fournir un placeholder explicite
<SelectField
  id="category"
  label="Catégorie"
  placeholder="Sélectionnez une catégorie"
  options={categories}
/>

// 4. Afficher des messages d'erreur clairs
<SelectField
  id="plan"
  label="Plan"
  options={plans}
  error="Le plan Pro nécessite une mise à niveau"
/>

// 5. Ajouter helpText pour guider l'utilisateur
<SelectField
  id="language"
  label="Langue"
  options={languages}
  helpText="Langue d'affichage de l'interface"
/>
```

### ❌ À éviter

```tsx
// 1. Ne pas omettre l'ID
<SelectField label="Rôle" options={roles} /> // ❌ Mauvais

// 2. Ne pas utiliser de valeurs d'ID non uniques
<SelectField id="select" label="Rôle" options={roles} /> // ❌ Trop générique

// 3. Ne pas oublier le placeholder sur champs requis
<SelectField id="country" label="Pays" options={countries} required />
// ❌ L'utilisateur ne peut pas "désélectionner"

// 4. Ne pas mettre d'erreur ET de helpText en même temps
<SelectField
  error="Erreur"
  helpText="Aide" // ❌ Le helpText sera masqué
/>
```

---

## Intégration avec le Design System

Ce composant fait partie de la **famille FORM** qui inclut :

- `FormField` - Champ texte générique
- `SelectField` - Champ de sélection (ce composant)
- `SearchBar` - Barre de recherche
- `DateRangePicker` - Sélecteur de plage de dates

Tous utilisent les **mêmes tokens FORM** pour garantir la cohérence visuelle.

---

## Migration depuis l'ancien code

Si vous avez des selects avec classes hardcodées :

```tsx
// Ancien code
<select className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg...">
  <option value="member">Membre</option>
  <option value="admin">Admin</option>
</select>

// Nouveau code
<SelectField
  id="role"
  label="Rôle"
  options={[
    { value: 'member', label: 'Membre' },
    { value: 'admin', label: 'Admin' },
  ]}
  value={role}
  onChange={setRole}
/>
```

---

## Ressources

- [Tokens FORM](../../styles/designTokens.ts#L337-377)
- [Exemples visuels](./SelectField.examples.tsx)
- [Guide de migration](./MIGRATION_GUIDE.md)