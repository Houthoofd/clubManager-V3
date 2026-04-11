/**
 * GetOverdueSchedulesUseCase
 * Cas d'utilisation : récupérer toutes les échéances en retard
 * Retourne les échéances dont la date est dépassée et le statut est 'en_attente'
 */

import type {
  IPaymentScheduleRepository,
  ScheduleRow,
} from "../../../domain/repositories/IPaymentScheduleRepository.js";

export class GetOverdueSchedulesUseCase {
  constructor(private repo: IPaymentScheduleRepository) {}

  async execute(): Promise<ScheduleRow[]> {
    return this.repo.findOverdue();
  }
}
