import type { ProfessorListItemDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetProfessorsUseCase
 * Récupère la liste de tous les professeurs avec leur grade et statistiques de cours
 */
export class GetProfessorsUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'utilisation
   * @returns Liste des professeurs avec grade et nombre de cours assignés
   */
  async execute(): Promise<ProfessorListItemDto[]> {
    return this.repo.getProfessors();
  }
}
