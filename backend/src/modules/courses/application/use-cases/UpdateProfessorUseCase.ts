import type { ProfessorResponseDto, UpdateProfessorDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * UpdateProfessorUseCase
 * Met à jour les informations d'un professeur existant
 */
export class UpdateProfessorUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'usage
   * @param dto - Données de mise à jour (id obligatoire, autres champs optionnels)
   * @returns Le professeur mis à jour avec toutes ses relations
   * @throws Error si le professeur est introuvable
   */
  async execute(dto: UpdateProfessorDto): Promise<ProfessorResponseDto> {
    const result = await this.repo.updateProfessor(dto);
    if (!result) throw new Error("Professeur introuvable");
    return result;
  }
}
