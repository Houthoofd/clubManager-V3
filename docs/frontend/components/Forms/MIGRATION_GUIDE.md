# Guide de Migration - FormField & Input

## 📋 Vue d'ensemble

Ce guide vous aidera à migrer vos composants existants vers les nouvelles versions de `FormField` et `Input` qui utilisent les tokens de design `FORM` et `INPUT`.

---

## 🔄 Changements majeurs

### FormField
- ✅ Nouvelle prop `optional` pour afficher "(optionnel)"
- ✅ Les labels utilisent maintenant les tokens FORM
- ✅ Messages d'erreur avec icône SVG intégrée
- ✅ Gestion automatique de l'astérisque pour champs requis

### Input
- ✅ Nouvelle prop `size` : 'sm' | 'md' | 'lg'
- ✅ Styles simplifiés via tokens INPUT
- ✅ Messages d'erreur avec icône SVG intégrée
- ✅ Meilleure gestion des icônes gauche/droite

---

## 🚀 Migration étape par étape

### 1. FormField - Migration simple

#### ❌ Avant
```tsx
<div className="mb-4">
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email
    {isRequired && <span className="text-red-500 ml-1">*</span>}
  </label>
  <Input type="email" id="email" />
  {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  {!error && <p className="mt-1 text-sm text-gray-500">Format: vous@exemple.com</p>}
</div>
```

#### ✅ Après
```tsx
<FormField 
  id="email" 
  label="Email" 
  required
  error={error}
  helpText="Format: vous@exemple.com"
>
  <Input type="email" id="email" />
</FormField>
```

**Changements :**
- Suppression du wrapper `div` custom
- Utilisation de la prop `required` au lieu de l'astérisque manuel
- Props `error` et `helpText` gérées automatiquement

---

### 2. FormField - Champ optionnel

#### ❌ Avant
```tsx
<div className="mb-4">
  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
    Téléphone <span className="text-gray-400 text-xs">(optionnel)</span>
  </label>
  <Input type="tel" id="phone" />
</div>
```

#### ✅ Après
```tsx
<FormField id="phone" label="Téléphone" optional>
  <Input type="tel" id="phone" />
</FormField>
```

**Changements :**
- Utilisation de la prop `optional` pour afficher "(optionnel)" automatiquement

---

### 3. Input - Avec icônes

#### ❌ Avant
```tsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
  </div>
  <input
    type="search"
    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
    placeholder="Rechercher..."
  />
</div>
```

#### ✅ Après
```tsx
<Input
  type="search"
  placeholder="Rechercher..."
  leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
/>
```

**Changements :**
- Suppression du wrapper relatif
- Utilisation de la prop `leftIcon`
- Padding automatique avec le token `INPUT.withIconLeft`

---

### 4. Input - Avec taille personnalisée

#### ❌ Avant
```tsx
<input
  type="text"
  className="block w-full px-4 py-3 text-base border border-gray-300 rounded-lg"
  placeholder="Grande taille"
/>
```

#### ✅ Après
```tsx
<Input
  type="text"
  size="lg"
  placeholder="Grande taille"
/>
```

**Changements :**
- Utilisation de la prop `size` au lieu de classes inline
- Valeurs : 'sm', 'md' (défaut), 'lg'

---

### 5. Input - Avec erreur inline

#### ❌ Avant
```tsx
<div>
  <input
    type="text"
    className={`block w-full px-3 py-2 border rounded-lg ${
      error ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
    }`}
  />
  {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
</div>
```

#### ✅ Après
```tsx
<Input
  type="text"
  error={error}
/>
```

**Changements :**
- Border rouge automatique via token `INPUT.error`
- Message d'erreur avec icône SVG inclus

---

### 6. Exemple complet - Formulaire de connexion

#### ❌ Avant
```tsx
<form>
  <div className="space-y-4">
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
        Email <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative">
        <input
          type="email"
          id="email"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
          {...register('email')}
        />
      </div>
      {errors.email && (
        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
      )}
    </div>

    <div>
      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
        Mot de passe <span className="text-red-500">*</span>
      </label>
      <div className="mt-1">
        <input
          type="password"
          id="password"
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
          {...register('password')}
        />
      </div>
      {errors.password && (
        <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">Au moins 8 caractères</p>
    </div>
  </div>
</form>
```

