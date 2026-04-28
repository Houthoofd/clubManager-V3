/**
 * CancelReservationUseCase
 * Annule une réservation existante avec vérification des droits d'accès
 */

import type { IReservationRepository } from "../../domain/repositories/IReservationRepository.js";

export class CancelReservationUseCase {
  constructor(private repo: IReservationRepository) {}

  /**
   * Exécute l'annulation d'une réservation
   * @param id - ID de la réservation à annuler
   * @param requesterId - ID de l'utilisateur qui effectue la demande
   * @param requesterRole - Rôle de l'utilisateur qui effectue la demande
   * @throws Error si la réservation est introuvable, si l'accès est refusé,
   *         ou si la réservation est déjà annulée
   */
  async execute(
    id: number,
    requesterId: number,
    requesterRole: string,
  ): Promise<void> {
    // 1. Récupérer la réservation
    const reservation = await this.repo.findById(id);
    if (!reservation) {
      throw new Error("Réservation introuvable");
    }

    // 2. Vérifier les droits d'accès (seul le propriétaire ou un admin peut annuler)
    if (requesterRole !== "admin" && reservation.user_id !== requesterId) {
      throw new Error("Accès refusé");
    }

    // 3. Vérifier que la réservation n'est pas déjà annulée
    if (reservation.statut === "annulee") {
      throw new Error("Cette réservation est déjà annulée");
    }

    // 4. Procéder à l'annulation
    await this.repo.updateStatus(id, "annulee");
  }
}
