/**
 * GetAlertTypesUseCase
 * Cas d'utilisation : récupérer la liste des types d'alertes
 * Supporte un filtre optionnel pour les actifs uniquement
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertTypeDto } from '../../domain/types.js';

export class GetAlertTypesUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(onlyActive?: boolean): Promise<AlertTypeDto[]> {
    return this.repo.findAllAlertTypes(onlyActive);
  }
}
