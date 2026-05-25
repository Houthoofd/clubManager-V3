# 🌍 Guide d'Internationalisation - Fichiers Restants

Guide pratique pour terminer l'internationalisation des 2 derniers fichiers de la feature Payments.

---

## 📌 Contexte

Statut actuel : **7/9 fichiers internationalisés (75%)**

Fichiers à corriger :
1. ✅ `StripePaymentModal.tsx` - Instructions ci-dessous
2. ✅ `PaymentsTab.tsx` - Instructions ci-dessous

---

## 🔧 1. StripePaymentModal.tsx

### Localisation
`src/features/payments/components/StripePaymentModal.tsx`

### Import nécessaire
```typescript
import { useTranslation } from "react-i18next";
```

### Modifications à effectuer

#### A. Composant `StripeCheckoutForm`
```typescript
const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  onSuccess,
  onClose,
}) => {
  const { t } = useTranslation("payments"); // ← Ajouter cette ligne
  const stripe = useStripe();
  // ... reste du code
```

**Textes à remplacer :**

1. **Message d'erreur par défaut** (ligne ~91)
```typescript
// Avant :
error.message ?? "Une erreur est survenue lors du paiement."

// Après :
error.message ?? t("modal.stripe.errorProcessing")
```

2. **Message de chargement** (ligne ~150)
```typescript
// Avant :
Chargement du formulaire de paiement…

// Après :
{t("modal.stripe.loadingForm")}
```

3. **Message de sécurité** (ligne ~189)
```typescript
// Avant :
Paiement sécurisé par Stripe — vos données sont chiffrées

// Après :
{t("modal.stripe.secureMessage")}
```

4. **Bouton Annuler** (ligne ~197)
```typescript
// Avant :
Annuler

// Après :
{t("modal.recordPayment.cancel")}
```

5. **Bouton Payer** (ligne ~205)
```typescript
// Avant :
Payer {amountFormatted}

// Après :
{t("modal.stripe.payButton")} {amountFormatted}
```

---

#### B. Composant `StripeKeyMissingModal`
```typescript
const StripeKeyMissingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("payments"); // ← Ajouter cette ligne
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title={t("modal.stripe.missingKeyTitle")}
        subtitle={t("modal.stripe.missingKeySubtitle")}
        showCloseButton
        onClose={onClose}
      />
```

**Textes à remplacer :**

1. **Titre de l'erreur** (ligne ~252)
```typescript
// Avant :
Variable d'environnement requise

// Après :
{t("modal.stripe.missingKeyRequired")}
```

2. **Message principal** (ligne ~258)
```typescript
// Avant :
La variable d'environnement VITE_STRIPE_PUBLIC_KEY n'est pas définie.

// Après :
{t("modal.stripe.missingKeyMessage")}
```

3. **Instructions** (ligne ~264)
```typescript
// Avant :
Ajoutez cette clé dans votre fichier .env pour activer les paiements par carte bancaire.

// Après :
{t("modal.stripe.missingKeyInstruction")}
```

4. **Bouton Fermer** (ligne ~270)
```typescript
// Avant :
Fermer

// Après :
{t("modal.stripe.close")}
```

---

#### C. Composant Principal `StripePaymentModal`
```typescript
export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientSecret,
  amount,
}) => {
  const { t } = useTranslation("payments"); // ← Ajouter cette ligne
```

**Textes à remplacer :**

1. **Titre du header** (ligne ~354)
```typescript
// Avant :
Paiement sécurisé

// Après :
{t("modal.stripe.securePayment")}
```

2. **Label Montant** (ligne ~357)
```typescript
// Avant :
Montant :

// Après :
{t("modal.stripe.amount")}
```

---

#### D. Composant `StripeCheckoutFormActions`
```typescript
const StripeCheckoutFormActions: React.FC<{
  amount: number;
  onClose: () => void;
}> = ({ amount, onClose }) => {
  const { t } = useTranslation("payments"); // ← Ajouter cette ligne
```