#### ✅ Après
```tsx
<form>
  <div className="space-y-4">
    <FormField 
      id="email" 
      label="Email" 
      required
      error={errors.email?.message}
    >
      <Input
        type="email"
        id="email"
        {...register('email')}
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
        {...register('password')}
      />
    </FormField>
  </div>
</form>
```

**Avantages :**
- 📉 Réduction de ~50% de lignes de code
- 🎨 Cohérence visuelle garantie par les tokens
- ♿ Accessibilité améliorée (labels, aria, erreurs)
- 🔧 Maintenance simplifiée

---

## 📝 Checklist de migration

### Pour chaque formulaire :

- [ ] Remplacer les `<div>` + `<label>` par `<FormField>`
- [ ] Utiliser `required` au lieu de `<span>*</span>` manuel
- [ ] Utiliser `optional` pour les champs optionnels
- [ ] Remplacer `error && <p>` par la prop `error`
- [ ] Remplacer les textes d'aide par la prop `helpText`
- [ ] Supprimer les wrappers relatifs pour les icônes
- [ ] Utiliser `leftIcon` / `rightIcon` dans Input
- [ ] Ajouter la prop `size` si nécessaire
- [ ] Supprimer les classes CSS inline
- [ ] Tester l'accessibilité (navigation clavier, lecteurs d'écran)

---

## 🐛 Problèmes courants

### 1. TypeScript - Conflit avec la prop `size`

**Erreur :**
```
Type '"sm"' is not assignable to type 'number | undefined'
```

**Solution :**
Le composant Input utilise maintenant `size?: 'sm' | 'md' | 'lg'` au lieu de la prop native HTML `size` (number). Pas d'action requise, c'est voulu !

### 2. Styles ne s'appliquent pas

**Problème :** Les styles des tokens ne s'appliquent pas.

**Solution :** Vérifiez que `designTokens.ts` est bien importé et que Tailwind CSS est configuré correctement.

### 3. Message d'erreur ne s'affiche pas

**Problème :** La prop `error` ne montre rien.

**Solution :** Vérifiez que la valeur de `error` est une chaîne de caractères (string) et non `undefined` ou `null`.

---

## 🎯 Bonnes pratiques

### 1. Toujours utiliser FormField pour les formulaires
```tsx
// ✅ Bon
<FormField id="email" label="Email" required>
  <Input type="email" id="email" />
</FormField>

// ❌ Éviter
<div>
  <label>Email</label>
  <Input type="email" />
</div>
```

### 2. Gérer les erreurs proprement
```tsx
// ✅ Bon - Avec React Hook Form
<FormField 
  id="email" 
  label="Email" 
  required
  error={errors.email?.message}
>
  <Input type="email" id="email" {...register('email')} />
</FormField>

// ✅ Bon - Avec state local
<FormField 
  id="email" 
  label="Email" 
  required
  error={emailError || undefined}
>
  <Input type="email" id="email" value={email} onChange={handleChange} />
</FormField>
```

### 3. Choisir la bonne taille
```tsx
// Petit (recherche, filtres)
<Input size="sm" placeholder="Rechercher..." />

// Moyen (défaut, formulaires standards)
<Input size="md" placeholder="Email" />

// Grand (champs importants, call-to-action)
<Input size="lg" placeholder="Créer votre compte" />
```

---

## 📚 Ressources

- **Design Tokens** : `frontend/src/shared/styles/designTokens.ts`
- **Exemples** : `frontend/src/shared/components/Forms/FormField.examples.tsx`
- **Documentation** : `frontend/src/shared/components/Forms/FormField.md`
- **Notes de refactoring** : `frontend/src/shared/components/Forms/REFACTORING_NOTES.md`

---

## 💬 Support

Pour toute question ou problème lors de la migration, consultez :
- Les exemples dans le dossier `Forms/`
- La documentation des tokens dans `designTokens.ts`
- L'équipe de développement frontend

---

**Bonne migration ! 🚀**