/**
 * GetGroupByIdUseCase
 * Récupère un groupe par son ID (Application Layer)
 */

import type { Group } from "../../domain/types.js";
import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class GetGroupByIdUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(id: number): Promise<Group> {
    const group = await this.repo.findById(id);
    if (!group) {
      throw new Error("Groupe introuvable");
    }
    return group;
  }
}
