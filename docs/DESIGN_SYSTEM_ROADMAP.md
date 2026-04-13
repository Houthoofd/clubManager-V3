# 🗺️ Design System Refactoring - Roadmap

**Projet:** ClubManager V3 - Standardisation du Design System  
**Branche:** `refactor/design-system-consistency`  
**Objectif:** Passer de 7.2/10 à 9/10 en cohérence visuelle  
**Durée estimée:** 15-20 jours (1 développeur)  
**Date de début:** Janvier 2025

---

## 📊 Progression Globale

```
████████░░░░░░░░░░░░ 20% (Phase 1 terminée)
```

**Légende:**
- ✅ Terminé
- 🚧 En cours
- ⏳ À venir
- ⏸️ En pause

---

## 🎯 Vue d'Ensemble

| Phase | Statut | Tâches | Complété | Durée | Priorité |
|-------|--------|--------|----------|-------|----------|
| **1. Fondations** | ✅ Terminé | 4/4 | 100% | 2j | 🔴 Critique |
| **2. Composants de Base** | 🚧 En cours | 0/4 | 0% | 3-4j | 🔴 Critique |
| **3. Migration Pages** | ⏳ À venir | 0/9 | 0% | 5-7j | 🟡 Important |
| **4. Migration Composants** | ⏳ À venir | 0/13 | 0% | 3-4j | 🟡 Important |
| **5. Nettoyage & Tests** | ⏳ À venir | 0/6 | 0% | 2-3j | 🟢 Normal |

**Total:** 4/36 tâches complétées (11%)

---

## 📅 Timeline

```
Semaine 1: ████████████████████ TERMINÉ
Semaine 2: ░░░░░░░░░░░░░░░░░░░░ Composants de Base
Semaine 3: ░░░░░░░░░░░░░░░░░░░░ Migration Pages (1/2)
Semaine 4: ░░░░░░░░░░░░░░░░░░░░ Migration Pages (2/2) + Composants
Semaine 5: ░░░░░░░░░░░░░░░░░░░░ Nettoyage & Tests
```

---

## 🏗️ Phase 1: Fondations ✅ TERMINÉ

**Objectif:** Établir les bases du nouveau design system  
**Durée:** 2 jours  
**Statut:** ✅ 100% (4/4)

### Tâches

- [x] **1.1 Audit de Style Complet**
  - Fichier: `docs/AUDIT_STYLE.md` (900 lignes)
  - Fichier: `docs/AUDIT_STYLE_SUMMARY.md` (200 lignes)
  - Note attribuée: 7.2/10
  - Incohérences identifiées: 10 majeures
  - Commit: `266a688`

- [x] **1.2 Design Tokens System**
  - Fichier: `frontend/src/shared/styles/designTokens.ts` (514 lignes)
  - Tokens créés: Colors, Spacing, Radius, Shadows, Typography
  - Composants tokens: Card, Button, Badge, Modal, Input, Tabs, etc.
  - Helper functions: `cn()`, `cardClass()`, `buttonClass()`, etc.
  - Commit: `1751082`

- [x] **1.3 Composant Card**
  - Fichier: `frontend/src/shared/components/Card.tsx` (178 lignes)
  - Variants: compact, standard, emphasis
  - Sub-components: Card.Header, Card.Body, Card.Footer
  - Props: hover, shadow, noPadding, noBorder
  - Commit: `1751082`

- [x] **1.4 Documentation**
  - Fichier: `frontend/src/shared/components/Card.md` (395 lignes)
  - Fichier: `frontend/src/shared/components/Card.examples.tsx` (371 lignes)
  - Fichier: `docs/REFACTORING_GUIDE.md` (614 lignes)
  - 9 exemples d'utilisation
  - Guide de migration complet
  - Commit: `db64b38`

### Résultats Phase 1

✅ **Système de tokens centralisé**  
✅ **Composant Card réutilisable**  
✅ **Documentation complète**  
✅ **Exemples pratiques**  
✅ **Guide de migration**

---

## 🔨 Phase 2: Composants de Base 🚧 EN COURS

**Objectif:** Créer tous les composants réutilisables essentiels  
**Durée:** 3-4 jours  
**Statut:** 🚧 0% (0/4)  
**Priorité:** 🔴 Critique

### Tâches

