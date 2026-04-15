# 🎯 PLAN D'ACTION OPTIMISÉ - Maintenabilité, Cohérence, Architecture & Accessibilité

**Date de création:** 2024-12  
**Objectif:** Améliorer les 4 piliers critiques de qualité  
**Durée:** 7 semaines  
**Effort total:** 52h

---

## 📊 SCORES ACTUELS vs CIBLES

| Pilier | Score Actuel | Score Cible | Priorité |
|--------|-------------|-------------|----------|
| **Maintenabilité** | 🔴 12/20 | 🟢 18/20 | 🔥 CRITIQUE |
| **Cohérence** | 🔴 11/20 | 🟢 18/20 | 🔥 CRITIQUE |
| **Architecture** | 🟡 16/20 | 🟢 18/20 | 🟠 IMPORTANT |
| **Accessibilité** | 🟡 14/20 | 🟢 19/20 | 🟠 IMPORTANT |

---

## 🎯 STRATÉGIE GLOBALE

### Principe Directeur
**"Un seul chemin pour faire chaque chose"**

Au lieu de :
- ❌ 3 façons de créer un badge
- ❌ 2 façons de créer un modal
- ❌ 2 façons de créer une alerte

On aura :
- ✅ 1 composant Badge officiel
- ✅ 1 composant Modal officiel
- ✅ 1 composant AlertBanner officiel

### Impact Attendu

```
┌──────────────────────────────────────────────────────────────┐
│  AVANT (État actuel)                                         │
│  ────────────────────────────────────────────────────────    │
│  Modifier un style button → 3 fichiers (Button + IconButton) │
│  Créer un modal → Copier-coller 80 lignes                    │
│  Nouvelle page → 2h (réinventer composants)                  │
│  Bug accessibilité → 5 endroits à corriger                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  APRÈS (Cible)                                               │
│  ────────────────────────────────────────────────────────    │
│  Modifier un style button → 1 fichier (design tokens)        │
│  Créer un modal → <Modal> (5 lignes)                         │
│  Nouvelle page → 1h (réutiliser composants)                  │
│  Bug accessibilité → 1 composant shared à corriger           │
└──────────────────────────────────────────────────────────────┘
```

---

## 🏗️ PHASE 1 - FONDATIONS (Semaines 1-2)

**Objectif:** Éliminer les ambiguïtés et établir la source de vérité

### 🔥 Action 1.1 : Supprimer les Doublons (4h)

**Impact sur les piliers:**
- Cohérence: +3 points
- Maintenabilité: +2 points
- Architecture: +1 point

#### Tâche 1.1.1 : StatusBadge.tsx (30 min)
```bash
# Vérification
grep -r "StatusBadge" frontend/src/features/

# Si aucun usage trouvé
rm frontend/src/shared/components/badges/StatusBadge.tsx

# Documenter
echo "⚠️ DÉPRÉCIÉ : Utiliser Badge.Status à la place" >> CHANGELOG.md
```

**Checklist:**
- [ ] Vérifier aucun import de StatusBadge
- [ ] Supprimer le fichier
- [ ] Mettre à jour l'index des exports
- [ ] Documenter dans MIGRATION_GUIDE.md

---

#### Tâche 1.1.2 : Fusionner ErrorBanner + AlertBanner (2h)

**Avant:**
```tsx
// ❌ Deux composants identiques
<ErrorBanner variant="error" message="..." />
<AlertBanner variant="danger" message="..." />
```

**Après:**
```tsx
// ✅ Un seul composant unifié
<AlertBanner variant="danger" message="..." />
```

**Étapes:**
1. Analyser les différences entre ErrorBanner et AlertBanner
2. Ajouter support des variants de ErrorBanner dans AlertBanner
3. Créer alias pour rétrocompatibilité :
   ```tsx
   // Dans ErrorBanner.tsx
   /** @deprecated Use AlertBanner instead */
   export const ErrorBanner = (props) => {
     console.warn("ErrorBanner is deprecated. Use AlertBanner.");
     return <AlertBanner {...props} />;
   };
   ```
