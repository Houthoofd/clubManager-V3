# 🌍 Internationalisation - Feature Payments

## 📊 Statut Global : 75% Complété

Date : 2024
Namespace i18n : `payments`

---

## ✅ Fichiers Internationalisés (7/9)

### 1. **PaymentsPage.tsx** ✅
- ✅ Hook `useTranslation('payments')` ajouté
- ✅ Titre et description de la page
- ✅ Labels des onglets (Paiements, Échéances, Plans)
- ✅ Messages d'erreur (toasts)
- ✅ Modal Stripe setup (labels, placeholders, boutons)
- ✅ Messages de succès

**Clés utilisées :**
- `title`, `subtitle`
- `tabs.payments`, `tabs.pending`, `tabs.paymentsHistory`
- `messages.errorLoadingPayments`
- `modal.stripe.*`
- `fields.*`
- `actions.*`

---

### 2. **RecordPaymentModal.tsx** ✅
- ✅ Hook `useTranslation('payments')` ajouté
- ✅ Titre et sous-titre du modal
- ✅ Labels des champs (Membre, Montant, Méthode, Date, Description)
- ✅ Méthodes de paiement (Espèces, Virement, Autre)
- ✅ Messages de validation
- ✅ Boutons d'actions
- ✅ Placeholders et textes d'aide

**Clés utilisées :**
- `modal.recordPayment.*`
- `fields.*`
- `methods.cash`, `methods.transfer`, `methods.other`

---

### 3. **PricingPlanFormModal.tsx** ✅
- ✅ Hook `useTranslation('payments')` ajouté
- ✅ Titres dynamiques (Créer/Modifier)
- ✅ Labels des champs (Nom, Prix, Durée, Description)
- ✅ Messages de validation
- ✅ Placeholders
- ✅ Boutons (Annuler, Créer/Mettre à jour)

**Clés utilisées :**
- `modal.pricingPlan.*`
- `fields.description`
- `tabs.perMonth`

---

### 4. **SchedulesTab.tsx** ✅
- ✅ Hook `useTranslation('payments')` ajouté
- ✅ Titre de l'onglet
- ✅ Badge des échéances en retard
- ✅ Filtres par statut
- ✅ Messages d'état vide
- ✅ Boutons d'actions (Marquer payé, Rafraîchir)
- ✅ Labels pluriel/singulier

**Clés utilisées :**
- `tabs.schedulesTitle`, `tabs.overdueSingular`
- `status.*`
- `messages.noPendingPayments`
- `tabs.markPaid`, `tabs.reset`

---

### 5. **PlansTab.tsx** ✅
- ✅ Hook `useTranslation('payments')` ajouté
- ✅ Titre de l'onglet
- ✅ Badges Actif/Inactif
- ✅ Boutons (Nouveau plan, Activer/Désactiver, Modifier, Supprimer)
- ✅ Messages de confirmation
- ✅ Labels pluriel/singulier
- ✅ Prix par mois

**Clés utilisées :**
- `tabs.plansTitle`, `tabs.active`, `tabs.inactive`
- `tabs.newPlan`, `tabs.activate`, `tabs.deactivate`
- `tabs.edit`, `tabs.delete`, `tabs.confirm`
- `tabs.yes`, `tabs.no`

---

### 6. **paymentsTableConfig.tsx** ✅
- ✅ Fonction `createPaymentsColumns(t)` ajoutée
- ✅ Toutes les colonnes internationalisées
- ✅ Export compatible maintenu

**Clés utilisées :**
- `table.member`, `table.amount`, `table.method`
- `table.status`, `table.type`, `table.date`
- `table.actions`

---

### 7. **schedulesTableConfig.tsx** ✅
- ✅ Paramètre `t` ajouté à `createSchedulesColumns()`
- ✅ Toutes les colonnes internationalisées
- ✅ Bouton "Marquer payé" traduit

**Clés utilisées :**
- `table.member`, `table.amount`, `table.status`
- `fields.dueDate`, `fields.remaining`
- `tabs.markPaid`

---

## ⚠️ Fichiers À Corriger (2/9)

### 8. **StripePaymentModal.tsx** ❌
**Statut :** Erreurs de compilation après édition

