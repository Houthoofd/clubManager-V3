/**
 * AdminGetFamilyByIdUseCase
 * Cas d'usage admin pour récupérer une famille par son ID (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { FamilyWithCount } from "../../domain/adminTypes.js";

export class AdminGetFamilyByIdUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(id: number): Promise<FamilyWithCount> {
    const family = await this.repo.findById(id);
    if (!family) {
      throw new Error("Famille introuvable");
    }
    return family;
  }
}
