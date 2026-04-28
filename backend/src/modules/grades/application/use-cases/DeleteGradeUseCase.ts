/**
 * DeleteGradeUseCase
 * Supprime un grade existant (Application Layer)
 * Vérifie l'existence avant de déléguer la suppression au repository.
 * La vérification des références (membres/professeurs) est gérée par le repository.
 */

import type { IGradeRepository } from "../../domain/repositories/IGradeRepository.js";

export class DeleteGradeUseCase {
  constructor(private repo: IGradeRepository) {}

  async execute(id: number): Promise<void> {
    const grade = await this.repo.findById(id);
    if (!grade) {
      throw new Error("Grade introuvable");
    }

    await this.repo.delete(id);
  }
}
