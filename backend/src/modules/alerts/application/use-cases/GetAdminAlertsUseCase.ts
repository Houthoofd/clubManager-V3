/**
 * GetAdminAlertsUseCase
 * Cas d'utilisation : récupérer toutes les alertes (vue admin)
 * Supporte des filtres optionnels sur priorité, statut et userId
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertUserDto, AlertStatut, AlertPriorite } from '../../domain/types.js';

export class GetAdminAlertsUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(filters?: {
    priorite?: AlertPriorite;
    statut?: AlertStatut;
    userId?: number;
  }): Promise<AlertUserDto[]> {
    return this.repo.findAllActiveAlerts(filters);
  }
}
