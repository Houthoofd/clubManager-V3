# 🎯 PRIORITÉS DE MIGRATION - DESIGN SYSTEM

**Date:** 2024
**Objectif:** Atteindre 100% de migration vers le design system réutilisable
**État actuel:** 11/17 pages migrées (64.7%)
**Objectif final:** 17/17 pages migrées (100%)

---

## 📊 VUE D'ENSEMBLE

| Priorité | Pages | Effort Total | Impact |
|----------|-------|--------------|--------|
| 🔴 **CRITIQUE** | 1 | 6-8h | +15% couverture |
| 🟠 **HAUTE** | 2 | 14-18h | +20% couverture |
| 🟡 **MOYENNE** | 3 | 22-28h | +30% couverture |
| ✅ **COMPLÉTÉ** | 11 | - | 64.7% |

**Effort total restant:** 42-54 heures (~6-7 jours)

---

## 🔴 PRIORITÉ CRITIQUE

### 1. RegisterPage (Auth)
**Effort:** 6-8 heures | **Impact:** Cohérence UX critique

#### 📍 Contexte
Page d'inscription complètement custom, seule page Auth non migrée. Crée une incohérence majeure avec LoginPage, ForgotPasswordPage et ResetPasswordPage.

#### ❌ État actuel
- Layout custom avec gradient
- Tous les inputs HTML natifs
- Calcul de force de mot de passe custom
- Aucun composant design system

#### ✅ État cible
- AuthPageContainer pour layout cohérent
- FormField + Input pour tous les champs
- PasswordInput avec indicateur de force intégré
- Validation inline avec messages d'erreur

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: Layout (1-2h)**
  - [ ] Remplacer le div custom par `<AuthPageContainer>`
  - [ ] Configurer title="Créer un compte"
  - [ ] Configurer subtitle avec description
  - [ ] Ajouter footer avec liens (Déjà un compte ?)

- [ ] **Phase 2: Champs de base (2-3h)**
  - [ ] Migrer "Prénom" vers FormField + Input
  - [ ] Migrer "Nom" vers FormField + Input
  - [ ] Migrer "Nom d'utilisateur" vers FormField + Input
  - [ ] Migrer "Email" vers FormField + Input avec EnvelopeIcon
  - [ ] Migrer "Date de naissance" vers FormField + Input type="date"
  - [ ] Migrer "Genre" vers FormField + Select

- [ ] **Phase 3: Champ mot de passe (1-2h)**
  - [ ] Supprimer calculatePasswordStrength custom
  - [ ] Supprimer getPasswordStrengthColor custom
  - [ ] Supprimer getPasswordStrengthText custom
  - [ ] Utiliser PasswordInput avec showStrengthIndicator={true}
  - [ ] Vérifier que l'indicateur de force s'affiche correctement

- [ ] **Phase 4: Bouton et finalisation (1h)**
  - [ ] Remplacer le bouton custom par SubmitButton
  - [ ] Vérifier l'état isLoading
  - [ ] Tester le formulaire complet
  - [ ] Ajouter AlertBanner si nécessaire

- [ ] **Phase 5: Tests (30min)**
  - [ ] Tester tous les champs
  - [ ] Tester la validation
  - [ ] Tester la soumission
  - [ ] Vérifier la cohérence avec LoginPage
```

#### 💡 Exemple de code

**Avant:**
```tsx
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
  <div className="max-w-2xl w-full">
    <input type="text" {...register("first_name")} />
  </div>
</div>
```

**Après:**
```tsx
<AuthPageContainer title="Créer un compte" subtitle="...">
  <FormField label="Prénom" error={errors.first_name?.message}>
    <Input {...register("first_name")} />
  </FormField>
