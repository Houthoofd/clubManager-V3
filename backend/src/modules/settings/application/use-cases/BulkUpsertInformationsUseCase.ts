/**
 * BulkUpsertInformationsUseCase
 * Upsert en masse de plusieurs paramètres (max 50) (Application Layer)
 */

import type { CreateInformation, Information } from '@clubmanager/types';
import type { IInformationRepository } from '../../domain/repositories/IInformationRepository.js';

export class BulkUpsertInformationsUseCase {
  constructor(private repo: IInformationRepository) {}

  async execute(informations: CreateInformation[]): Promise<Information[]> {
    if (!informations || informations.length === 0) {
      throw new Error('Au moins une information doit être fournie');
    }

    if (informations.length > 50) {
      throw new Error('Vous ne pouvez pas créer/modifier plus de 50 informations à la fois');
    }

    for (const info of informations) {
      if (!info.cle || info.cle.trim().length === 0) {
        throw new Error('Chaque entrée doit avoir une clé (cle) valide');
      }
      if (!info.valeur || info.valeur.trim().length === 0) {
        throw new Error(`La valeur est requise pour la clé '${info.cle}'`);
      }
    }

    return this.repo.bulkUpsert(informations);
  }
}
