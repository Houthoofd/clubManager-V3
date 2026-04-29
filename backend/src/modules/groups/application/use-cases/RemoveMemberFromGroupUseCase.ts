/**
 * RemoveMemberFromGroupUseCase
 * Retire un utilisateur d'un groupe (Application Layer)
 */

import type { IGroupRepository } from "../../domain/repositories/IGroupRepository.js";
import type { RemoveMemberDto } from "../../domain/types.js";

export class RemoveMemberFromGroupUseCase {
  constructor(private repo: IGroupRepository) {}

  async execute(data: RemoveMemberDto): Promise<void> {
    await this.repo.removeMember(data);
  }
}
