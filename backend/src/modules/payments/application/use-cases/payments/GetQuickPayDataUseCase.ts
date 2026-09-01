import type { IPaymentScheduleRepository } from "../../../domain/repositories/IPaymentScheduleRepository.js";
import type { IOrderRepository } from "../../../../store/domain/repositories/IOrderRepository.js";
import jwt from "jsonwebtoken";

import { IEventRepository } from "../../../../events/domain/repositories/IEventRepository.js";
import { MySQLEventRepository } from "../../../../events/infrastructure/repositories/MySQLEventRepository.js";

export interface QuickPayItem {
  id: number;
  type: "cotisation" | "boutique" | "evenement";
  montant: number;
  description: string;
}

export class GetQuickPayDataUseCase {
  constructor(
    private scheduleRepo: IPaymentScheduleRepository,
    private orderRepo: IOrderRepository,
  ) {}

  async execute(token: string, itemType?: string, itemId?: number): Promise<QuickPayItem[]> {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      throw new Error("Lien de paiement invalide ou expiré");
    }

    const userId = decoded.id;
    if (!userId) {
      throw new Error("Jeton invalide");
    }

    const schedules = await this.scheduleRepo.findByUserId(userId);
    const orders = await this.orderRepo.findByUserId(userId);

    
    const items: QuickPayItem[] = [];

    if (itemType === "evenement" && itemId) {
      const eventRepo = new MySQLEventRepository();
      const event = await eventRepo.getEventById(itemId);
      if (event && event.price && Number(event.price) > 0) {
        // Optionnel : vérifier si l'utilisateur est déjà inscrit et payé
        const existing = await eventRepo.getRegistration(itemId, userId);
        if (!existing || existing.payment_status !== 'PAID') {
          items.push({
            id: event.id,
            type: "evenement",
            montant: Number(event.price),
            description: "Inscription : " + event.title,
          });
        }
      }
      return items;
    }


    // Ajouter les cotisations en attente
    for (const s of schedules) {
      if (s.statut === "en_attente" || s.statut === "en attente") {
        items.push({
          id: s.id,
          type: "cotisation",
          montant: s.montant,
          description: s.description || "Cotisation",
        });
      }
    }

    // Ajouter les commandes boutique en attente
    for (const o of orders) {
      if (o.statut === "en_attente") {
        items.push({
          id: o.id,
          type: "boutique",
          montant: o.total,
          description: "Commande N°" + o.numero_commande,
        });
      }
    }

    return items;
  }
}
