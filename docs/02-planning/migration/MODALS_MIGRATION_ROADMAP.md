# 🗺️ Roadmap de Migration des Modals - ClubManager V3

> **Objectif :** Atteindre 100% d'uniformisation des modals avec les composants réutilisables

---

## 📊 Vue d'Ensemble

```
PROGRESSION GLOBALE : ███████░░░░░░░░░░░░░░ 35%

Total Modals : 27
✅ Migrées  : 7  (26%)
⚠️ À migrer : 19 (70%)
❌ window.confirm : 2 (4%)
```

### Objectif par Sprint

| Sprint | Objectif | Modals Ciblées | Gain Estimé |
|--------|----------|----------------|-------------|
| **Sprint 0** (Urgent) | 45% | 2 window.confirm | UX immédiat |
| **Sprint 1** | 65% | CoursesPage (6) | 400 lignes |
| **Sprint 2** | 85% | Users + Payments (5) | 350 lignes |
| **Sprint 3** | 100% | Store + divers (8) | 400 lignes |

---

## 🚨 SPRINT 0 : Quick Wins (URGENT)

**Durée :** 30 minutes  
**Impact :** UX immédiat + conformité

### Tâches

```bash
[ ] 1. StorePage - Annulation commande (L1108-1112)
    └─ Remplacer window.confirm par ConfirmDialog
    └─ Temps : 15 min
    
[ ] 2. CartModal - Vider panier (L79-83)
    └─ Remplacer window.confirm par ConfirmDialog
    └─ Temps : 15 min
```

### Code Template

```tsx
// Avant
if (window.confirm('Êtes-vous sûr ?')) { ... }

// Après
const [showConfirm, setShowConfirm] = useState(false);
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleAction}
  title="Confirmer l'action"
  message="Êtes-vous sûr de vouloir continuer ?"
  variant="danger"
/>
```

**✅ Validation :**
- [ ] Aucun `window.confirm()` dans le codebase
- [ ] Tests manuels réussis
- [ ] Commit: `fix: replace window.confirm with ConfirmDialog`

---

## 🎯 SPRINT 1 : CoursesPage (Priorité Haute)

**Durée :** 2-3 jours  
**Impact :** 🔥 Plus grande réduction de code

### Statistiques

```
Fichier : features/courses/pages/CoursesPage.tsx
Lignes actuelles : ~2,000
Modals custom : 6
Lignes modal code : ~930
Gain estimé : -400 lignes (43%)
```

### Modals à Migrer

| # | Modal | Lignes | Complexité | Temps |
|---|-------|--------|------------|-------|
| 1 | `ModalBackdrop` | 25 | 🟢 Basse | 30 min |
| 2 | `ModalHeader` | 20 | 🟢 Basse | 20 min |
| 3 | `CreateEditCourseRecurrentModal` | 290 | 🔴 Élevée | 4h |
| 4 | `CreateProfessorModal` | 195 | 🔴 Élevée | 3h |
| 5 | `GenerateCoursesModal` | 125 | 🟠 Moyenne | 2h |
| 6 | `CreateSessionModal` | 165 | 🟠 Moyenne | 2.5h |
| 7 | `AttendanceModal` | 215 | 🔴 Élevée | 4h |

**Total estimé :** 16-20 heures

### Plan d'Action

#### Jour 1 (8h)
```
09:00-09:30 ▸ ModalBackdrop → Modal
09:30-10:00 ▸ ModalHeader → Modal.Header
10:00-14:00 ▸ CreateEditCourseRecurrentModal
14:00-17:00 ▸ CreateProfessorModal
17:00-18:00 ▸ Tests + Review
```

#### Jour 2 (8h)
```
09:00-11:00 ▸ GenerateCoursesModal
11:00-13:30 ▸ CreateSessionModal
14:30-18:00 ▸ AttendanceModal
```

#### Jour 3 (4h)
```
09:00-11:00 ▸ Tests d'intégration complets
11:00-13:00 ▸ Documentation + Refactoring
```

### Checklist

- [ ] Supprimer `ModalBackdrop` custom
- [ ] Supprimer `ModalHeader` custom
- [ ] Migrer 7 modals vers `Modal` réutilisable
- [ ] Tester accessibilité (Tab, ESC, Focus)
- [ ] Tester responsive (mobile, tablet, desktop)
- [ ] Vérifier tous les formulaires fonctionnent
- [ ] Code review avec l'équipe
- [ ] Merge + Deploy staging

