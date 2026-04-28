/**
 * GetRecoveryRequestsUseCase
 * Cas d'utilisation : récupérer la liste paginée des demandes de récupération manuelle
 * Supporte un filtre optionnel sur le statut et la pagination
 */

import type { IRecoveryRepository } from "../../domain/repositories/IRecoveryRepository.js";
import type {
  GetRecoveryRequestsQuery,
  PaginatedRecoveryResponse,
} from "../../domain/types.js";

export class GetRecoveryRequestsUseCase {
  constructor(private repo: IRecoveryRepository) {}

  async execute(query: GetRecoveryRequestsQuery): Promise<PaginatedRecoveryResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
