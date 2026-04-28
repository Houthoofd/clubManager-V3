/**
 * GetGradesUseCase
 * Retourne la liste complète des grades triés par ordre croissant (Application Layer)
 */

import type { Grade } from "../../domain/types.js";
import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

export class GetGradesUseCase {
  constructor(private repo: IGradeRepository) {}

  async execute(): Promise<Grade[]> {
    return this.repo.findAll();
  }
}
