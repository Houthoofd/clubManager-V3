import type { CreateCourseDto, CourseResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * CreateCourseUseCase
 * Crée une instance ponctuelle de cours (liée ou non à un cours récurrent)
 */
export class CreateCourseUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Exécute la création d'un cours
   * @param dto - Données du cours à créer (date, type, heures, cours_recurrent_id optionnel)
   * @returns Le cours créé avec toutes ses relations
   */
  async execute(dto: CreateCourseDto): Promise<CourseResponseDto> {
    return this.repo.createCourse(dto);
  }
}