**Textes à remplacer :**

1. **Bouton Annuler** (ligne ~427)
```typescript
// Avant :
Annuler

// Après :
{t("modal.recordPayment.cancel")}
```

2. **Bouton Payer** (ligne ~437)
```typescript
// Avant :
Payer {amountFormatted}

// Après :
{t("modal.stripe.payButton")} {amountFormatted}
```

---

## 🔧 2. PaymentsTab.tsx

### Localisation
`src/features/payments/components/tabs/PaymentsTab.tsx`

### Import nécessaire
```typescript
import { useTranslation } from "react-i18next";
```

### Modifications à effectuer

#### A. Ajouter le hook au début du composant
```typescript
export function PaymentsTab({
  filteredPayments,
  // ... autres props
}: PaymentsTabProps) {
  const { t } = useTranslation("payments"); // ← Ajouter cette ligne
  
  return (
    <div>
```

---

#### B. Titre de l'onglet (ligne ~87)
```typescript
// Avant :
<h2 className="text-base font-semibold text-gray-900">
  Historique des paiements
</h2>

// Après :
<h2 className="text-base font-semibold text-gray-900">
  {t("tabs.paymentsHistory")}
</h2>
```

---

#### C. Badge "validés ce mois" (ligne ~92)
```typescript
// Avant :
{formatCurrency(totalValidThisMonth)} validés ce mois

// Après :
{formatCurrency(totalValidThisMonth)} {t("tabs.validatedThisMonth")}
```

---

#### D. Compteur de paiements (ligne ~98)
```typescript
// Avant :
{paymentsPagination.total} paiement{paymentsPagination.total > 1 ? "s" : ""}

// Après :
{paymentsPagination.total} {paymentsPagination.total > 1 ? t("tabs.paymentPlural") : t("tabs.paymentSingular")}
```

---

#### E. Bouton "Payer par carte" (ligne ~119)
```typescript
// Avant :
<CreditCardIcon className="h-4 w-4" />
Payer par carte

// Après :
<CreditCardIcon className="h-4 w-4" />
{t("tabs.payByCard")}
```

---

#### F. Bouton "Enregistrer un paiement" (ligne ~141)
```typescript
// Avant :
Enregistrer un paiement

// Après :
{t("actions.recordPayment")}
```

---

#### G. Placeholder de recherche (ligne ~155)
```typescript
// Avant :
<SearchBar
  value={paymentSearch}
  onChange={setPaymentSearch}
  placeholder="Rechercher par nom de membre…"
  size="md"
  showClear
/>

// Après :
<SearchBar
  value={paymentSearch}
  onChange={setPaymentSearch}
  placeholder={t("tabs.searchByMemberName")}
  size="md"
  showClear
/>
```

---

#### H. Filtre Statut (lignes ~169-177)
```typescript
// Avant :
<option value="">Tous les statuts</option>
<option value="en_attente">En attente</option>
<option value="valide">Validé</option>
<option value="echoue">Échoué</option>
<option value="rembourse">Remboursé</option>

// Après :
<option value="">{t("tabs.allStatuses")}</option>
<option value="en_attente">{t("status.pending")}</option>
<option value="valide">{t("status.paid")}</option>
<option value="echoue">{t("status.failed")}</option>
<option value="rembourse">{t("status.refunded")}</option>
```

---

#### I. Filtre Méthode (lignes ~184-191)
```typescript
// Avant :
<option value="">Toutes les méthodes</option>
<option value="stripe">Stripe</option>
<option value="especes">Espèces</option>
<option value="virement">Virement</option>
<option value="autre">Autre</option>

// Après :
<option value="">{t("tabs.allMethods")}</option>
<option value="stripe">{t("methods.stripe")}</option>
<option value="especes">{t("methods.cash")}</option>
<option value="virement">{t("methods.transfer")}</option>
<option value="autre">{t("methods.other")}</option>
```