4. Migrer les 2 usages de ErrorBanner vers AlertBanner
5. Planifier suppression de ErrorBanner dans 2 sprints

**Checklist:**
- [ ] Mapper variants: error→danger, warning→warning, success→success
- [ ] Tests passent pour AlertBanner
- [ ] Migrer usages de ErrorBanner (grep -r "ErrorBanner")
- [ ] Ajouter console.warn de dépréciation
- [ ] Documentation mise à jour

---

#### Tâche 1.1.3 : Déprécier FormInput.tsx (1h 30min)

**Problème:** FormInput duplique FormField + Input

**Solution:**
```tsx
// Dans FormInput.tsx
/** @deprecated Use FormField + Input instead */
export const FormInput = (props) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'FormInput is deprecated. Use <FormField><Input /></FormField> instead.\n' +
      'See: docs/audits/GUIDE_SELECTION_COMPOSANTS.md#formfield'
    );
  }
  return <FormField label={props.label}><Input {...props} /></FormField>;
};
```

**Checklist:**
- [ ] Ajouter warning de dépréciation
- [ ] Documenter l'alternative dans le guide
- [ ] Vérifier les usages actuels (grep -r "FormInput")
- [ ] Créer issue GitHub "Migrate FormInput to FormField + Input"

---

### 🔥 Action 1.2 : Centraliser les Design Tokens (8h)

**Impact sur les piliers:**
- Maintenabilité: +3 points
- Cohérence: +2 points
- Architecture: +2 points

#### Problème Actuel
```tsx
// ❌ 12 composants avec classes en dur
// IconButton.tsx
const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700",  // ← Dupliqué de Button!
};

// SearchBar.tsx
<input className="border border-gray-300 focus:ring-2..." />  // ← Classes inline

// PageHeader.tsx
<h1 className="text-2xl font-bold text-gray-900" />  // ← Classes inline
```

**Impact:**
- Modifier la couleur primary → 12 fichiers à changer
- Incohérences visuelles (différentes nuances de blue-600)
- Impossible de changer le thème facilement

#### Solution : Tokens Centralisés

**Étape 1: Créer tokens manquants (2h)**

```tsx
// frontend/src/shared/styles/designTokens.ts

// ✅ Ajouter FORM tokens
export const FORM = {
  base: "block w-full rounded-lg border transition-colors",
  states: {
    default: "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500",
    error: "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500",
    disabled: "bg-gray-50 text-gray-500 cursor-not-allowed",
  },
  sizes: {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-4 py-3 text-base",
  },
  label: "block text-sm font-medium text-gray-700 mb-1",
  helpText: "mt-1 text-sm text-gray-500",
  errorText: "mt-1 text-sm text-red-600",
};

// ✅ Ajouter LAYOUT tokens
export const LAYOUT = {
  pageHeader: {
    container: "space-y-1",
    title: "text-2xl font-bold text-gray-900",
    description: "mt-0.5 text-sm text-gray-500",
    icon: "h-8 w-8 text-blue-600",
  },
  sectionHeader: {
    h2: "text-xl font-bold text-gray-900",
    h3: "text-lg font-semibold text-gray-900",
    description: "mt-1 text-sm text-gray-500",
  },
  spacing: {
    pageContainer: "space-y-6",
    sectionSpacing: "space-y-4",
    cardPadding: "p-6",
  },
};

// ✅ Ajouter MODAL tokens
export const MODAL = {
  backdrop: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4",
  container: "relative bg-white rounded-2xl shadow-xl w-full mx-auto overflow-hidden",
  sizes: {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  },
  header: "px-6 py-5 border-b border-gray-100",
  body: "px-6 py-5",
  footer: "px-6 py-5 border-t border-gray-100",
};
```

