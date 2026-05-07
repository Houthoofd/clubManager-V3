/**
 * DeleteScheduleUseCase
 * Supprime une échéance de paiement si elle n'est pas encore payée
 */

import type { IPaymentScheduleRepository } from '../../../domain/repositories/IPaymentScheduleRepository.js';

export class DeleteScheduleUseCase {
  constructor(private readonly repo: IPaymentScheduleRepository) {}

  async execute(id: number): Promise<void> {
    const schedule = await this.repo.findById(id);
    if (!schedule) throw new Error('Échéance introuvable');
    if (schedule.statut === 'paye') {
      throw new Error('Impossible de supprimer une échéance déjà payée');
    }
    await this.repo.delete(id);
  }
}
