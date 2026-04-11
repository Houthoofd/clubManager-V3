/**
 * GetUserPaymentsUseCase
 * Cas d'utilisation : récupérer l'historique des paiements d'un utilisateur spécifique
 * Retourne tous les paiements associés à l'utilisateur, triés par date décroissante
 */

import type {
  IPaymentRepository,
  PaymentRow,
} from "../../../domain/repositories/IPaymentRepository.js";

export class GetUserPaymentsUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(userId: number): Promise<PaymentRow[]> {
    return this.repo.findByUserId(userId);
  }
}
