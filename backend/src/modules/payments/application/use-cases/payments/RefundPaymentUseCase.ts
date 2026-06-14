import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository.js";

export class RefundPaymentUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(id: number): Promise<void> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new Error("Paiement introuvable");
    if (payment.statut_id === 4) throw new Error("Ce paiement est déjà remboursé"); // 4 = rembourse
    if (payment.statut_id === 3) throw new Error("Impossible de rembourser un paiement échoué"); // 3 = echoue
    await this.repo.refund(id);
  }
}