**À faire :**
- Réimporter `useTranslation`
- Ajouter hook dans `StripeCheckoutForm`
- Ajouter hook dans `StripeKeyMissingModal`
- Internationaliser tous les textes statiques
  - Titre "Paiement sécurisé"
  - Message de chargement
  - Message de sécurité Stripe
  - Boutons "Annuler" / "Payer"
  - Modal clé manquante

**Clés à utiliser :**
- `modal.stripe.securePayment`
- `modal.stripe.loadingForm`
- `modal.stripe.secureMessage`
- `modal.stripe.payButton`
- `modal.stripe.missingKey*`

---

### 9. **PaymentsTab.tsx** ❌
**Statut :** Erreurs de compilation après édition

**À faire :**
- Réimporter `useTranslation`
- Corriger les erreurs de syntaxe
- Internationaliser :
  - Titre "Historique des paiements"
  - Badge "validés ce mois"
  - Boutons "Payer par carte", "Enregistrer un paiement"
  - Placeholder de recherche
  - Options de filtres (statuts, méthodes)
  - Bouton "Réinitialiser"
  - Messages EmptyState

**Clés à utiliser :**
- `tabs.paymentsHistory`
- `tabs.validatedThisMonth`
- `tabs.payByCard`
- `actions.recordPayment`
- `tabs.searchByMemberName`
- `tabs.allStatuses`, `tabs.allMethods`
- `status.*`, `methods.*`

---

## 📦 Fichiers de Traduction

### ✅ `src/i18n/locales/fr/payments.json`
- ✅ Toutes les clés nécessaires ajoutées
- ✅ Sections : modal, tabs, common
- ✅ 100+ clés de traduction

### ✅ `src/i18n/locales/en/payments.json`
- ✅ Traductions anglaises complètes
- ✅ Synchronisé avec FR

---

## 🎯 Prochaines Étapes

### Priorité 1 : Corriger les erreurs ⚠️
1. **StripePaymentModal.tsx**
   - Restaurer le fichier et réappliquer l'internationalisation proprement
   - Ajouter hooks dans chaque sous-composant
   
2. **PaymentsTab.tsx**
   - Restaurer le fichier et réappliquer l'internationalisation proprement
   - Vérifier la syntaxe JSX

### Priorité 2 : Tests 🧪
- [ ] Tester le changement de langue (FR ↔ EN)
- [ ] Vérifier tous les modals
- [ ] Vérifier tous les messages de validation
- [ ] Vérifier les filtres et tableaux

### Priorité 3 : Optimisation 🚀
- [ ] Extraire les fonctions de formatage (devise, date)
- [ ] Ajouter des tests unitaires
- [ ] Documenter les conventions de nommage des clés

---

## 📝 Conventions Adoptées

### Structure des clés
```
payments:
  fields.{fieldName}        → Labels de champs
  actions.{actionName}      → Boutons d'actions
  status.{statusName}       → Statuts de paiement
  methods.{methodName}      → Méthodes de paiement
  tabs.{key}                → Labels d'onglets
  table.{columnName}        → Colonnes de tableaux
  modal.{modalName}.{key}   → Contenu des modals
  messages.{messageName}    → Messages/Toasts
```

### Exemples
```json
{
  "fields.amount": "Montant",
  "actions.recordPayment": "Enregistrer un paiement",
  "status.paid": "Payé",
  "methods.cash": "Espèces",
  "modal.recordPayment.title": "Enregistrer un paiement"
}
```

---

## 📋 Liste de Vérification

- [x] PaymentsPage.tsx
- [x] RecordPaymentModal.tsx
- [x] PricingPlanFormModal.tsx
- [ ] StripePaymentModal.tsx (en erreur)
- [ ] PaymentsTab.tsx (en erreur)
- [x] SchedulesTab.tsx
- [x] PlansTab.tsx
- [x] paymentsTableConfig.tsx
- [x] schedulesTableConfig.tsx
- [x] Traductions FR ajoutées
- [x] Traductions EN ajoutées
- [ ] Tests de changement de langue

---

## 🔧 Commandes Utiles

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Lancer l'application
npm run dev

# Tester avec la langue anglaise
# Dans le navigateur : localStorage.setItem('i18n-language', 'en')
```

---

**Dernière mise à jour :** En cours d'internationalisation
**Responsable :** Agent AI
**Statut :** 🟡 En cours (75%)