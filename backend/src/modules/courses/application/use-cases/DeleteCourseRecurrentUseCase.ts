import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * DeleteCourseRecurrentUseCase
 * Supprime un cours récurrent par son ID.
 * La suppression en cascade gère la table cours_recurrent_professeur.
 */
export class DeleteCourseRecurrentUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute la suppression du cours récurrent
   * @param id - L'identifiant du cours récurrent à supprimer
   */
  async execute(id: number): Promise<void> {
    await this.repo.deleteCourseRecurrent(id);
  }
}
