/**
 * GetAlertActionsUseCase
 * Cas d'utilisation : récupérer l'historique des actions d'une alerte
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertActionDto } from '../../domain/types.js';

export class GetAlertActionsUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(alerteUserId: number): Promise<AlertActionDto[]> {
    if (!alerteUserId || alerteUserId <= 0) {
      throw new Error("L'identifiant de l'alerte est invalide");
    }

    return this.repo.findAlertActions(alerteUserId);
  }
}
