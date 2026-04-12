/**
 * CreatePaymentUseCase
 * Cas d'utilisation : créer un paiement manuel (espèces, virement, autre)
 * Valide le montant et la méthode, puis crée le paiement avec statut 'valide'
 * Pour les paiements Stripe, utiliser CreateStripePaymentIntentUseCase
 */

import type {
  IPaymentRepository,
  CreatePaymentInput,
} from "../../../domain/repositories/IPaymentRepository.js";

export class CreatePaymentUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(data: CreatePaymentInput): Promise<number> {
    if (!data.user_id) {
      throw new Error("L'identifiant de l'utilisateur est requis");
    }
    if (!data.montant || data.montant <= 0) {
      throw new Error("Le montant doit être supérieur à 0");
    }
    if (!data.methode_paiement) {
      throw new Error("La méthode de paiement est requise");
    }
    if (data.methode_paiement === "stripe") {
      throw new Error(
        "Utilisez l'endpoint Stripe pour les paiements par carte bancaire",
      );
    }

    return this.repo.create({
      ...data,
      statut: "valide",
      date_paiement: data.date_paiement ?? new Date().toISOString(),
    });
  }
}
