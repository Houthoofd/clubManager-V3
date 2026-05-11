/**
 * DeleteAlertTypeUseCase
 * Cas d'utilisation : supprimer un type d'alerte
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';

export class DeleteAlertTypeUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error("L'identifiant du type d'alerte est invalide");
    }

    return this.repo.deleteAlertType(id);
  }
}
