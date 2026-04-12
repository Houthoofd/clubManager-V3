import type { CourseRecurrentListItemDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetCourseRecurrentsUseCase
 * Récupère la liste complète des cours récurrents avec leurs professeurs associés
 */
export class GetCourseRecurrentsUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute le cas d'usage
   * @returns Liste de tous les cours récurrents triés par jour de semaine et heure
   */
  async execute(): Promise<CourseRecurrentListItemDto[]> {
    return this.repo.getCourseRecurrents();
  }
}
