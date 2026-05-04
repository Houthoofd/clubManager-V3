import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * DeleteProfessorUseCase
 * Supprime un professeur et retire ses assignations de cours récurrents
 */
export class DeleteProfessorUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * @param id - Identifiant numérique du professeur à supprimer
   * @throws Error si le professeur est introuvable
   */
  async execute(id: number): Promise<void> {
    const existing = await this.repo.getProfessorById(id);
    if (!existing) throw new Error("Professeur introuvable");
    await this.repo.deleteProfessor(id);
  }
}
