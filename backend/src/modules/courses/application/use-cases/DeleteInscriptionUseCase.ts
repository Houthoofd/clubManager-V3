import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * DeleteInscriptionUseCase
 * Supprime une inscription par son identifiant.
 */
export class DeleteInscriptionUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute la suppression de l'inscription
   * @param id - L'identifiant de l'inscription à supprimer
   */
  async execute(id: number): Promise<void> {
    await this.repo.deleteInscription(id);
  }
}
