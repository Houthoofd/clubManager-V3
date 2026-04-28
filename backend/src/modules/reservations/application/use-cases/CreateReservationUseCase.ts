/**
 * CreateReservationUseCase
 * Crée une réservation pour un utilisateur sur un cours donné.
 *
 * Règles métier :
 *  - Si l'utilisateur a déjà une réservation NON annulée → erreur
 *  - Si l'utilisateur a une réservation annulée         → réactivation (statut 'confirmee')
 *  - Sinon                                              → création d'une nouvelle ligne
 */

import type { IReservationRepository } from "../../domain/repositories/IReservationRepository.js";
import type { ReservationDto } from "../../domain/types.js";

export class CreateReservationUseCase {
  constructor(private repo: IReservationRepository) {}

  async execute(data: { user_id: number; cours_id: number }): Promise<ReservationDto> {
    const { user_id, cours_id } = data;

    // Check for an existing reservation for this user / course pair
    const existing = await this.repo.findByUserAndCours(user_id, cours_id);

    if (existing) {
      if (existing.statut !== "annulee") {
        // Active reservation already exists — refuse the creation
        throw new Error("Vous avez déjà une réservation pour ce cours");
      }

      // Cancelled reservation found → reactivate it
      await this.repo.updateStatus(existing.id, "confirmee");

      const reactivated = await this.repo.findById(existing.id);
      if (!reactivated) {
        throw new Error("Erreur lors de la réactivation de la réservation");
      }
      return reactivated;
    }

    // No prior reservation → create a new one
    return this.repo.create({ user_id, cours_id, statut: "confirmee" });
  }
}
