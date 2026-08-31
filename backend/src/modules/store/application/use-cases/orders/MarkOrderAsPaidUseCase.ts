import type { IOrderRepository } from "../../../domain/repositories/IOrderRepository.js";
import type { IStockRepository } from "../../../infrastructure/repositories/MySQLStockRepository.js";
import type { OrderStatus } from "@clubmanager/types";

export class MarkOrderAsPaidUseCase {
  constructor(
    private orderRepo: IOrderRepository,
    private stockRepo: IStockRepository
  ) {}

  async execute(orderId: number): Promise<void> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error("Commande introuvable");

    if (order.statut === "payee") {
      throw new Error("Cette commande est déjà payée");
    }
    if (order.statut === "annulee") {
      throw new Error("Impossible de payer une commande annulée");
    }

    await this.orderRepo.updateStatus(orderId, "payee" as OrderStatus);

    // Diminuer les stocks uniquement lors du paiement
    if (order.items && order.items.length > 0) {
      await this.stockRepo.decreaseForOrder(
        order.items.map((item) => ({
          article_id: Number(item.article_id),
          taille_id: Number(item.taille_id),
          quantite: Number(item.quantite),
        })),
        orderId,
        order.user_id // use the order's user_id
      );
    }
  }
}

