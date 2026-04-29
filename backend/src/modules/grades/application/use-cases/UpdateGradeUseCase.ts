/**
 * UpdateGradeUseCase
 * Mise à jour partielle d'un grade existant (Application Layer)
 */

import type { Grade, UpdateGradeDto } from "../../domain/types.js";
import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

export class UpdateGradeUseCase {
  constructor(private repo: IGradeRepository) {}

  async execute(data: UpdateGradeDto): Promise<Grade> {
    // Validation du nom si fourni
    if (data.nom !== undefined) {
      if (data.nom.trim().length === 0) {
        throw new Error("Le nom du grade est requis");
      }
      data = { ...data, nom: data.nom.trim() };
    }

    // Validation de l'ordre si fourni
    if (data.ordre !== undefined) {
      if (!Number.isInteger(data.ordre) || data.ordre < 0) {
        throw new Error("L'ordre doit être un entier >= 0");
      }
    }

    // Vérification de l'existence du grade
    const existing = await this.repo.findById(data.id);
    if (!existing) {
      throw new Error("Grade introuvable");
    }

    return this.repo.update(data);
  }
}