- [ ] **2.1 Composant Button** ⏳
  - **Estimation:** 2-3 heures
  - **Priorité:** 🔴 Haute
  - **Fichiers à créer:**
    - `frontend/src/shared/components/Button.tsx`
    - `frontend/src/shared/components/Button.md`
    - `frontend/src/shared/components/Button.examples.tsx`
  - **Variants à implémenter:**
    - primary, secondary, outline, danger, success, ghost
  - **Tailles:** xs, sm, md, lg, xl
  - **Features:**
    - Loading state avec spinner
    - Icon support (left/right)
    - Disabled state
    - Full width option
  - **Tests:** Vérifier tous les variants visuellement

- [ ] **2.2 Composant Badge** ⏳
  - **Estimation:** 1-2 heures
  - **Priorité:** 🔴 Haute
  - **Fichiers à créer:**
    - `frontend/src/shared/components/Badge.tsx`
    - `frontend/src/shared/components/Badge.md`
    - `frontend/src/shared/components/Badge.examples.tsx`
  - **Variants à implémenter:**
    - success, warning, danger, info, neutral, purple, orange
  - **Tailles:** sm, md, lg
  - **Features:**
    - Dot indicator support
    - Icon support
    - Removable (avec X)
  - **Migration:** Remplacer tous les badges existants (6 composants)

- [ ] **2.3 Composant Modal** ⏳
  - **Estimation:** 3-4 heures
  - **Priorité:** 🔴 Haute
  - **Fichiers à créer:**
    - `frontend/src/shared/components/Modal.tsx`
    - `frontend/src/shared/components/Modal.md`
    - `frontend/src/shared/components/Modal.examples.tsx`
  - **Tailles:** sm, md, lg, xl, 2xl, 3xl, 4xl
  - **Features:**
    - Header avec titre + sous-titre + bouton X
    - Body scrollable
    - Footer avec actions
    - Overlay click to close
    - Escape key to close
    - Focus trap
  - **Tests:** Tester sur tous les navigateurs

- [ ] **2.4 Composant Input** ⏳
  - **Estimation:** 2-3 heures
  - **Priorité:** 🟡 Moyenne
  - **Fichiers à créer:**
    - `frontend/src/shared/components/Input.tsx`
    - `frontend/src/shared/components/Input.md`
    - `frontend/src/shared/components/Input.examples.tsx`
  - **Types:** text, email, password, number, tel, url
  - **Tailles:** sm, md, lg
  - **Features:**
    - Error state avec message
    - Success state
    - Icon left/right
    - Prefix/Suffix
    - Helper text
    - Character count
  - **Composants associés:**
    - Textarea
    - Select
    - Checkbox
    - Radio

### Métriques Phase 2

- **Composants créés:** 0/4
- **Fichiers créés:** 0/12
- **Lignes de code estimées:** ~2000
- **Tests visuels:** 0/4

---

## 📄 Phase 3: Migration Pages ⏳ À VENIR

**Objectif:** Migrer toutes les pages vers les nouveaux composants  
**Durée:** 5-7 jours  
**Statut:** ⏳ 0% (0/9)  
**Priorité:** 🟡 Important

### Tâches

#### 3.1 Pages d'Authentification

- [ ] **LoginPage** ⏳
  - **Fichier:** `frontend/src/features/auth/pages/LoginPage.tsx`
  - **Estimation:** 1-2 heures
  - **Composants à utiliser:** Card (emphasis, shadow="2xl"), Button, Input
  - **Changements:**
    - Remplacer div par `<Card variant="emphasis" shadow="2xl">`
    - Utiliser `<Button>` pour les actions
    - Utiliser `<Input>` pour les champs
  - **Impact:** Moyen

- [ ] **RegisterPage** ⏳
  - **Fichier:** `frontend/src/features/auth/pages/RegisterPage.tsx`
  - **Estimation:** 1-2 heures
  - **Composants:** Card (emphasis), Button, Input
  - **Impact:** Moyen

- [ ] **ForgotPasswordPage** ⏳
  - **Fichier:** `frontend/src/features/auth/pages/ForgotPasswordPage.tsx`
  - **Estimation:** 30 min
  - **Composants:** Card (emphasis), Button, Input
  - **Impact:** Faible

#### 3.2 Pages Principales

