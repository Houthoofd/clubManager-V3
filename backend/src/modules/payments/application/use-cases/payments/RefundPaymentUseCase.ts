import type { IPaymentRepository } from "../../domain/repositories/IPaymentRepository.js";

export class RefundPaymentUseCase {
  constructor(private repo: IPaymentRepository) {}

  async execute(id: number): Promise<void> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new Error("Paiement introuvable");
    if (payment.statut === "rembourse") throw new Error("Ce paiement est déjà remboursé");
    if (payment.statut === "echoue") throw new Error("Impossible de rembourser un paiement échoué");
    await this.repo.refund(id);
  }
}
