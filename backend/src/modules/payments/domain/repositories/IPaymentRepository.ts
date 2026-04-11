/**
 * IPaymentRepository
 * Interface du repository paiements (Domain Layer)
 * Contrat pour les opérations sur les paiements en base de données
 */

// ==================== ROW / INPUT TYPES ====================

export interface PaymentRow {
  id: number;
  user_id: number;
  plan_tarifaire_id: number | null;
  montant: number;
  methode_paiement: "stripe" | "especes" | "virement" | "autre";
  statut: "en_attente" | "valide" | "echoue" | "rembourse";
  description: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  date_paiement: Date | null;
  created_at: Date;
  updated_at: Date;
  // Champs issus des JOINs avec utilisateurs et plans_tarifaires
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  plan_nom?: string;
}

export interface CreatePaymentInput {
  user_id: number;
  plan_tarifaire_id?: number | null;
  montant: number;
  methode_paiement: "stripe" | "especes" | "virement" | "autre";
  statut?: "en_attente" | "valide" | "echoue" | "rembourse";
  description?: string | null;
  stripe_payment_intent_id?: string | null;
  date_paiement?: string | null;
}

export interface PaymentQuery {
  user_id?: number;
  statut?: string;
  methode?: string;
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedPayments {
  payments: PaymentRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==================== REPOSITORY INTERFACE ====================

export interface IPaymentRepository {
  /** Retourne la liste paginée des paiements avec filtres dynamiques */
  findAll(query: PaymentQuery): Promise<PaginatedPayments>;

  /** Retourne un paiement par son ID (avec infos user et plan), ou null */
  findById(id: number): Promise<PaymentRow | null>;

  /** Retourne tous les paiements d'un utilisateur donné */
  findByUserId(userId: number): Promise<PaymentRow[]>;

  /** Trouve un paiement via l'identifiant PaymentIntent Stripe */
  findByStripeIntentId(intentId: string): Promise<PaymentRow | null>;

  /** Crée un nouveau paiement et retourne son ID généré */
  create(data: CreatePaymentInput): Promise<number>;

  /** Met à jour le statut d'un paiement, et optionnellement le stripe_charge_id */
  updateStatus(id: number, statut: string, stripeChargeId?: string): Promise<void>;

  /** Enregistre le PaymentIntent Stripe associé à un paiement */
  updateStripeIntent(id: number, paymentIntentId: string): Promise<void>;
}
