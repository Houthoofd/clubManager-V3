/**
 * StripeService
 * Service d'infrastructure encapsulant le SDK Stripe (Infrastructure Layer)
 * Gère la création de PaymentIntents, la récupération et la vérification des webhooks
 * Implémente également IStripeServicePort pour être utilisé par les use cases
 */

import Stripe from "stripe";
import type { IStripeServicePort } from "../../application/use-cases/payments/CreateStripePaymentIntentUseCase.js";

export class StripeService implements IStripeServicePort {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
      apiVersion: "2025-02-24.acacia",
    });
  }

  /**
   * Crée un PaymentIntent Stripe
   * @param amount   - Montant en centimes (ex: 1999 pour 19.99 €)
   * @param currency - Devise ISO 4217 (défaut : 'eur')
   * @param metadata - Métadonnées optionnelles associées au paiement
   * @returns Le PaymentIntent créé, contenant notamment le client_secret
   */
  async createPaymentIntent(
    amount: number,
    currency: string = "eur",
    metadata?: object,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: (metadata ?? {}) as Stripe.MetadataParam,
      automatic_payment_methods: { enabled: true },
    });
  }

  /**
   * Récupère un PaymentIntent existant depuis l'API Stripe
   * @param id - Identifiant Stripe du PaymentIntent (ex: "pi_xxx")
   * @returns Le PaymentIntent complet
   */
  async retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(id);
  }

  /**
   * Construit et vérifie un événement webhook Stripe à partir de la signature
   * Doit être appelé avec le corps brut de la requête (Buffer) avant tout parsing JSON
   * @param payload   - Corps brut de la requête HTTP (Buffer)
   * @param signature - Valeur du header 'stripe-signature'
   * @returns L'événement Stripe vérifié et typé
   * @throws Error si la signature est invalide ou si le secret webhook est absent
   */
  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