- [ ] **CoursesPage** ⏳
  - **Fichier:** `frontend/src/features/courses/pages/CoursesPage.tsx`
  - **Estimation:** 3-4 heures
  - **Composants:** Card (standard + compact), Button, Badge
  - **Changements:**
    - Carte principale planning: `<Card variant="standard">`
    - Cartes de cours: `<Card variant="compact" hover>`
    - Boutons actions: `<Button>`
  - **Impact:** Élevé (beaucoup de cartes)

- [ ] **FamilyPage** ⏳
  - **Fichier:** `frontend/src/features/families/pages/FamilyPage.tsx`
  - **Estimation:** 3-4 heures
  - **Composants:** Card (standard + compact), Button, Badge
  - **Changements:**
    - Carte principale famille: `<Card variant="standard">`
    - FamilyMemberCard: `<Card variant="compact" hover>`
    - Badges de statut: `<Badge>`
  - **Impact:** Élevé

- [ ] **PaymentsPage** ⏳
  - **Fichier:** `frontend/src/features/payments/pages/PaymentsPage.tsx`
  - **Estimation:** 3-4 heures
  - **Composants:** Card, Button, Badge (statuts paiement)
  - **Impact:** Élevé

- [ ] **StorePage** ⏳
  - **Fichier:** `frontend/src/features/store/pages/StorePage.tsx`
  - **Estimation:** 4-5 heures
  - **Composants:** Card (standard + compact), Button, Badge
  - **Changements:**
    - Grille articles: `<Card variant="compact" hover>`
    - Cartes commandes: `<Card variant="compact">`
    - StockBadge: `<Badge>` avec dot indicator
  - **Impact:** Très élevé (page la plus complexe)

- [ ] **UsersPage** ⏳
  - **Fichier:** `frontend/src/features/users/pages/UsersPage.tsx`
  - **Estimation:** 2-3 heures
  - **Composants:** Card, Button, Badge (rôles + statuts)
  - **Impact:** Moyen

- [ ] **DashboardPage** ⏳
  - **Fichier:** `frontend/src/features/statistics/pages/DashboardPage.tsx`
  - **Estimation:** 3-4 heures
  - **Composants:** Card (compact pour stats), Button
  - **Changements:**
    - StatCard: `<Card variant="compact">`
    - Cartes graphiques: `<Card variant="standard">`
  - **Impact:** Élevé

#### 3.3 Autres Pages

- [ ] **SettingsPage** ⏳
  - **Estimation:** 2 heures
  - **Impact:** Moyen

- [ ] **MessagesPage** ⏳
  - **Estimation:** 2-3 heures
  - **Impact:** Moyen

### Métriques Phase 3

- **Pages migrées:** 0/9
- **Cartes remplacées:** 0/~50
- **Boutons standardisés:** 0/~100
- **Commits:** 0/9

---

## 🧩 Phase 4: Migration Composants ⏳ À VENIR

**Objectif:** Migrer tous les modals et composants spécifiques  
**Durée:** 3-4 jours  
**Statut:** ⏳ 0% (0/13)  
**Priorité:** 🟡 Important

### 4.1 Modals

- [ ] **AddFamilyMemberModal** ⏳
  - **Fichier:** `frontend/src/features/families/components/AddFamilyMemberModal.tsx`
  - **Estimation:** 1-2 heures
  - **Changements:**
    - Utiliser `<Modal>` avec header/body/footer
    - Ajouter bouton X manquant
    - Uniformiser overlay opacity à /50
  - **Impact:** Moyen

- [ ] **ComposeModal** ⏳
  - **Fichier:** `frontend/src/features/messaging/components/ComposeModal.tsx`
  - **Estimation:** 1-2 heures
  - **Changements:**
    - Fixer overlay `/40` → `/50`
    - Fixer border-radius `xl` → `2xl`
    - Standardiser borders `gray-200` → `gray-100`
  - **Impact:** Moyen

- [ ] **RecordPaymentModal** ⏳
  - **Estimation:** 1 heure
  - **Impact:** Faible

- [ ] **ArticleModal** ⏳
  - **Estimation:** 1 heure
  - **Impact:** Faible

- [ ] **CartModal** ⏳
  - **Estimation:** 1-2 heures
  - **Impact:** Moyen

- [ ] **TemplateEditorModal** ⏳
  - **Estimation:** 1 heure
  - **Impact:** Faible

