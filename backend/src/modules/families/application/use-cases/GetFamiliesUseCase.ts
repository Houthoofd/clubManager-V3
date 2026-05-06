/**
 * GetFamiliesUseCase
 * Cas d'usage admin pour récupérer la liste paginée des familles (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { GetFamiliesQuery, PaginatedFamiliesResponse } from "../../domain/adminTypes.js";

export class GetFamiliesUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(query: GetFamiliesQuery): Promise<PaginatedFamiliesResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
