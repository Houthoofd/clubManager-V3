/**
 * GetInformationsUseCase
 * Récupère la liste paginée des paramètres (Application Layer)
 */

import type { ListInformationsQuery, InformationsListResponse } from '@clubmanager/types';
import type { IInformationRepository } from '../../domain/repositories/IInformationRepository.js';

export class GetInformationsUseCase {
  constructor(private repo: IInformationRepository) {}

  async execute(query: ListInformationsQuery): Promise<InformationsListResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