</AuthPageContainer>
```

#### 📦 Imports nécessaires
```tsx
import { AuthPageContainer } from "@/shared/components/Auth/AuthPageContainer";
import { FormField } from "@/shared/components/Forms/FormField";
import { Input } from "@/shared/components/Input/Input";
import { PasswordInput } from "@/shared/components/Input/PasswordInput";
import { SubmitButton } from "@/shared/components/Button/SubmitButton";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
```

---

## 🟠 PRIORITÉ HAUTE

### 2. SettingsPage
**Effort:** 12-15 heures | **Impact:** -350 lignes de code custom

#### 📍 Contexte
Page avec énormément de code dupliqué : 14 SVG inline, 5 types de champs custom, composants de loading custom. Migration = gain massif en maintenabilité.

#### ❌ État actuel (Score: 65/100)
- 14 fonctions SVG inline (CogIcon, BuildingIcon, etc.)
- 5 composants de formulaire custom
- SaveButton custom
- LoadingSkeleton custom
- Total: ~350 lignes de code à remplacer

#### ✅ État cible
- Heroicons pour toutes les icônes
- FormField + Input/Select/TextArea pour tous les champs
- Button pour SaveButton
- LoadingSpinner pour le skeleton

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: Icônes (4-5h)**
  - [ ] CogIcon → import { Cog6ToothIcon } from '@heroicons/react/24/outline'
  - [ ] BuildingIcon → BuildingOfficeIcon
  - [ ] ClockIcon → ClockIcon
  - [ ] GlobeAltIcon → GlobeAltIcon
  - [ ] BanknotesIcon → BanknotesIcon
  - [ ] PaintBrushIcon → PaintBrushIcon
  - [ ] Squares2x2Icon → Squares2X2Icon
  - [ ] LanguageIcon → LanguageIcon
  - [ ] SpinnerIcon → ArrowPathIcon
  - [ ] FacebookIcon → (garder custom ou chercher alternative)
  - [ ] InstagramIcon → (garder custom)
  - [ ] TwitterXIcon → (garder custom)
  - [ ] Supprimer toutes les fonctions SVG (lignes 29-212)
  - [ ] Économie: ~180 lignes

- [ ] **Phase 2: Composants de formulaire (4-5h)**
  - [ ] Supprimer fonction Field → Utiliser FormField
  - [ ] Supprimer fonction TextAreaField → Utiliser FormField + TextArea
  - [ ] Supprimer fonction SelectField → Utiliser FormField + Select
  - [ ] Supprimer fonction ColorField → Utiliser FormField + ColorInput
  - [ ] Garder ModuleToggle (logique métier spécifique)
  - [ ] Économie: ~120 lignes

- [ ] **Phase 3: Boutons et Loading (2-3h)**
  - [ ] Remplacer SaveButton par Button variant="primary"
  - [ ] Remplacer LoadingSkeleton par LoadingSpinner
  - [ ] Économie: ~50 lignes

- [ ] **Phase 4: Mise à jour des 7 onglets (2h)**
  - [ ] Onglet Club: Migrer tous les champs
  - [ ] Onglet Horaires: Migrer textarea
  - [ ] Onglet Social: Migrer 3 champs
  - [ ] Onglet Finance: Migrer 3 champs
  - [ ] Onglet Apparence: Migrer 5 champs + ColorInput
  - [ ] Onglet Navigation: OK (ModuleToggle)
  - [ ] Onglet Localisation: Migrer 4 selects

- [ ] **Phase 5: Tests (1h)**
  - [ ] Tester chaque onglet
  - [ ] Vérifier la sauvegarde
  - [ ] Vérifier le loading skeleton
```

#### 💡 Exemple de code

**Avant:**
```tsx
function CogIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      {/* 20 lignes de path SVG */}
    </svg>
  );
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label>{label}</label>
      {children}
      {error && <p>{error}</p>}
    </div>
  );
}
```

**Après:**
```tsx
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { FormField } from '@/shared/components/Forms/FormField';
import { Input } from '@/shared/components/Input/Input';

// Utilisation directe
<FormField label="Nom du club" error={errors.club_name}>
  <Input {...register("club_name")} />
</FormField>
```

#### 📦 Imports à ajouter
```tsx
import {
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ClockIcon,
  GlobeAltIcon,
  BanknotesIcon,
  PaintBrushIcon,
  Squares2X2Icon,
  LanguageIcon,
} from '@heroicons/react/24/outline';
import { FormField } from '@/shared/components/Forms/FormField';
import { Input } from '@/shared/components/Input/Input';
import { TextArea } from '@/shared/components/Input/TextArea';
import { Select } from '@/shared/components/Input/Select';
import { ColorInput } from '@/shared/components/Input/ColorInput';
import { Button } from '@/shared/components/Button/Button';
import { LoadingSpinner } from '@/shared/components/Layout/LoadingSpinner';
```

