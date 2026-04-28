/**
 * CreateGradeUseCase
 * Cas d'usage pour la création d'un nouveau grade/ceinture (Application Layer)
 */

import type { Grade, CreateGradeDto } from "../../domain/types.js";
import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

export class CreateGradeUseCase {
  constructor(private repo: IGradeRepository) {}

  async execute(data: CreateGradeDto): Promise<Grade> {
    // Validation : nom requis et non vide
    const nom = data.nom?.trim();
    if (!nom) {
      throw new Error("Le nom du grade est requis");
    }

    // Validation : ordre doit être un entier >= 0
    if (data.ordre === undefined || data.ordre === null) {
      throw new Error("L'ordre du grade est requis");
    }
    if (!Number.isInteger(data.ordre) || data.ordre < 0) {
      throw new Error("L'ordre doit être un entier supérieur ou égal à 0");
    }

    return this.repo.create({
      nom,
      ordre: data.ordre,
      couleur: data.couleur ?? null,
    });
  }
}
