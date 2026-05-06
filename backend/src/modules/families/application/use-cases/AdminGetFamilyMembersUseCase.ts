/**
 * AdminGetFamilyMembersUseCase
 * Cas d'usage admin pour récupérer les membres d'une famille (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { FamilyMemberWithUser } from "@clubmanager/types";

export class AdminGetFamilyMembersUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(familleId: number): Promise<FamilyMemberWithUser[]> {
    const family = await this.repo.findById(familleId);
    if (!family) {
      throw new Error("Famille introuvable");
    }
    return this.repo.getMembresByFamilleId(familleId);
  }
}
