/**
 * UpdateAlertTypeUseCase
 * Cas d'utilisation : modifier un type d'alerte existant
 * Valide l'identifiant et les champs fournis avant mise à jour
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertTypeDto, UpdateAlertTypeDto, AlertPriorite } from '../../domain/types.js';

const VALID_PRIORITES: AlertPriorite[] = ['basse', 'normale', 'haute', 'critique'];

export class UpdateAlertTypeUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(id: number, data: UpdateAlertTypeDto): Promise<AlertTypeDto> {
    if (!id || id <= 0) {
      throw new Error("L'identifiant du type d'alerte est invalide");
    }

    if (data.priorite !== undefined && !VALID_PRIORITES.includes(data.priorite)) {
      throw new Error(`Priorité invalide. Valeurs acceptées : ${VALID_PRIORITES.join(', ')}`);
    }

    if (data.nom !== undefined && data.nom.trim().length === 0) {
      throw new Error("Le nom du type d'alerte ne peut pas être vide");
    }

    const existing = await this.repo.findAlertTypeById(id);
    if (!existing) {
      throw new Error(`Type d'alerte introuvable (id: ${id})`);
    }

    return this.repo.updateAlertType(id, data);
  }
}
