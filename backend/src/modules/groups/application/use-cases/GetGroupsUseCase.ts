/**
 * GetGroupsUseCase
 * Cas d'usage pour récupérer la liste paginée des groupes (Application Layer)
 */

import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";
import type {
  GetGroupsQuery,
  PaginatedGroupsResponse,
} from "../../domain/types.js";

export class GetGroupsUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(query: GetGroupsQuery): Promise<PaginatedGroupsResponse> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return this.repo.findAll({ ...query, page, limit });
  }
}