- [ ] **SendFromTemplateModal** ⏳
  - **Estimation:** 1 heure
  - **Impact:** Faible

### 4.2 Badge Components

- [ ] **PaymentStatusBadge** ⏳
  - **Fichier:** `frontend/src/features/payments/components/PaymentStatusBadge.tsx`
  - **Estimation:** 30 min
  - **Changements:** Utiliser `<Badge variant="..."/>`
  - **Impact:** Faible

- [ ] **PaymentMethodBadge** ⏳
  - **Estimation:** 45 min (avec icônes)
  - **Impact:** Moyen

- [ ] **OrderStatusBadge** ⏳
  - **Estimation:** 30 min
  - **Impact:** Faible

- [ ] **StockBadge** ⏳
  - **Estimation:** 45 min (avec dot indicator)
  - **Impact:** Moyen

- [ ] **UserRoleBadge** ⏳
  - **Estimation:** 30 min
  - **Impact:** Faible

- [ ] **UserStatusBadge** ⏳
  - **Estimation:** 30 min
  - **Impact:** Faible

### 4.3 Autres Composants

- [ ] **FamilyMemberCard** ⏳
  - **Estimation:** 1 heure
  - **Changements:** Utiliser `<Card variant="compact" hover>`

- [ ] **StatCard** ⏳
  - **Estimation:** 1 heure
  - **Changements:** Utiliser `<Card variant="compact">`

### Métriques Phase 4

- **Modals migrés:** 0/7
- **Badges migrés:** 0/6
- **Autres composants:** 0/2
- **Commits:** 0/13

---

## 🧹 Phase 5: Nettoyage & Tests ⏳ À VENIR

**Objectif:** Finaliser la migration et nettoyer le code  
**Durée:** 2-3 jours  
**Statut:** ⏳ 0% (0/6)  
**Priorité:** 🟢 Normal

### Tâches

- [ ] **5.1 Supprimer Classes CSS Inutilisées** ⏳
  - **Fichier:** `frontend/src/index.css`
  - **Estimation:** 1 heure
  - **Classes à supprimer:**
    - `.badge`, `.badge-primary`, `.badge-success`, etc.
    - `.btn`, `.btn-primary`, `.btn-secondary`, etc.
    - `.card`, `.card-header`
  - **Impact:** Nettoyage code mort

- [ ] **5.2 Uniformiser les Layouts** ⏳
  - **Fichiers:**
    - `frontend/src/layouts/PublicLayout.tsx`
    - `frontend/src/layouts/PrivateLayout.tsx`
  - **Estimation:** 2 heures
  - **Changements:**
    - Uniformiser background `bg-gray-50`
    - Uniformiser transitions `duration-300`
    - Documenter différences intentionnelles

- [ ] **5.3 Tests Visuels Complets** ⏳
  - **Estimation:** 4-6 heures
  - **À tester:**
    - Toutes les pages (9)
    - Tous les modals (7)
    - Tous les composants (13)
    - Responsive (mobile, tablet, desktop)
    - Navigateurs (Chrome, Firefox, Safari, Edge)
  - **Outils:** Screenshots, DevTools, Responsive mode

- [ ] **5.4 Tests Fonctionnels** ⏳
  - **Estimation:** 2-3 heures
  - **À vérifier:**
    - Aucune régression fonctionnelle
    - Tous les clicks fonctionnent
    - Tous les formulaires soumettent
    - Navigation OK

- [ ] **5.5 Documentation Finale** ⏳
  - **Estimation:** 2 heures
  - **Fichiers à mettre à jour:**
    - README.md principal
    - CHANGELOG.md
    - Storybook (si applicable)
  - **À créer:**
    - Guide de contribution design
    - Best practices

- [ ] **5.6 Code Review & Merge** ⏳
  - **Estimation:** 2-3 heures
  - **Actions:**
    - Review complète du code
    - Correction des retours
    - Merge dans develop
    - Déploiement en staging
    - Tests en staging

### Métriques Phase 5

- **Classes CSS supprimées:** 0/~15
- **Pages testées:** 0/9
- **Modals testés:** 0/7
- **Navigateurs testés:** 0/4
- **Documentation mise à jour:** Non

---

## 📊 Métriques de Succès

### Objectifs Quantitatifs