**Checklist:**
- [ ] Créer tokens FORM
- [ ] Créer tokens LAYOUT
- [ ] Créer tokens MODAL
- [ ] Tests de non-régression visuelle
- [ ] Documentation des tokens

---

**Étape 2: Refactorer IconButton (2h)**

```tsx
// ❌ AVANT - Classes en dur
const variantClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  // ... 80 lignes de duplication
};

// ✅ APRÈS - Réutiliser BUTTON tokens
import { BUTTON } from "@/shared/styles/designTokens";

export function IconButton({ variant, size, icon, ...props }) {
  const classes = cn(
    BUTTON.base,           // ← Réutilise les tokens Button
    BUTTON.variants[variant],
    BUTTON.sizes[size],
    "aspect-square p-0",   // ← Seules les classes spécifiques à IconButton
  );
  
  return <button className={classes}>{icon}</button>;
}
```

**Gain:**
- Modifier couleur primary → 1 seul fichier (designTokens.ts)
- Cohérence garantie entre Button et IconButton
- -60 lignes de code dupliqué

---

**Étape 3: Refactorer composants Forms (4h)**

```tsx
// SearchBar.tsx - AVANT
<input className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg..." />

// SearchBar.tsx - APRÈS
import { FORM } from "@/shared/styles/designTokens";

<input className={cn(FORM.base, FORM.states.default, FORM.sizes[size])} />
```

**Composants à refactorer:**
1. SearchBar.tsx (1h)
2. SelectField.tsx (1h)
3. FormField.tsx (1h)
4. DateRangePicker.tsx (1h)

**Checklist par composant:**
- [ ] Remplacer classes inline par tokens FORM
- [ ] Tests visuels (screenshots avant/après)
- [ ] Vérifier tous les états (default, error, disabled, focus)
- [ ] Responsive OK (mobile, tablet, desktop)

---

### 🔥 Action 1.3 : Créer Architecture Guards (4h)

**Impact sur les piliers:**
- Architecture: +3 points
- Maintenabilité: +2 points

**Objectif:** Empêcher les régressions futures

#### Guard 1: ESLint Rules Custom (2h)

```js
// .eslintrc.js - Ajouter règles custom

module.exports = {
  rules: {
    // ❌ Interdire les classes Tailwind inline dans les composants shared
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="className"] Literal',
        message: 'Use design tokens instead of inline Tailwind classes in shared components',
      },
    ],
    
    // ❌ Interdire l'import de composants dépréciés
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@/shared/components/badges/StatusBadge',
            message: 'StatusBadge is deprecated. Use Badge.Status instead.',
          },
          {
            name: '@/shared/components/feedback/ErrorBanner',
            message: 'ErrorBanner is deprecated. Use AlertBanner instead.',
          },
        ],
      },
    ],
  },
};
```

**Checklist:**
- [ ] Configurer règles ESLint
- [ ] Tester sur composants shared
- [ ] Ajouter exceptions si nécessaire
- [ ] Documenter dans CONTRIBUTING.md

---

#### Guard 2: Tests de Non-Régression (2h)

```tsx
// frontend/src/shared/components/__tests__/visual-regression.test.ts

import { expect, test } from '@playwright/test';

test.describe('Composants Shared - Cohérence Visuelle', () => {
  test('Button et IconButton utilisent les mêmes couleurs', async ({ page }) => {
    await page.goto('/storybook/button');
    
    const buttonBg = await page.locator('[data-testid="button-primary"]')
      .evaluate(el => getComputedStyle(el).backgroundColor);
      
    const iconButtonBg = await page.locator('[data-testid="icon-button-primary"]')
      .evaluate(el => getComputedStyle(el).backgroundColor);
    
    // ✅ Les deux doivent avoir exactement la même couleur
    expect(buttonBg).toBe(iconButtonBg);
  });
  
  test('Tous les modals utilisent le même backdrop', async ({ page }) => {
    // Vérifier que tous les modals ont bg-black/50
  });
});
```

