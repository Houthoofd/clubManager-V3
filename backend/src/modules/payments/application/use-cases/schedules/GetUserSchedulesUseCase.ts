/**
 * GetUserSchedulesUseCase
 * Cas d'utilisation : récupérer les échéances de paiement d'un utilisateur spécifique
 * Retourne toutes les échéances associées à l'utilisateur, triées par date d'échéance croissante
 */

import type {
  IPaymentScheduleRepository,
  ScheduleRow,
} from "../../../domain/repositories/IPaymentScheduleRepository.js";

export class GetUserSchedulesUseCase {
  constructor(private repo: IPaymentScheduleRepository) {}

  async execute(userId: number): Promise<ScheduleRow[]> {
    return this.repo.findByUserId(userId);
  }
}
