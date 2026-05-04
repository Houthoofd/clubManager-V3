import type { ProfessorResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetProfessorByIdUseCase
 * Récupère un professeur par son identifiant avec son grade et ses cours assignés
 */
export class GetProfessorByIdUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * @param id - Identifiant numérique du professeur
   * @returns Le professeur avec ses données complètes
   * @throws Error si le professeur est introuvable
   */
  async execute(id: number): Promise<ProfessorResponseDto> {
    const result = await this.repo.getProfessorById(id);
    if (!result) throw new Error("Professeur introuvable");
    return result;
  }
}
