# 📚 Payment Reference Data - Guide d'utilisation

**Date:** 2026-06-13  
**Version:** v5.1  
**Module:** Payments

---

## 📋 Vue d'ensemble

Suite à la normalisation v5.1, les paiements utilisent désormais des **Foreign Keys** vers les tables de référence au lieu d'ENUM.

---

## 🗂️ Tables de correspondance

### Méthodes de paiement

| ID | Code | Nom (FR) | Nom (EN) | Usage |
|----|------|----------|----------|-------|
| **1** | `stripe` | Carte bancaire | Credit Card | Paiements en ligne via Stripe |
| **2** | `especes` | Espèces | Cash | Paiements en espèces au club |
| **3** | `virement` | Virement bancaire | Bank Transfer | Virements manuels |
| **4** | `autre` | Autre | Other | Autres méthodes |

### Statuts de paiement

| ID | Code | Nom (FR) | Nom (EN) | Couleur | Compte dans revenus | Est final | Description |
|----|------|----------|----------|---------|---------------------|-----------|-------------|
| **1** | `en_attente` | En attente | Pending | neutral | ❌ | ❌ | Paiement créé mais pas encore validé |
| **2** | `valide` | Validé | Validated | success | ✅ | ✅ | Paiement confirmé et encaissé |
| **3** | `echoue` | Échoué | Failed | destructive | ❌ | ✅ | Paiement refusé ou échoué |
| **4** | `rembourse` | Remboursé | Refunded | warning | ❌ | ✅ | Paiement remboursé au client |

### Statuts d'échéance

| ID | Code | Nom (FR) | Nom (EN) | Couleur | Est final | Description |
|----|------|----------|----------|---------|-----------|-------------|
| **1** | `en_attente` | En attente | Pending | neutral | ❌ | Échéance à venir |
| **2** | `paye` | Payé | Paid | success | ✅ | Échéance réglée |
| **3** | `en_retard` | En retard | Overdue | destructive | ❌ | Échéance dépassée non payée |
| **4** | `annule` | Annulé | Cancelled | secondary | ✅ | Échéance annulée |

---

## 💻 Usage dans le code

### 1️⃣ **Domain Layer** - Interfaces

```typescript
// IPaymentRepository.ts
export interface Payment {
  id: number;
  user_id: number;
  plan_tarifaire_id: number | null;
  montant: number;
  
  // ✨ Nouveaux champs FK
  methode_paiement_id: number;
  statut_id: number;
  
  // ✨ Champs JOINés (optionnels)
  methode_paiement_code?: string;
  methode_paiement_nom?: string;
  statut_code?: string;
  statut_nom?: string;
  
  // ...autres champs
}

export interface CreatePaymentInput {
  user_id: number;
  plan_tarifaire_id?: number | null;
  montant: number;
  methode_paiement_id: number;  // ✨ ID numérique
  statut_id?: number;            // ✨ ID numérique (défaut: 1)
  description?: string | null;
  // ...
}
```

### 2️⃣ **Application Layer** - Use Cases

#### Créer un paiement en espèces validé

```typescript
// CreatePaymentUseCase.ts
const paymentId = await this.repo.create({
  user_id: userId,
  plan_tarifaire_id: planId,
  montant: 50.00,
  methode_paiement_id: 2,  // 2 = espèces
  statut_id: 2,            // 2 = validé
  description: "Paiement mensuel"
});
```

#### Créer un paiement Stripe en attente

```typescript
// CreateStripePaymentIntentUseCase.ts
const paymentId = await this.repo.create({
  user_id: userId,
  plan_tarifaire_id: planId,
  montant: amount,
  methode_paiement_id: 1,  // 1 = stripe
  statut_id: 1,            // 1 = en_attente
  stripe_payment_intent_id: intent.id
});
```

#### Vérifier le statut avant remboursement

```typescript
// RefundPaymentUseCase.ts
const payment = await this.repo.findById(id);
if (!payment) throw new Error("Paiement introuvable");

if (payment.statut_id === 4) {  // 4 = remboursé
  throw new Error("Ce paiement est déjà remboursé");
}
if (payment.statut_id === 3) {  // 3 = échoué
  throw new Error("Impossible de rembourser un paiement échoué");
}

await this.repo.refund(id);
```

#### Marquer une échéance comme payée

```typescript
// MarkScheduleAsPaidUseCase.ts
const paymentId = await this.paymentRepo.create({
  user_id: schedule.user_id,
  plan_tarifaire_id: schedule.plan_tarifaire_id,
  montant: schedule.montant,
  methode_paiement_id: 2,  // 2 = espèces
  statut_id: 2,            // 2 = validé
  description: `Règlement échéance #${scheduleId}`
});

