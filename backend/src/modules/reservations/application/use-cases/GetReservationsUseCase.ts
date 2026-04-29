/**
 * GetReservationsUseCase
 * Récupère les réservations avec filtres et pagination (Application Layer)
 */

import type { IReservationRepository } from "../../domain/repositories/IReservationRepository.js";
import type {
  GetReservationsQuery,
  PaginatedReservationsResponse,
} from "../../domain/types.js";

export class GetReservationsUseCase {
  constructor(private repo: IReservationRepository) {}

  async execute(
    query: GetReservationsQuery,
  ): Promise<PaginatedReservationsResponse> {
    return this.repo.findAll(query);
  }
}