---

### 3. PaymentsPage
**Effort:** 2-3 heures | **Impact:** -125 lignes de code dupliqué

#### 📍 Contexte
Page avec code dupliqué évident : LoadingSpinner, EmptyState et PaginationBar définis localement alors qu'ils existent déjà dans shared/components.

#### ❌ État actuel (Score: 72/100)
- LoadingSpinner custom (lignes 133-160)
- EmptyState custom (lignes 162-183)
- PaginationBar custom (lignes 195-258)
- Total: ~125 lignes dupliquées

#### ✅ État cible
- Importer LoadingSpinner depuis shared/components
- Importer EmptyState depuis shared/components
- Importer PaginationBar depuis shared/components

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: Suppression du code custom (1h)**
  - [ ] Supprimer fonction LoadingSpinner (lignes 133-160)
  - [ ] Supprimer fonction EmptyState (lignes 162-183)
  - [ ] Supprimer fonction PaginationBar (lignes 195-258)
  - [ ] Économie: ~125 lignes

- [ ] **Phase 2: Imports des composants partagés (30min)**
  - [ ] Ajouter import LoadingSpinner from '@/shared/components/Layout/LoadingSpinner'
  - [ ] Ajouter import EmptyState from '@/shared/components/Layout/EmptyState'
  - [ ] Ajouter import PaginationBar from '@/shared/components/Navigation/PaginationBar'

- [ ] **Phase 3: Remplacement des usages (1h)**
  - [ ] Remplacer <LoadingSpinner /> custom
  - [ ] Remplacer <EmptyState /> custom
  - [ ] Remplacer <PaginationBar /> custom
  - [ ] Vérifier les props sont compatibles

- [ ] **Phase 4: Tests (30min)**
  - [ ] Tester l'affichage des 3 onglets
  - [ ] Tester le loading
  - [ ] Tester l'état vide
  - [ ] Tester la pagination
```

#### 💡 Exemple de code

**Avant:**
```tsx
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Utilisation
{isLoading && <LoadingSpinner />}
```

**Après:**
```tsx
import { LoadingSpinner } from '@/shared/components/Layout/LoadingSpinner';

// Utilisation
{isLoading && <LoadingSpinner size="lg" text="Chargement..." />}
```

---

## 🟡 PRIORITÉ MOYENNE

### 4. UsersPage
**Effort:** 4-6 heures | **Impact:** Standardisation des modals

#### 📍 Contexte
Page bien migrée (PageHeader, DataTable, PaginationBar) mais utilise encore des modals custom et des badges custom.

#### ❌ État actuel (Score: 75/100)
- 5 modals custom non standardisés
- UserRoleBadge et UserStatusBadge custom

#### ✅ État cible
- Utiliser Modal partagé pour tous les modals
- Utiliser Badge.Role et Badge.Status

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: Migration des badges (1-2h)**
  - [ ] Remplacer UserRoleBadge par Badge.Role
  - [ ] Remplacer UserStatusBadge par Badge.Status
  - [ ] Supprimer les composants custom
  - [ ] Vérifier les variants (admin, professor, member, etc.)

- [ ] **Phase 2: Standardisation des modals (2-3h)**
  - [ ] EditUserRoleModal → Utiliser Modal + FormField + Select
  - [ ] EditUserStatusModal → Utiliser Modal + FormField + Select
  - [ ] DeleteUserModal → Utiliser ConfirmDialog
  - [ ] SendToUserModal → Utiliser Modal + FormField + TextArea
  - [ ] NotifyUsersModal → Utiliser Modal + FormField + TextArea

- [ ] **Phase 3: Tests (1h)**
  - [ ] Tester l'édition du rôle
  - [ ] Tester l'édition du statut
  - [ ] Tester la suppression
  - [ ] Tester l'envoi d'email
  - [ ] Tester les notifications bulk
```

---

### 5. CoursesPage
**Effort:** 8-10 heures | **Impact:** Standardisation formulaires et modals