**Checklist:**
- [ ] Setup Playwright (si pas déjà fait)
- [ ] Tests visuels pour cohérence des couleurs
- [ ] Tests accessibilité automatisés (axe-core)
- [ ] Intégrer dans CI/CD

---

## 🏗️ PHASE 2 - ACCESSIBILITÉ (Semaines 3-4)

**Objectif:** Rendre 100% de l'app accessible WCAG 2.1 AA

### 🔥 Action 2.1 : Migrer UsersPage (6h)

**Impact sur les piliers:**
- Accessibilité: +4 points (page critique non accessible)
- Cohérence: +1 point
- Maintenabilité: +1 point

#### Problèmes d'Accessibilité Actuels

```tsx
// ❌ Table HTML custom sans ARIA
<table>
  <thead>
    <tr>
      <th>Nom</th>  {/* Pas de scope="col" */}
    </tr>
  </thead>
  <tbody>
    <tr onClick={handleEdit}>  {/* Pas de rôle, pas de keyboard nav */}
      <td>John Doe</td>
    </tr>
  </tbody>
</table>

// ❌ Input recherche sans label
<input type="search" placeholder="Rechercher..." />  {/* Pas de label associé */}

// ❌ Boutons icône sans texte alternatif
<button onClick={handleEdit}>
  <PencilIcon />  {/* Screen reader ne sait pas ce que c'est */}
</button>
```

**Impact:** Screen readers ne peuvent pas utiliser cette page

---

#### Solution : Migration vers Composants Accessibles

**Étape 1: PageHeader (30min)**
```tsx
// ✅ APRÈS
<PageHeader
  title="Gestion des utilisateurs"
  description="Administration des comptes membres du club"
  actions={
    <Button 
      variant="primary" 
      icon={<PlusIcon />}
      aria-label="Ajouter un nouvel utilisateur"
    >
      Ajouter
    </Button>
  }
/>
```

**Étape 2: SearchBar (30min)**
```tsx
// ✅ APRÈS - Label automatique + ARIA
<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Rechercher par nom, email..."
  aria-label="Rechercher un utilisateur"
/>
```

**Étape 3: DataTable (3h)**
```tsx
// ✅ APRÈS - Accessibilité complète
const columns: Column<User>[] = [
  {
    key: "nom",
    label: "Nom",  // ← Devient <th scope="col">
    sortable: true,
    render: (user) => (
      <div>
        <div className="font-medium">{user.nom}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Rôle",
    render: (user) => <Badge.Role role={user.role} />,
  },
  {
    key: "actions",
    label: "Actions",
    render: (user) => (
      <div className="flex gap-2">
        <IconButton
          icon={<PencilIcon />}
          ariaLabel={`Modifier ${user.nom}`}  // ← Screen reader friendly
          onClick={() => handleEdit(user)}
        />
        <IconButton
          icon={<TrashIcon />}
          ariaLabel={`Supprimer ${user.nom}`}
          variant="danger"
          onClick={() => handleDelete(user)}
        />
      </div>
    ),
  },
];

<DataTable
  columns={columns}
  data={users}
  sortable
  onRowClick={handleRowClick}
  // ✅ DataTable gère automatiquement:
  // - role="table"
  // - scope sur les <th>
  // - Navigation clavier (Tab, Arrow keys)
  // - Annonces screen reader pour le tri
/>
```

**Étape 4: Remplacer icônes SVG (1h)**
```tsx
// ❌ AVANT - 40 lignes de SVG inline
const PencilIcon = () => <svg>...</svg>;
const TrashIcon = () => <svg>...</svg>;

// ✅ APRÈS - Imports
import { PencilIcon, TrashIcon } from "@patternfly/react-icons";
```

**Étape 5: Tests Accessibilité (1h)**
```bash
# Installer axe-core
npm install --save-dev @axe-core/playwright

# Tester UsersPage
npx playwright test users-page-a11y.spec.ts
```

