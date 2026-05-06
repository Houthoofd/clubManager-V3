/**
 * DeleteFamilyUseCase
 * Cas d'usage admin pour supprimer une famille (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

export class DeleteFamilyUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("Famille introuvable");
    }
    await this.repo.delete(id);
  }
}
