import type { GenerateCoursesDto, CourseListItemDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GenerateCoursesUseCase
 * Génère automatiquement des instances de cours à partir d'un cours récurrent
 * sur une plage de dates donnée, en excluant les dates spécifiées
 */
export class GenerateCoursesUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute la génération des cours
   * @param dto - Paramètres de génération : cours_recurrent_id, date_debut, date_fin, exclure_dates
   * @returns Le nombre de cours générés et la liste des cours créés
   * @throws Error si le cours récurrent est introuvable
   */
  async execute(dto: GenerateCoursesDto): Promise<{
    generated: number;
    cours: CourseListItemDto[];
  }> {
    return this.repo.generateCourses(dto);
  }
}