**✅ Validation :**
```bash
npm run test:e2e -- courses
npm run lighthouse -- /courses
```

---

## 👥 SPRINT 2 : Users & Payments (Priorité Haute)

**Durée :** 3-4 jours  
**Impact :** Cohérence gestion utilisateurs + paiements

### Part 1 : Users (1.5 jours)

| Modal | Fichier | Lignes | Temps |
|-------|---------|--------|-------|
| DeleteUserModal | `users/components/` | 250 | 3h |
| EditUserRoleModal | `users/components/` | 200 | 2.5h |
| EditUserStatusModal | `users/components/` | 180 | 2h |

**Sous-total :** 7.5h

### Part 2 : Payments (2 jours)

| Modal | Fichier | Lignes | Temps |
|-------|---------|--------|-------|
| PricingPlanFormModal | `payments/components/` | 350 | 5h |
| StripePaymentModal | `payments/components/` | 460 | 8h |

**Sous-total :** 13h (Stripe complexe)

### Attention Particulière

⚠️ **StripePaymentModal** nécessite :
- Préserver l'intégration Stripe Elements
- Tester les webhooks
- Valider avec Stripe test keys
- Tests de paiement end-to-end

### Checklist

- [ ] **Users (3 modals)**
  - [ ] DeleteUserModal migré
  - [ ] EditUserRoleModal migré
  - [ ] EditUserStatusModal migré
  - [ ] Tests permissions (admin/member)
  
- [ ] **Payments (2 modals)**
  - [ ] PricingPlanFormModal migré
  - [ ] StripePaymentModal migré
  - [ ] Tests Stripe (test mode)
  - [ ] Validation webhooks

**✅ Validation :**
```bash
npm run test:unit -- users
npm run test:unit -- payments
npm run test:e2e -- payments/stripe
```

---

## 🏪 SPRINT 3 : Store & Finalisation

**Durée :** 3 jours  
**Impact :** 100% cohérence

### Modals Store (6 modals)

| # | Modal | Lignes | Temps |
|---|-------|--------|-------|
| 1 | CategoryModal | 300 | 3h |
| 2 | SizeModal | 250 | 2.5h |
| 3 | OrderDetailModal | 200 | 2h |
| 4 | QuickOrderModal | 180 | 2h |
| 5 | StockAdjustModal | 150 | 1.5h |
| 6 | TemplateTypeModal (messaging) | 300 | 3h |

**Sous-total Store :** 14h

### Modals Users (2 modals)

| # | Modal | Lignes | Temps |
|---|-------|--------|-------|
| 7 | NotifyUsersModal | 200 | 2.5h |
| 8 | SendToUserModal | 180 | 2h |

**Sous-total Users :** 4.5h

### Plan Final

#### Jour 1 : Store (Part 1)
```
09:00-12:00 ▸ CategoryModal + SizeModal
13:00-15:00 ▸ OrderDetailModal
15:00-17:00 ▸ QuickOrderModal
17:00-18:00 ▸ Tests
```

#### Jour 2 : Store (Part 2) + Users
```
09:00-10:30 ▸ StockAdjustModal
10:30-13:30 ▸ TemplateTypeModal
14:30-17:00 ▸ NotifyUsersModal
17:00-18:00 ▸ SendToUserModal
```

#### Jour 3 : Finalisation
```
09:00-12:00 ▸ Tests complets de régression
13:00-15:00 ▸ Documentation finale
15:00-17:00 ▸ Code review finale
17:00-18:00 ▸ Célébration 🎉 100% atteint !
```

### Checklist Finale

- [ ] Toutes les modals migrées (27/27)
- [ ] Aucun `window.confirm()` dans le code
- [ ] Aucune modal custom (sauf cas exceptionnels documentés)
- [ ] Tests d'accessibilité sur toutes les modals
- [ ] Documentation à jour
- [ ] Performance : bundle size réduit
- [ ] Code review complète
- [ ] Déploiement production

---

## 📈 Tracking de Progression

### Semaine par Semaine

```
Semaine 1 : ███████████████░░░░░░ 75% (Sprint 0 + 1)
Semaine 2 : ████████████████████░ 95% (Sprint 2)
Semaine 3 : ████████████████████████ 100% (Sprint 3)
```

### Métriques de Succès

| Métrique | Avant | Objectif | Actuel |
|----------|-------|----------|--------|
| Modals migrées | 7 (26%) | 27 (100%) | 7 (26%) |
| window.confirm | 2 | 0 | 2 |
| Lignes de code modal | ~4,500 | ~3,000 | ~4,500 |
| Score accessibilité | 60% | 100% | 60% |
| Temps maintenance | 100% | 40% | 100% |

