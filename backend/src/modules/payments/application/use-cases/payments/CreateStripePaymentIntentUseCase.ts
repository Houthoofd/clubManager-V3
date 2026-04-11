/**
 * CreateStripePaymentIntentUseCase
 * Cas d'utilisation : créer un PaymentIntent Stripe et l'enregistrer en DB
 * Retourne le client_secret pour la confirmation côté client (front-end)
 * Le paiement est créé avec le statut 'en_attente' jusqu'à confirmation Stripe
 */

import type {
  IPaymentRepository,
} from "../../../domain/repositories/IPaymentRepository.js";

// ==================== PORT (dépendance abstraite vers Stripe) ====================

/**
 * Interface minimale requise par ce cas d'utilisation
 * Permet de découpler l'application de l'implémentation Stripe concrète
 */
export interface IStripeServicePort {
  createPaymentIntent(
    amount: number,
    currency?: string,
    metadata?: object,
  ): Promise<{ id: string; client_secret: string | null }>;
}

// ==================== INPUT / OUTPUT TYPES ====================

export interface StripeIntentInput {
  user_id: number;
  montant: number;
  plan_tarifaire_id?: number | null;
  description?: string | null;
}

export interface StripeIntentResult {
  paymentId: number;
  clientSecret: string;
  paymentIntentId: string;
}

// ==================== USE CASE ====================

export class CreateStripePaymentIntentUseCase {
  constructor(
    private repo: IPaymentRepository,
    private stripeService: IStripeServicePort,
  ) {}

  async execute(data: StripeIntentInput): Promise<StripeIntentResult> {
    if (!data.user_id) {
      throw new Error("L'identifiant de l'utilisateur est requis");
    }
    if (!data.montant || data.montant <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }

    // Stripe attend le montant en centimes (ex: 19.99€ → 1999)
    const amountInCents = Math.round(data.montant * 100);

    const paymentIntent = await this.stripeService.createPaymentIntent(
      amountInCents,
      "eur",
      {
        user_id: String(data.user_id),
        plan_tarifaire_id: data.plan_tarifaire_id
          ? String(data.plan_tarifaire_id)
          : "",
      },
    );

    if (!paymentIntent.client_secret) {
      throw new Error(
        "Stripe n'a pas retourné de client_secret pour ce paiement",
      );
    }

    // Sauvegarde en DB avec statut 'en_attente'
    const paymentId = await this.repo.create({
      user_id: data.user_id,
      plan_tarifaire_id: data.plan_tarifaire_id ?? null,
      montant: data.montant,
      methode_paiement: "stripe",
      statut: "en_attente",
      description: data.description ?? null,
      stripe_payment_intent_id: paymentIntent.id,
    });

    return {
      paymentId,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }
}