---

#### J. Bouton "Réinitialiser" (ligne ~218)
```typescript
// Avant :
Réinitialiser

// Après :
{t("tabs.reset")}
```

---

#### K. EmptyState (lignes ~234-237)
```typescript
// Avant :
<EmptyState
  title="Aucun paiement trouvé"
  description="Il n'y a aucun paiement correspondant à vos critères de recherche."
/>

// Après :
<EmptyState
  title={t("messages.noPayments")}
  description={t("messages.errorLoadingPayments")}
/>
```

---

#### L. Message de table vide (ligne ~244)
```typescript
// Avant :
emptyMessage="Aucun paiement trouvé."

// Après :
emptyMessage={t("messages.noPayments")}
```

---

## ✅ Vérification Finale

### Checklist de validation

Après avoir appliqué toutes les modifications, vérifier :

- [ ] Aucune erreur TypeScript
- [ ] Aucun texte en dur en français
- [ ] Tous les composants ont le hook `useTranslation`
- [ ] L'application compile sans erreur
- [ ] Le changement de langue fonctionne (FR ↔ EN)

### Test manuel

```bash
# 1. Compiler le projet
npm run build

# 2. Lancer en dev
npm run dev

# 3. Dans la console du navigateur :
localStorage.setItem('i18n-language', 'en')
location.reload()

# 4. Vérifier que tous les textes sont en anglais

# 5. Repasser en français :
localStorage.setItem('i18n-language', 'fr')
location.reload()
```

---

## 📚 Clés de Traduction Disponibles

Toutes les clés suivantes sont déjà présentes dans `payments.json` (FR et EN) :

### Modal Stripe
```
modal.stripe.title
modal.stripe.subtitle
modal.stripe.securePayment
modal.stripe.amount
modal.stripe.loadingForm
modal.stripe.secureMessage
modal.stripe.payButton
modal.stripe.missingKeyTitle
modal.stripe.missingKeySubtitle
modal.stripe.missingKeyRequired
modal.stripe.missingKeyMessage
modal.stripe.missingKeyInstruction
modal.stripe.close
modal.stripe.errorProcessing
```

### Tabs
```
tabs.paymentsHistory
tabs.validatedThisMonth
tabs.paymentSingular
tabs.paymentPlural
tabs.payByCard
tabs.searchByMemberName
tabs.allStatuses
tabs.allMethods
tabs.reset
```

### Status
```
status.pending
status.paid
status.failed
status.refunded
```

### Methods
```
methods.stripe
methods.cash
methods.transfer
methods.other
```

### Actions
```
actions.recordPayment
```

### Messages
```
messages.noPayments
messages.errorLoadingPayments
```

---

## 🎯 Exemple Complet

### Avant (❌ Pas internationalisé)
```typescript
export function PaymentsTab({ ... }: PaymentsTabProps) {
  return (
    <div>
      <h2>Historique des paiements</h2>
      <button>Enregistrer un paiement</button>
    </div>
  );
}
```

### Après (✅ Internationalisé)
```typescript
import { useTranslation } from "react-i18next";

export function PaymentsTab({ ... }: PaymentsTabProps) {
  const { t } = useTranslation("payments");
  
  return (
    <div>
      <h2>{t("tabs.paymentsHistory")}</h2>
      <button>{t("actions.recordPayment")}</button>
    </div>
  );
}
```

---

## 🚀 Prochaines Étapes

1. ✅ Appliquer les modifications sur `StripePaymentModal.tsx`
2. ✅ Appliquer les modifications sur `PaymentsTab.tsx`
3. ✅ Compiler et tester
4. ✅ Vérifier le changement de langue
5. ✅ Marquer les fichiers comme complétés dans `INTERNATIONALIZATION_STATUS.md`

---

**Bon courage ! 🎉**