#### 📍 Contexte
Page avec bonne base (PageHeader, TabGroup, DataTable) mais beaucoup de modals custom avec formulaires HTML natifs.

#### ❌ État actuel (Score: 78/100)
- CreateEditCourseRecurrentModal (~300 lignes)
- CreateProfessorModal (~200 lignes)
- GenerateCoursesModal, CreateSessionModal, AttendanceModal
- Tous utilisent des inputs HTML natifs

#### ✅ État cible
- Tous les formulaires avec FormField + Input/Select
- Modals standardisés avec Modal partagé
- Suppression de la fonction Spinner custom

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: CreateEditCourseRecurrentModal (3-4h)**
  - [ ] Migrer type_cours → FormField + Select
  - [ ] Migrer jour_semaine → FormField + Select
  - [ ] Migrer heure_debut → FormField + Input type="time"
  - [ ] Migrer heure_fin → FormField + Input type="time"
  - [ ] Migrer active → FormField + Switch
  - [ ] Migrer professeur_ids → FormField + MultiSelect

- [ ] **Phase 2: CreateProfessorModal (2-3h)**
  - [ ] Migrer tous les champs vers FormField + Input
  - [ ] Utiliser Modal partagé
  - [ ] Validation inline

- [ ] **Phase 3: Autres modals (2-3h)**
  - [ ] GenerateCoursesModal → FormField + DatePicker
  - [ ] CreateSessionModal → FormField + Input
  - [ ] AttendanceModal → OK (logique spécifique)

- [ ] **Phase 4: Spinner custom (30min)**
  - [ ] Supprimer fonction Spinner (lignes 109-115)
  - [ ] Utiliser LoadingSpinner partout

- [ ] **Phase 5: Tests (1h)**
  - [ ] Tester création cours récurrent
  - [ ] Tester création professeur
  - [ ] Tester génération de séances
  - [ ] Tester création séance ponctuelle
```

---

### 6. StorePage
**Effort:** 10-12 heures | **Impact:** Standardisation massive

#### 📍 Contexte
Page complexe avec 6 onglets, 6 modals custom, formulaires inline et PaginationBar custom.

#### ❌ État actuel (Score: 76/100)
- 6 modals custom (Category, Size, Article, StockAdjust, QuickOrder, OrderDetail)
- PaginationBar custom (lignes 118-202)
- Beaucoup de formulaires inline

#### ✅ État cible
- Tous les modals standardisés avec Modal partagé
- PaginationBar importé depuis shared
- Tous les formulaires avec FormField

#### 📋 Checklist de migration

```markdown
- [ ] **Phase 1: Suppression PaginationBar custom (1h)**
  - [ ] Supprimer fonction PaginationBar (lignes 118-202)
  - [ ] Importer depuis shared/components
  - [ ] Économie: ~85 lignes

- [ ] **Phase 2: CategoryModal (1-2h)**
  - [ ] Migrer vers Modal partagé
  - [ ] FormField + Input pour nom
  - [ ] FormField + TextArea pour description

- [ ] **Phase 3: SizeModal (1h)**
  - [ ] Migrer vers Modal partagé
  - [ ] FormField + Input pour nom

- [ ] **Phase 4: ArticleModal (2-3h)**
  - [ ] Migrer vers Modal partagé
  - [ ] FormField + Input pour nom, prix, stock
  - [ ] FormField + Select pour catégorie
  - [ ] FormField + FileInput pour image

- [ ] **Phase 5: StockAdjustModal (1-2h)**
  - [ ] Migrer vers Modal partagé
  - [ ] FormField + Input type="number" pour quantité
  - [ ] FormField + Select pour type d'ajustement

- [ ] **Phase 6: QuickOrderModal et OrderDetailModal (2-3h)**
  - [ ] Migrer vers Modal partagé
  - [ ] Standardiser les formulaires

- [ ] **Phase 7: Tests (1-2h)**
  - [ ] Tester tous les onglets
  - [ ] Tester toutes les actions CRUD
  - [ ] Tester la pagination
