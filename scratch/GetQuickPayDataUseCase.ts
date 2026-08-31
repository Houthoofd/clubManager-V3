import type { IPaymentScheduleRepository } from "../../domain/repositories/IPaymentScheduleRepository.js";
import type { IOrderRepository } from "../../../store/domain/repositories/IOrderRepository.js";
import jwt from "jsonwebtoken";

export interface QuickPayItem {
  id: number;
  type: "cotisation" | "boutique";
  montant: number;
  description: string;
}

export class GetQuickPayDataUseCase {
  constructor(
    private scheduleRepo: IPaymentScheduleRepository,
    private orderRepo: IOrderRepository,
  ) {}

  async execute(token: string, filterType?: string, filterId?: number): Promise<QuickPayItem[]> {
    const secret = process.env.JWT_SECRET || "fallback_secret";
    const accessSecret = process.env.JWT_ACCESS_SECRET || "your-super-secret-access-key-change-this-in-production";
    let decoded: any;
    
    try {
      // D'abord on essaie avec JWT_SECRET (liens d'emails)
      decoded = jwt.verify(token, secret);
    } catch (e1) {
      try {
        // Sinon on essaie avec JWT_ACCESS_SECRET (redirection depuis la boutique)
        decoded = jwt.verify(token, accessSecret, {
          issuer: "clubmanager",
          audience: "clubmanager-api"
        });
      } catch (e2) {
        throw new Error("Lien de paiement invalide ou expiré");
      }
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      throw new Error("Jeton invalide");
    }

    const schedules = await this.scheduleRepo.findByUserId(userId);
    const orders = await this.orderRepo.findByUserId(userId);

    const items: QuickPayItem[] = [];

    // Ajouter les cotisations en attente
    if (!filterType || filterType === "cotisation") {
    for (const s of schedules) {
      if (s.statut === "en_attente" || s.statut === "en attente") {
        if (filterId && s.id !== filterId) continue;
        items.push({
          id: s.id,
          type: "cotisation",
          montant: s.montant,
          description: s.description || "Cotisation",
        });
      }
    }

    }

    // Ajouter les commandes boutique en attente
    if (!filterType || filterType === "boutique") {
    for (const o of orders) {
      if (o.statut === "en_attente") {
        if (filterId && o.id !== filterId) continue;
        items.push({
          id: o.id,
          type: "boutique",
          montant: o.total,
          description: "Commande N°" + o.numero_commande,
        });
      }
    }

    }

    return items;
  }
}