await this.scheduleRepo.markAsPaid(scheduleId, paymentId);
```

### 3️⃣ **Infrastructure Layer** - Repository

#### Requête avec JOINs

```typescript
// MySQLPaymentRepository.ts
const BASE_SELECT = `
  SELECT 
    p.*,
    mp.code as methode_paiement_code,
    mp.nom as methode_paiement_nom,
    sp.code as statut_code,
    sp.nom as statut_nom
  FROM paiements p
  INNER JOIN methodes_paiement mp ON mp.id = p.methode_paiement_id
  INNER JOIN statuts_paiement sp ON sp.id = p.statut_id
`;
```

#### Filtrer par code (backward compatible)

```typescript
// Les filtres API acceptent toujours les codes string
const filters: PaymentFilters = {
  statut: 'valide',       // Filtrera sur sp.code = 'valide'
  methode: 'stripe'       // Filtrera sur mp.code = 'stripe'
};

const payments = await repo.findAll(filters, { page: 1, limit: 20 });
```

#### Mettre à jour le statut

```typescript
// Après confirmation Stripe
await repo.updateStatus(
  paymentId, 
  2,  // 2 = valide
  chargeId
);

// Après échec Stripe
await repo.updateStatus(
  paymentId, 
  3,  // 3 = échoué
);
```

### 4️⃣ **Presentation Layer** - Controller

#### Créer un paiement (requête API)

```typescript
// POST /api/payments
{
  "user_id": 42,
  "plan_tarifaire_id": 3,
  "montant": 50.00,
  "methode_paiement_id": 2,  // 2 = espèces
  "description": "Paiement mensuel"
}
```

#### Webhook Stripe

```typescript
// PaymentController.ts - handleStripeWebhook()
switch (event.type) {
  case "payment_intent.succeeded":
    await repo.updateStatus(paymentId, 2);  // 2 = valide
    break;
    
  case "payment_intent.payment_failed":
    await repo.updateStatus(paymentId, 3);  // 3 = échoué
    break;
}
```

---

## 🔄 Service de référence (ReferenceDataService)

Pour récupérer dynamiquement les IDs à partir des codes :

```typescript
import { referenceDataService } from "../infrastructure/services/MySQLReferenceDataService";

// Récupérer un ID par code
const methode = await referenceDataService.getMethodePaiementByCode("stripe");
console.log(methode?.id);  // 1

const statut = await referenceDataService.getStatutPaiementByCode("valide");
console.log(statut?.id);  // 2

// Récupérer toutes les méthodes (avec cache)
const methodes = await referenceDataService.getAllMethodesPaiement();

// Récupérer un objet complet par ID
const methodById = await referenceDataService.getMethodePaiementById(1);
console.log(methodById?.nom);  // "Carte bancaire"

// Vider le cache (utile pour les tests)
referenceDataService.clearCache();
```

---

## ⚠️ Points d'attention

### 1. **IDs hardcodés**

Les IDs 1-4 sont stables et documentés. Ils peuvent être hardcodés dans le code pour performance.

❌ **À éviter** (requête DB inutile) :
```typescript
const stripe = await referenceDataService.getMethodePaiementByCode("stripe");
const paiement = { methode_paiement_id: stripe?.id };
```

✅ **Recommandé** (documentation claire) :
```typescript
const paiement = { 
  methode_paiement_id: 1  // 1 = stripe
};
```

### 2. **Backward compatibility API**

Les filtres dans l'API REST acceptent toujours les **codes string** :

```
GET /api/payments?statut=valide&methode=stripe
```

Le repository traduit automatiquement en comparant avec `sp.code` et `mp.code` dans les JOINs.

### 3. **Réponses API enrichies**

Les réponses incluent maintenant les labels traduits :

```json
{
  "id": 123,
  "montant": 50.00,
  "methode_paiement_id": 1,
  "methode_paiement_code": "stripe",
  "methode_paiement_nom": "Carte bancaire",
  "statut_id": 2,
  "statut_code": "valide",
  "statut_nom": "Validé"
}
```

Le frontend peut utiliser directement `methode_paiement_nom` et `statut_nom` sans table de mapping côté client.

---

## 🧪 Tests

### Mise à jour des mocks

```typescript
// __tests__/CreatePaymentUseCase.test.ts
const mockPayment: Payment = {
  id: 1,
  user_id: 42,
  plan_tarifaire_id: 3,
  montant: 50.00,
  methode_paiement_id: 2,         // ✨ Nouveau
  statut_id: 2,                   // ✨ Nouveau
  methode_paiement_code: "especes",  // ✨ Optionnel
  methode_paiement_nom: "Espèces",   // ✨ Optionnel
  statut_code: "valide",             // ✨ Optionnel
  statut_nom: "Validé",              // ✨ Optionnel
  // ...
};
```

---

## 📞 Support

Pour toute question :
- 📧 Contact : houthoofd.benoit48@gmail.com
- 📖 Doc DB : `db/consolidated/MIGRATION_V5.1.md`

---

**Document créé le :** 2026-06-13  
**Version du schéma :** v5.1
