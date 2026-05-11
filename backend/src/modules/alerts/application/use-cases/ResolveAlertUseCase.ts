/**
 * ResolveAlertUseCase
 * Cas d'utilisation : résoudre une alerte utilisateur
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertUserDto } from '../../domain/types.js';

export class ResolveAlertUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(alertId: number, resolvedBy: number, notes?: string): Promise<AlertUserDto> {
    if (!alertId || alertId <= 0) {
      throw new Error("L'identifiant de l'alerte est invalide");
    }

    if (!resolvedBy || resolvedBy <= 0) {
      throw new Error("L'identifiant du résolveur est requis");
    }

    return this.repo.resolveAlert(alertId, resolvedBy, notes);
  }
}
