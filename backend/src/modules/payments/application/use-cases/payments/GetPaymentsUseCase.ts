/**
 * GetPaymentsUseCase
 * Cas d'utilisation : récupérer la liste paginée des paiements
 * Supporte des filtres par user_id, statut, méthode de paiement et plage de dates
 */

import type {
  IPaymentRepository,
  PaymentQuery,
  PaginatedPayments,
} from "../../../domain/repositories/IPaymentRepository.js";

export class GetPaymentsUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(query: PaymentQuery): Promise<PaginatedPayments> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
