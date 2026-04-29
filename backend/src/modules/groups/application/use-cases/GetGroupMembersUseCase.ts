/**
 * GetGroupMembersUseCase
 * Récupère la liste des membres d'un groupe (Application Layer)
 */

import type { GroupMember } from "../../domain/types.js";
import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";

export class GetGroupMembersUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(groupeId: number): Promise<GroupMember[]> {
    const group = await this.repo.findById(groupeId);
    if (!group) {
      throw new Error("Groupe introuvable");
    }

    return this.repo.getMembers(groupeId);
  }
}