```tsx
// users-page-a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('UsersPage - Accessibilité', () => {
  test('doit être conforme WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/users');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // ✅ 0 violations attendues
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('navigation clavier fonctionne', async ({ page }) => {
    await page.goto('/users');
    
    // Tab vers le bouton Ajouter
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="add-user-button"]')).toBeFocused();
    
    // Tab vers la recherche
    await page.keyboard.press('Tab');
    await expect(page.locator('[aria-label="Rechercher un utilisateur"]')).toBeFocused();
  });
});
```

**Checklist:**
- [ ] PageHeader implémenté
- [ ] SearchBar avec label ARIA
- [ ] DataTable avec colonnes bien définies
- [ ] IconButton avec ariaLabel sur toutes les actions
- [ ] Icônes SVG remplacées
- [ ] Tests axe-core : 0 violations
- [ ] Navigation clavier testée
- [ ] Screen reader testé (NVDA ou JAWS)

---

### 🔥 Action 2.2 : Auditer et Corriger Modals (4h)

**Impact sur les piliers:**
- Accessibilité: +1 point
- Cohérence: +2 points

#### Problèmes des Modals Custom

```tsx
// ❌ Modal custom sans accessibilité
<div className="fixed inset-0 bg-black/50" onClick={onClose}>
  {/* Pas de role="dialog" */}
  {/* Pas d'aria-modal="true" */}
  {/* Pas de focus trap */}
  {/* Pas de gestion Escape */}
  {/* Backdrop cliquable sans annonce */}
  <div className="bg-white rounded-lg">
    <h3>Titre</h3>  {/* Pas d'aria-labelledby */}
    <div>Contenu</div>
  </div>
</div>
```

**Conséquences:**
- Screen reader ne sait pas qu'un modal est ouvert
- Tab peut sortir du modal (pas de focus trap)
- Escape ne ferme pas le modal
- Pas d'annonce de fermeture

---

#### Solution : Modal Shared Accessible

```tsx
// ✅ Modal shared avec accessibilité complète
<Modal 
  open={isOpen} 
  onClose={handleClose}
  // ✅ Gère automatiquement:
  // - role="dialog"
  // - aria-modal="true"
  // - Focus trap (Tab reste dans le modal)
  // - Escape pour fermer
  // - Scroll lock sur body
  // - Annonces screen reader
>
  <Modal.Header 
    title="Modifier l'utilisateur"
    // ✅ aria-labelledby automatique
  />
  <Modal.Body>
    <form>...</form>
  </Modal.Body>
  <Modal.Footer align="right">
    <Button variant="ghost" onClick={handleClose}>
      Annuler
    </Button>
    <Button variant="primary" type="submit">
      Enregistrer
    </Button>
  </Modal.Footer>
</Modal>
```

**Plan de Migration:**

1. **Identifier tous les modals custom** (30min)
   ```bash
   grep -r "fixed inset-0" frontend/src/features/
   ```

2. **Prioriser par criticité** (30min)
   - Modals utilisés fréquemment
   - Modals avec formulaires (WCAG exige labels)
   - Modals de confirmation (doivent être accessibles)

3. **Migrer les 5 modals les plus utilisés** (3h)
   - CoursesPage: CreateSessionModal (30min)
   - StorePage: QuickOrderModal (30min)
   - PaymentsPage: RecordPaymentModal (1h)
   - StorePage: ArticleModal (1h)

**Checklist par modal:**
- [ ] Remplacer backdrop custom par <Modal>
- [ ] Header avec titre clair
- [ ] Body avec contenu accessible (labels sur inputs)
- [ ] Footer avec actions claires
- [ ] Test navigation clavier (Tab reste dans modal)
- [ ] Test Escape (ferme le modal)
- [ ] Test screen reader (annonce ouverture/fermeture)

---

## 🏗️ PHASE 3 - COHÉRENCE TOTALE (Semaines 5-7)

**Objectif:** 100% des pages utilisent les composants shared

