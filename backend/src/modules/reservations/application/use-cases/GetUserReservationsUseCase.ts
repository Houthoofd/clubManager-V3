/**
 * GetUserReservationsUseCase
 * Récupère toutes les réservations d'un utilisateur donné (Application Layer)
 */

import type { IReservationRepository } from "../../domain/repositories/IReservationRepository.js";
import type { ReservationDto, ReservationStatut } from "../../domain/types.js";

export class GetUserReservationsUseCase {
  constructor(private repo: IReservationRepository) {}

  /**
   * Exécute le cas d'usage
   * @param userId  - ID de l'utilisateur dont on veut les réservations
   * @param statut  - Filtre optionnel sur le statut
   * @returns Tableau de réservations (sans enveloppe de pagination)
   */
  async execute(
    userId: number,
    statut?: ReservationStatut,
  ): Promise<ReservationDto[]> {
    const result = await this.repo.findAll({
      user_id: userId,
      statut,
      limit: 100,
    });
    return result.reservations;
  }
}
