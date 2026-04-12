/**
 * GetPaymentByIdUseCase
 * Cas d'utilisation : récupérer un paiement par son ID
 * Lance une erreur explicite si le paiement est introuvable
 */

import type {
  IPaymentRepository,
  PaymentRow,
} from "../../../domain/repositories/IPaymentRepository.js";

export class GetPaymentByIdUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(id: number): Promise<PaymentRow> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new Error("Paiement introuvable");
    return payment;
  }
}