### 🔥 Action 3.1 : Uniformiser les En-têtes (3h)

**Impact sur les piliers:**
- Cohérence: +3 points
- Maintenabilité: +1 point

#### Pages sans PageHeader

1. **PaymentsPage** (1h)
2. **StorePage** (1h)
3. **SettingsPage** (1h)

```tsx
// ❌ AVANT - HTML custom
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
    <p className="text-sm text-gray-500">Gestion des transactions</p>
  </div>
  <button>Action</button>
</div>

// ✅ APRÈS - PageHeader
<PageHeader
  icon={<CreditCardIcon className="h-8 w-8 text-blue-600" />}
  title="Paiements"
  description="Gestion des transactions et abonnements"
  actions={
    <Button variant="primary" icon={<PlusIcon />}>
      Enregistrer un paiement
    </Button>
  }
/>
```

**Checklist:**
- [ ] PaymentsPage migré
- [ ] StorePage migré
- [ ] SettingsPage migré
- [ ] Toutes les pages ont la même structure d'en-tête
- [ ] Screenshots avant/après pour validation visuelle

---

### 🔥 Action 3.2 : Documenter le Design System (8h)

**Impact sur les piliers:**
- Architecture: +2 points
- Maintenabilité: +2 points

#### Objectif
**Permettre à n'importe quel développeur de contribuer sans casser la cohérence**

#### Livrables

**1. Guide de Contribution UI (3h)**
```markdown
# CONTRIBUTING_UI.md

## Avant de coder un nouveau composant

### Checklist Obligatoire
- [ ] J'ai cherché dans shared/components/
- [ ] J'ai vérifié qu'aucun composant similaire n'existe
- [ ] J'ai consulté le guide de sélection (GUIDE_SELECTION_COMPOSANTS.md)
- [ ] Si je crée un composant shared, j'utilise les design tokens

### Pattern à Suivre
1. Créer le composant dans shared/components/[famille]/
2. Utiliser les tokens de designTokens.ts
3. Ajouter les props TypeScript
4. Documenter dans un README.md
5. Ajouter tests d'accessibilité (axe-core)
6. Créer une story Storybook (optionnel mais recommandé)

### Anti-Patterns à Éviter
❌ Classes Tailwind inline dans composants shared
❌ Dupliquer des composants existants
❌ Créer un modal sans utiliser <Modal>
❌ Oublier les labels ARIA
```

**Checklist:**
- [ ] Guide de contribution créé
- [ ] Exemples de code inclus
- [ ] Lien vers guide de sélection
- [ ] Validation par l'équipe

---

**2. Catalogue des Composants (3h)**
```markdown
# COMPONENT_CATALOG.md

## Composants par Catégorie

### Buttons (3)
| Composant | Quand l'utiliser | Props clés | Exemple |
|-----------|------------------|------------|---------|
| Button | Action avec texte | variant, size, icon | `<Button variant="primary">Sauver</Button>` |
| IconButton | Action icône seule | icon, ariaLabel | `<IconButton icon={<Edit />} ariaLabel="Modifier" />` |
| SubmitButton | Bouton de formulaire | isLoading | `<SubmitButton isLoading={saving}>Enregistrer</SubmitButton>` |

### Forms (6)
| Composant | Quand l'utiliser | Props clés | Exemple |
|-----------|------------------|------------|---------|
| Input | Champ texte | type, label, error | `<Input label="Nom" error={errors.nom} />` |
| SearchBar | Recherche avec debounce | debounce, placeholder | `<SearchBar debounce={300} />` |
| SelectField | Liste déroulante | options, label | `<SelectField options={opts} />` |
| ... | ... | ... | ... |

### Layout (4)
| Composant | Quand l'utiliser | Props clés | Exemple |
|-----------|------------------|------------|---------|
| PageHeader | En-tête de page | title, description, actions | `<PageHeader title="..." />` |
| ... | ... | ... | ... |

## Composants DÉPRÉCIÉS
| Composant | Raison | Alternative |
|-----------|--------|-------------|
| StatusBadge | Doublon | Badge.Status |
| ErrorBanner | Doublon | AlertBanner |
| FormInput | Doublon | FormField + Input |
```

