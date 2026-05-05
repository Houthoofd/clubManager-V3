/**
 * CreateScheduleUseCase
 * Crée une seule échéance de paiement manuellement (admin)
 */
import type { IPaymentScheduleRepository } from "../../domain/repositories/IPaymentScheduleRepository.js";

export interface CreateScheduleDto {
  user_id: number;
  plan_tarifaire_id?: number | null;
  montant: number;
  date_echeance: string;
}

export class CreateScheduleUseCase {
  constructor(private repo: IPaymentScheduleRepository) {}

  async execute(dto: CreateScheduleDto): Promise<number> {
    if (!dto.user_id) throw new Error("L'ID utilisateur est requis");
    if (!dto.montant || dto.montant <= 0) throw new Error("Le montant doit être supérieur à 0");
    if (!dto.date_echeance) throw new Error("La date d'échéance est requise");
    return this.repo.create({
      user_id: dto.user_id,
      plan_tarifaire_id: dto.plan_tarifaire_id ?? null,
      montant: dto.montant,
      date_echeance: dto.date_echeance,
      statut: "en_attente",
    });
  }
}
