/**
 * GetSchedulesUseCase
 * Cas d'utilisation : récupérer la liste paginée des échéances de paiement
 * Supporte des filtres par user_id, statut, et détection des échéances en retard
 */

import type {
  IPaymentScheduleRepository,
  ScheduleQuery,
  PaginatedSchedules,
} from "../../../domain/repositories/IPaymentScheduleRepository.js";

export class GetSchedulesUseCase {
  constructor(private repo: IPaymentScheduleRepository) {}

  async execute(query: ScheduleQuery): Promise<PaginatedSchedules> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
