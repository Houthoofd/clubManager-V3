/**
 * AdminAddFamilyMemberUseCase
 * Cas d'usage admin pour ajouter un utilisateur existant à une famille (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { AdminAddMemberDto } from "../../domain/adminTypes.js";

export class AdminAddFamilyMemberUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(dto: AdminAddMemberDto): Promise<void> {
    const family = await this.repo.findById(dto.familleId);
    if (!family) {
      throw new Error("Famille introuvable");
    }

    const alreadyMember = await this.repo.isMembre(dto.familleId, dto.userId);
    if (alreadyMember) {
      throw new Error("Cet utilisateur est déjà membre de cette famille");
    }

    await this.repo.adminAddMembre(dto);
  }
}
