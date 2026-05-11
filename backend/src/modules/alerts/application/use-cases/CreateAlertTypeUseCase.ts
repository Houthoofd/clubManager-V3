/**
 * CreateAlertTypeUseCase
 * Cas d'utilisation : créer un nouveau type d'alerte
 * Valide le code, le nom et la priorité avant insertion
 */

import type { IAlertRepository } from '../../domain/repositories/IAlertRepository.js';
import type { AlertTypeDto, CreateAlertTypeDto, AlertPriorite } from '../../domain/types.js';

const VALID_PRIORITES: AlertPriorite[] = ['basse', 'normale', 'haute', 'critique'];

export class CreateAlertTypeUseCase {
  constructor(private repo: IAlertRepository) {}

  async execute(data: CreateAlertTypeDto): Promise<AlertTypeDto> {
    if (!data.code || data.code.trim().length === 0) {
      throw new Error("Le code du type d'alerte est requis");
    }

    if (!data.nom || data.nom.trim().length === 0) {
      throw new Error("Le nom du type d'alerte est requis");
    }

    if (data.priorite !== undefined && !VALID_PRIORITES.includes(data.priorite)) {
      throw new Error(`Priorité invalide. Valeurs acceptées : ${VALID_PRIORITES.join(', ')}`);
    }

    const normalizedCode = data.code.trim().toUpperCase();

    const existing = await this.repo.findAlertTypeByCode(normalizedCode);
    if (existing) {
      throw new Error(`Un type d'alerte avec le code "${normalizedCode}" existe déjà`);
    }

    return this.repo.createAlertType({
      code: normalizedCode,
      nom: data.nom.trim(),
      description: data.description?.trim(),
      priorite: data.priorite ?? 'normale',
      actif: data.actif ?? true,
    });
  }
}
