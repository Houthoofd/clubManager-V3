import type { CourseListItemDto, SearchCourseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetCoursesUseCase
 * Récupère la liste des cours (instances) avec filtres optionnels.
 * Supporte le filtrage par période, type de cours et cours récurrent parent.
 */
export class GetCoursesUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'usage
   * @param filters - Filtres optionnels : date_debut, date_fin, type_cours, cours_recurrent_id
   * @returns Liste des cours correspondant aux filtres, triés par date décroissante
   */
  async execute(filters: SearchCourseDto): Promise<CourseListItemDto[]> {
    return this.repo.getCourses(filters);
  }
}