**Checklist:**
- [ ] Catalogue créé avec tous les composants
- [ ] Exemples de code pour chaque composant
- [ ] Section dépréciés clairement identifiée
- [ ] Lien depuis README.md principal

---

**3. Architecture Decision Records (2h)**
```markdown
# docs/architecture/ADR-001-design-tokens.md

## Contexte
Nous avions 12 composants avec classes Tailwind en dur, créant des incohérences.

## Décision
Tous les composants shared DOIVENT utiliser les design tokens de designTokens.ts

## Conséquences
✅ Modification d'un style → 1 seul fichier
✅ Cohérence garantie
✅ Thème customisable facilement
❌ Effort initial de migration

## Statut
✅ ACCEPTÉ - Appliqué depuis Phase 1

---

# docs/architecture/ADR-002-single-source-of-truth.md

## Contexte
Nous avions 3 composants pour créer des badges (Badge, StatusBadge, Badge.Status)

## Décision
UN SEUL composant officiel par besoin. Les doublons sont dépréciés puis supprimés.

## Conséquences
✅ Pas de confusion
✅ Maintenabilité améliorée
❌ Nécessite migration des anciens usages

## Statut
✅ ACCEPTÉ - En cours d'application
```

**Checklist:**
- [ ] ADR pour design tokens
- [ ] ADR pour "single source of truth"
- [ ] ADR pour accessibilité (WCAG 2.1 AA obligatoire)
- [ ] ADRs validés par Tech Lead

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs à Mesurer Après Chaque Phase

| Métrique | Avant | Cible | Comment mesurer |
|----------|-------|-------|-----------------|
| **Maintenabilité** |
| Fichiers à modifier pour changer un style | 3-5 | 1 | Audit manuel |
| Temps dev nouvelle page | 2h | 1h 20min | Tracker sur 3 nouvelles pages |
| Duplication de code (lignes) | 1690 | 500 | SonarQube |
| **Cohérence** |
| Composants avec design tokens | 40% | 100% | Compte manuel |
| Pages utilisant composants shared | 55% | 100% | Audit manuel |
| Overlaps de composants | 3 | 0 | Audit manuel |
| **Architecture** |
| ESLint rules pour qualité | 0 | 3+ | Config ESLint |
| Documentation (pages) | 2 | 5+ | Compte fichiers docs/ |
| Tests accessibilité auto | 0 | 5+ | Tests Playwright |
| **Accessibilité** |
| Pages conformes WCAG 2.1 AA | 55% | 100% | axe-core scan |
| Violations accessibilité | ~15 | 0 | axe DevTools |
| Score Lighthouse Accessibility | 85 | 95+ | Lighthouse CI |

---

## 📅 CALENDRIER DÉTAILLÉ

### Semaine 1
- **Lundi-Mardi:** Action 1.1 (Supprimer doublons) - 4h
- **Mercredi-Vendredi:** Action 1.2 (Tokens) - 8h
- **Objectif:** Fondations propres

### Semaine 2
- **Lundi-Mardi:** Action 1.3 (Guards) - 4h
- **Mercredi-Vendredi:** Début Action 2.1 (UsersPage) - 6h
- **Objectif:** Architecture sécurisée + page critique accessible

### Semaine 3-4
- **Action 2.1:** Finaliser UsersPage si besoin
- **Action 2.2:** Modals accessibles - 4h
- **Objectif:** Accessibilité à 95%

### Semaine 5
- **Action 3.1:** En-têtes uniformes - 3h
- **Objectif:** 100% cohérence visuelle

### Semaine 6-7
- **Action 3.2:** Documentation - 8h
- **Objectif:** Pérenniser la qualité

---

