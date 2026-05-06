/**
 * UpdateFamilyUseCase
 * Cas d'usage admin pour renommer une famille (Application Layer)
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";
import type { FamilyWithCount, UpdateFamilyDto } from "../../domain/adminTypes.js";

export class UpdateFamilyUseCase {
  constructor(private repo: IFamilyRepository) {}

  async execute(data: UpdateFamilyDto): Promise<FamilyWithCount> {
    const existing = await this.repo.findById(data.id);
    if (!existing) {
      throw new Error("Famille introuvable");
    }

    if (data.nom !== undefined) {
      const trimmed = data.nom?.trim();
      if (trimmed !== undefined && trimmed !== null && trimmed.length > 0 && trimmed.length < 2) {
        throw new Error("Le nom doit contenir au moins 2 caractères");
      }
      if (trimmed && trimmed.length > 100) {
        throw new Error("Le nom ne peut pas dépasser 100 caractères");
      }
    }

    return this.repo.update(data);
  }
}