| Métrique | Avant | Objectif | Actuel | Statut |
|----------|-------|----------|--------|--------|
| **Note cohérence visuelle** | 7.2/10 | 9/10 | 7.2/10 | ⏳ |
| **Variations de cartes** | 15 | 3 | 15 | ⏳ |
| **Border-radius uniques** | 3 | 1 | 3 | ⏳ |
| **Composants réutilisables** | 0 | 4+ | 1 | 🚧 |
| **Pages standardisées** | 0/9 | 9/9 | 0/9 | ⏳ |
| **Modals standardisés** | 0/7 | 7/7 | 0/7 | ⏳ |
| **Lignes de code CSS** | ~500 | ~300 | ~500 | ⏳ |

### Objectifs Qualitatifs

- [ ] Design cohérent à 95%+
- [ ] Maintenance simplifiée (1 composant vs 15 patterns)
- [ ] Onboarding développeurs accéléré
- [ ] Bugs visuels réduits de 80%
- [ ] Temps d'ajout features réduit de 50%
- [ ] Documentation complète et à jour

---

## 🚀 Quick Wins Identifiés

### Déjà Réalisés ✅

1. ✅ **Design Tokens** → Centralisation des styles
2. ✅ **Composant Card** → Réutilisable partout

### À Réaliser Prochainement

3. ⏳ **LoginPage** → Impact visuel immédiat, page visible
4. ⏳ **StorePage** → Page la plus utilisée, beaucoup de cartes
5. ⏳ **Composant Button** → Utilisé partout, gain de cohérence
6. ⏳ **ComposeModal** → Fixer incohérences majeures

---

## 🔄 Processus de Travail

### Pour chaque tâche:

1. **Créer une branche** (si nécessaire)
   ```bash
   git checkout -b feature/[component-name]
   ```

2. **Développer**
   - Créer les fichiers
   - Implémenter le composant
   - Créer les exemples
   - Écrire la documentation

3. **Tester**
   - Tests visuels
   - Tests fonctionnels
   - Tests responsive

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add [Component] component"
   ```

5. **Update Roadmap**
   - Cocher la tâche
   - Mettre à jour les métriques
   - Commit la roadmap

6. **Push**
   ```bash
   git push origin refactor/design-system-consistency
   ```

---

## 📝 Notes Importantes

### Décisions Prises

1. ✅ **Border-radius standard:** `rounded-xl` (16px)
2. ✅ **Bordures standard:** `border-gray-100`
3. ✅ **Shadow par défaut:** `shadow-sm`
4. ✅ **Padding variants:** p-4 (compact), p-6 (standard), p-8 (emphasis)
5. ✅ **Overlay opacity:** `bg-black/50` (50%)

### À Décider

- [ ] Créer un Storybook?
- [ ] Ajouter des tests unitaires pour composants?
- [ ] Créer un thème sombre?
- [ ] Exporter le design system en package séparé?

### Risques Identifiés

1. **Régression visuelle** → Mitigation: Tests visuels systématiques
2. **Temps sous-estimé** → Mitigation: Buffer de 20% sur estimations
3. **Résistance au changement** → Mitigation: Documentation claire, exemples

---

## 📞 Contact & Support

**Questions sur la roadmap?**  
Voir la documentation complète dans `docs/`

**Blocker technique?**  
Créer une issue avec le label `design-system`

**Suggestion d'amélioration?**  
Contribuer à cette roadmap directement

---

## 🎯 Prochaine Action Immédiate

**À faire maintenant:**

1. [ ] Créer le composant Button (2-3h)
2. [ ] Créer le composant Badge (1-2h)
3. [ ] Migrer LoginPage (1-2h)

**Estimation:** 4-7 heures de travail

---

## ✅ Checklist de Fin de Projet

- [ ] Toutes les phases complétées (1-5)
- [ ] Note de cohérence ≥ 9/10
- [ ] Documentation complète
- [ ] Tests passants
- [ ] Code review validée
- [ ] Merged dans develop
- [ ] Déployé en staging
- [ ] Tests staging OK
- [ ] Merged dans main
- [ ] Déployé en production
- [ ] Rétrospective réalisée

---

**Dernière mise à jour:** Janvier 2025  
**Maintenu par:** Équipe Dev ClubManager  
**Version:** 1.0