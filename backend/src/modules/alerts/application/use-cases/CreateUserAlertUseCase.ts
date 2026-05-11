/**
 * CreateUserAlertUseCase
 * Cas d'utilisation : créer une alerte pour un utilisateur
 * Valide les champs requis et l'existence du type d'alerte avant insertion
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertUserDto, CreateUserAlertDto } from '../../domain/types.js';

export class CreateUserAlertUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(data: CreateUserAlertDto): Promise<AlertUserDto> {
    if (!data.user_id || data.user_id <= 0) {
      throw new Error("L'identifiant de l'utilisateur est requis");
    }

    if (!data.alerte_type_id || data.alerte_type_id <= 0) {
      throw new Error("L'identifiant du type d'alerte est requis");
    }

    const alertType = await this.repo.findAlertTypeById(data.alerte_type_id);
    if (!alertType) {
      throw new Error(`Type d'alerte introuvable (id: ${data.alerte_type_id})`);
    }

    if (!alertType.actif) {
      throw new Error("Ce type d'alerte est désactivé");
    }

    return this.repo.createUserAlert(data);
  }
}
