import type { CourseResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetCourseByIdUseCase
 * Récupère une instance de cours par son identifiant.
 * Lève une erreur si le cours est introuvable.
 */
export class GetCourseByIdUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'usage
   * @param id - L'identifiant du cours à récupérer
   * @returns Le cours avec ses relations complètes
   * @throws {Error} Si le cours n'existe pas en base de données
   */
  async execute(id: number): Promise<CourseResponseDto> {
    const course = await this.repo.getCourseById(id);
    if (!course) {
      throw new Error("Cours introuvable");
    }
    return course;
  }
}
