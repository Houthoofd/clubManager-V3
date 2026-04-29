/**
 * GetGradeByIdUseCase
 * Récupère un grade par son ID (Application Layer)
 */

import type { Grade } from "../../domain/types.js";
import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

export class GetGradeByIdUseCase {
  constructor(private repo: IGradeRepository) {}

  async execute(id: number): Promise<Grade> {
    const grade = await this.repo.findById(id);
    if (!grade) throw new Error("Grade introuvable");
    return grade;
  }
}