## ✅ VALIDATION DE PHASE

### Phase 1 - Fondations
**Critères de Validation:**
- [ ] 0 overlaps de composants (StatusBadge, ErrorBanner supprimés)
- [ ] IconButton utilise BUTTON tokens (pas de classes en dur)
- [ ] Composants Forms utilisent FORM tokens
- [ ] ESLint rules actives (3 règles minimum)
- [ ] Tests visuels passent (0 régressions)

**Score attendu:**
- Maintenabilité: 15/20 (+3)
- Cohérence: 14/20 (+3)
- Architecture: 18/20 (+2)

---

### Phase 2 - Accessibilité
**Critères de Validation:**
- [ ] UsersPage: 0 violations axe-core
- [ ] UsersPage: Navigation clavier OK
- [ ] 5 modals migrés vers Modal shared
- [ ] Tous les modals: Focus trap fonctionne
- [ ] Lighthouse Accessibility ≥ 90 sur pages migrées

**Score attendu:**
- Accessibilité: 18/20 (+4)
- Cohérence: 16/20 (+2)

---

### Phase 3 - Cohérence Totale
**Critères de Validation:**
- [ ] 100% des pages utilisent PageHeader
- [ ] Guide de contribution validé par l'équipe
- [ ] Catalogue des composants complet
- [ ] 3+ ADRs documentés
- [ ] 0 warnings ESLint sur composants shared

**Score attendu:**
- Cohérence: 18/20 (+2)
- Maintenabilité: 18/20 (+3)
- Architecture: 18/20 (maintenu)
- Accessibilité: 19/20 (+1)

---

## 🎯 RÉSULTAT FINAL ATTENDU

```
┌──────────────────────────────────────────────────────┐
│  SCORES AVANT → APRÈS                                │
├──────────────────────────────────────────────────────┤
│  Maintenabilité   12/20 ████████████░░░░░░░░ → 18/20 │
│  Cohérence        11/20 ███████████░░░░░░░░░ → 18/20 │
│  Architecture     16/20 ████████████████░░░░ → 18/20 │
│  Accessibilité    14/20 ██████████████░░░░░░ → 19/20 │
│                                                       │
│  MOYENNE          13.2/20 → 18.2/20 (+5 points)      │
└──────────────────────────────────────────────────────┘
```

### Impact Concret

**Maintenabilité:**
- ✅ Modifier un style: 1 fichier au lieu de 3-5
- ✅ Nouvelle page: 1h au lieu de 2h
- ✅ 0 duplication critique (composants dépréciés supprimés)

**Cohérence:**
- ✅ 100% des composants utilisent design tokens
- ✅ 100% des pages utilisent PageHeader
- ✅ Un seul chemin pour chaque besoin

**Architecture:**
- ✅ ESLint empêche les régressions
- ✅ Documentation complète
- ✅ Tests automatisés (accessibilité + visuels)

**Accessibilité:**
- ✅ 100% des pages WCAG 2.1 AA
- ✅ Navigation clavier partout
- ✅ Screen readers compatibles

---

## 🚀 DÉMARRAGE

### Aujourd'hui
1. Valider ce plan avec l'équipe (30 min)
2. Créer les tickets Jira/GitHub (1h)
3. Assigner les responsabilités

### Lundi prochain
**Sprint 1 - Semaine 1**
- 🔥 Supprimer StatusBadge.tsx
- 🔥 Fusionner ErrorBanner + AlertBanner
- 🔥 Créer FORM, LAYOUT, MODAL tokens
- 🔥 Refactorer IconButton

### Contact
**Questions:** Tech Lead  
**Suivi:** Dashboard de progression (DASHBOARD_PROGRESSION.md)

---

**Note:** Ce plan est optimisé pour VOS priorités (maintenabilité, cohérence, architecture, accessibilité). Il ne se concentre pas sur la réduction de lignes de code, mais sur la QUALITÉ et la PÉRENNITÉ du système.