```

---

## 📅 PLANNING RECOMMANDÉ

### Semaine 1 - Critique
**Objectif:** Compléter l'Auth

| Jour | Tâche | Durée | Livrables |
|------|-------|-------|-----------|
| Lun | RegisterPage - Layout + Champs de base | 3-4h | AuthPageContainer, 6 FormField |
| Mar | RegisterPage - Mot de passe + Finalisation | 3-4h | PasswordInput, Tests complets |

**Résultat:** 12/17 pages migrées (70.6%)

---

### Semaine 2 - Haute Priorité
**Objectif:** Nettoyer le code dupliqué

| Jour | Tâche | Durée | Livrables |
|------|-------|-------|-----------|
| Mer | SettingsPage - Icônes | 4-5h | 14 Heroicons |
| Jeu | SettingsPage - Formulaires | 4-5h | FormField partout |
| Ven | SettingsPage - Finalisation + PaymentsPage | 4-5h | Tests + Suppression code dupliqué |

**Résultat:** 14/17 pages migrées (82.4%)

---

### Semaine 3-4 - Moyenne Priorité
**Objectif:** Standardiser modals et formulaires

| Jour | Tâche | Durée | Livrables |
|------|-------|-------|-----------|
| Lun | UsersPage - Badges + 2 modals | 3-4h | Badge.*, 2 modals migrés |
| Mar | UsersPage - 3 modals restants | 2-3h | 5 modals standardisés |
| Mer | CoursesPage - CreateEditCourseRecurrentModal | 3-4h | Formulaire migré |
| Jeu | CoursesPage - Autres modals | 4-5h | Tous les modals migrés |
| Ven | StorePage - PaginationBar + 3 modals | 5-6h | Code propre |
| Lun S4 | StorePage - 3 modals restants | 5-6h | Tous les modals migrés |

**Résultat final:** 17/17 pages migrées (100%) ✅

---

## 🎯 OBJECTIFS DE SUCCÈS

### Métriques quantitatives
- [ ] 17/17 pages migrées (100%)
- [ ] Score moyen ≥ 95/100
- [ ] Code réduit de ~850 lignes
- [ ] 0 composant custom dupliqué

### Métriques qualitatives
- [ ] Cohérence visuelle totale entre toutes les pages
- [ ] Accessibilité améliorée (aria-labels, roles)
- [ ] Responsive sur tous les écrans
- [ ] Code maintenable et DRY
- [ ] Documentation à jour

---

## 📚 RESSOURCES

### Documentation
- `frontend/DESIGN_SYSTEM.md` - Catalogue complet
- `frontend/MIGRATION_GUIDE.md` - Guide de migration
- `frontend/MIGRATION_AUDIT_PAGES.md` - Audit détaillé

### Composants clés
- **Layout:** PageHeader, LoadingSpinner, EmptyState
- **Forms:** FormField, Input, Select, TextArea, PasswordInput
- **Buttons:** Button, SubmitButton, IconButton
- **Feedback:** AlertBanner, ErrorBanner
- **Navigation:** TabGroup, PaginationBar
- **Data:** DataTable
- **Modal:** Modal, ConfirmDialog
- **Badge:** Badge.Role, Badge.Status

### Tokens
- `LAYOUT.pageHeader.*`
- `BUTTON.*`
- `COLORS.*`
- `TYPOGRAPHY.*`

---

## ✅ VALIDATION

Pour chaque page migrée, vérifier :

```markdown
- [ ] ✅ PageHeader utilisé avec tokens LAYOUT.pageHeader
- [ ] ✅ Pas de SVG inline (Heroicons uniquement)
- [ ] ✅ Pas de composants custom dupliqués
- [ ] ✅ FormField + Input pour tous les formulaires
- [ ] ✅ Modal/ConfirmDialog pour tous les dialogues
- [ ] ✅ Button/SubmitButton pour tous les boutons
- [ ] ✅ LoadingSpinner pour tous les loadings
- [ ] ✅ EmptyState pour tous les états vides
- [ ] ✅ AlertBanner/ErrorBanner pour tous les feedbacks
- [ ] ✅ Tests manuels OK
- [ ] ✅ Documentation mise à jour
```

---

**Dernière mise à jour:** 2024
**Prochaine révision:** Après chaque page migrée