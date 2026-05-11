/**
 * AddAlertActionUseCase
 * Cas d'utilisation : ajouter une action à une alerte utilisateur
 * Valide le type d'action et l'identifiant de l'alerte
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertActionDto, CreateAlertActionDto, AlertActionType } from '../../domain/types.js';

const VALID_ACTION_TYPES: AlertActionType[] = [
  'message_envoye',
  'information_mise_a_jour',
  'paiement_recu',
  'statut_change',
  'autre',
];

export class AddAlertActionUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(data: CreateAlertActionDto): Promise<AlertActionDto> {
    if (!data.alerte_user_id || data.alerte_user_id <= 0) {
      throw new Error("L'identifiant de l'alerte est requis");
    }

    if (!data.action_type || !VALID_ACTION_TYPES.includes(data.action_type)) {
      throw new Error(
        `Type d'action invalide. Valeurs acceptées : ${VALID_ACTION_TYPES.join(', ')}`,
      );
    }

    return this.repo.addAlertAction(data);
  }
}
