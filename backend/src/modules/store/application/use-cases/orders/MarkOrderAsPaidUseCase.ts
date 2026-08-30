import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import type { OrderStatus } from "@clubmanager/types";

export class MarkOrderAsPaidUseCase {
  constructor(
    private orderRepo: IOrderRepository
  ) {}

  async execute(orderId: number): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error("Commande introuvable");

    if (order.statut === "payee") {
      throw new Error("Cette commande est dÃ©jÃ  payÃ©e");
    }
    if (order.statut === "annulee") {
      throw new Error("Impossible de payer une commande annulÃ©e");
    }

    await this.orderRepo.updateStatus(orderId, "payee" as OrderStatus);
  }
}