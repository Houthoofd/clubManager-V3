/**
 * GetUserAlertsUseCase
 * Cas d'utilisation : récupérer les alertes d'un utilisateur
 * Supporte un filtre optionnel sur le statut
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertUserDto, AlertStatut } from '../../domain/types.js';

const VALID_STATUTS: AlertStatut[] = ['active', 'resolue', 'ignoree'];

export class GetUserAlertsUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(userId: number, statut?: AlertStatut): Promise<AlertUserDto[]> {
    if (!userId || userId <= 0) {
      throw new Error("L'identifiant de l'utilisateur est invalide");
    }

    if (statut !== undefined && !VALID_STATUTS.includes(statut)) {
      throw new Error(`Statut invalide. Valeurs acceptées : ${VALID_STATUTS.join(', ')}`);
    }

    return this.repo.findUserAlerts(userId, statut);
  }
}