---

## 🎯 Critères de Validation

### Pour chaque Modal Migrée

✅ **Fonctionnel**
- [ ] Ouvre/ferme correctement
- [ ] Formulaires valident les données
- [ ] Actions (save/cancel) fonctionnent
- [ ] Loading states corrects

✅ **Accessibilité**
- [ ] Fermeture avec ESC fonctionne
- [ ] Focus trap activé
- [ ] Tab navigation correcte
- [ ] ARIA labels présents
- [ ] Lecteur d'écran compatible

✅ **Responsive**
- [ ] Mobile (< 640px) : OK
- [ ] Tablet (640-1024px) : OK
- [ ] Desktop (> 1024px) : OK

✅ **Performance**
- [ ] Pas de re-renders inutiles
- [ ] Animations fluides (60fps)
- [ ] Bundle size optimisé

✅ **Code Quality**
- [ ] Pas de code dupliqué
- [ ] Props typées (TypeScript)
- [ ] Code review approuvée
- [ ] Tests unitaires passent

---

## 🚀 Quick Reference

### Import Pattern

```tsx
// ✅ Correct
import { Modal } from '@/shared/components/Modal';
import { ConfirmDialog } from '@/shared/components/Modal';

// ❌ Incorrect
import Modal from 'custom/path';
```

### Usage Pattern

```tsx
// Simple Modal
<Modal isOpen={isOpen} onClose={onClose} size="md">
  <Modal.Header title="Titre" onClose={onClose} />
  <Modal.Body>Contenu</Modal.Body>
  <Modal.Footer>Boutons</Modal.Footer>
</Modal>

// Confirm Dialog
<ConfirmDialog
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleConfirm}
  title="Confirmer"
  message="Message de confirmation"
  variant="danger"
  isLoading={isLoading}
/>
```

---

## 📞 Support & Questions

### Besoin d'Aide ?

1. 📖 Lire la doc : `frontend/src/shared/components/Modal/Modal.md`
2. 👀 Voir les exemples : Modals déjà migrées
3. 💬 Poser une question : Channel #frontend-help
4. 🐛 Problème bloquant : Créer une issue GitHub

### Exemples de Référence

- ✅ `AddFamilyMemberModal` - Formulaire simple
- ✅ `ComposeModal` - Modal avec état complexe
- ✅ `RecordPaymentModal` - Formulaire de paiement
- ✅ `ArticleModal` - CRUD avec upload d'image

---

## 🏆 Récompenses

### Objectifs Atteints

| Milestone | Reward |
|-----------|--------|
| Sprint 0 complété | ☕ Coffee break team |
| Sprint 1 complété | 🍕 Pizza lunch |
| Sprint 2 complété | 🎮 Game afternoon |
| 100% Migration | 🎉 Team celebration + 🏆 Trophy |

---

## 📝 Notes

### Décisions Techniques

- **Pourquoi Modal réutilisable ?**
  - Cohérence UX à travers toute l'app
  - Accessibilité garantie (ARIA, focus, ESC)
  - Maintenance centralisée
  - Réduction de 30% du code

- **Pourquoi pas de modal custom ?**
  - Code dupliqué = bugs dupliqués
  - Accessibilité difficile à maintenir
  - Onboarding plus complexe
  - Tests fragmentés

### Exceptions Autorisées

Seuls cas où une modal custom est acceptable :
1. **Intégration externe complexe** (ex: Stripe Elements - mais wrapper Modal)
2. **Performances critiques** (documenté et justifié)
3. **Design system externe** (approuvé par l'équipe)

> ⚠️ Toute exception doit être documentée et approuvée en code review

---

## 🎓 Learning Resources

### Avant de Commencer

1. Lire `Modal.tsx` (composant source)
2. Comprendre les props disponibles
3. Tester les exemples
4. Identifier le pattern dans votre modal actuelle

### Pendant la Migration

1. Suivre le template de ce document
2. Tester régulièrement
3. Demander un code review précoce
4. Documenter les difficultés

### Après la Migration

1. Mettre à jour la checklist
2. Documenter les learnings
3. Aider les autres migrations
4. Célébrer ! 🎉

---

**Dernière mise à jour :** Décembre 2024  
**Version :** 1.0  
**Statut :** 🚀 En cours

**Let's make our modals awesome! 💪**