/**
 * MarkScheduleAsPaidUseCase
 * Cas d'utilisation : marquer une échéance de paiement comme payée
 * Si aucun paiement_id n'est fourni, crée automatiquement un paiement associé (espèces par défaut)
 * Met ensuite à jour le statut de l'échéance à 'paye'
 */

import type {
  IPaymentScheduleRepository,
} from "../../../domain/repositories/IPaymentScheduleRepository.js";
import type {
  IPaymentRepository,
} from "../../../domain/repositories/IPaymentRepository.js";

export class MarkScheduleAsPaidUseCase {
  constructor(
    private scheduleRepo: IPaymentScheduleRepository,
    private paymentRepo: IPaymentRepository,
  ) {}

  async execute(scheduleId: number, paiementId?: number): Promise<void> {
    // Vérification de l'existence de l'échéance
    const schedule = await this.scheduleRepo.findById(scheduleId);
    if (!schedule) throw new Error("Échéance introuvable");

    // Vérification du statut courant
    if (schedule.statut === "paye") {
      throw new Error("Cette échéance est déjà marquée comme payée");
    }
    if (schedule.statut === "annule") {
      throw new Error(
        "Impossible de marquer une échéance annulée comme payée",
      );
    }

    let resolvedPaiementId = paiementId;

    // Si aucun paiement n'est fourni, on en crée un automatiquement
    if (!resolvedPaiementId) {
      resolvedPaiementId = await this.paymentRepo.create({
        user_id: schedule.user_id,
        plan_tarifaire_id: schedule.plan_tarifaire_id ?? null,
        montant: schedule.montant,
        methode_paiement: "especes",
        statut: "valide",
        description: `Règlement automatique de l'échéance #${scheduleId}`,
        date_paiement: new Date().toISOString(),
      });
    }

    // Marquer l'échéance comme payée et lier le paiement
    await this.scheduleRepo.markAsPaid(scheduleId, resolvedPaiementId);
  }
}
