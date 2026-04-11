import type { CreateProfessorDto, ProfessorResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * CreateProfessorUseCase
 * Valide les données puis crée un nouveau professeur
 */
export class CreateProfessorUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Valide que nom et prénom sont renseignés, puis délègue au repository
   * @throws Error si nom ou prénom est vide
   */
  async execute(dto: CreateProfessorDto): Promise<ProfessorResponseDto> {
    if (!dto.nom || dto.nom.trim() === "") {
      throw new Error("Le nom du professeur est obligatoire");
    }
    if (!dto.prenom || dto.prenom.trim() === "") {
      throw new Error("Le prénom du professeur est obligatoire");
    }
    return this.repo.createProfessor(dto);
  }
}
