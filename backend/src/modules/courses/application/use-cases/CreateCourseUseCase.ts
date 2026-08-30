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
    if (!dto.cours_recurrent_id) {
      throw new Error("Vous devez associer cette séance à un cours récurrent (qui définit le ou les professeurs).");
    }

    const isConflict = await this.repo.hasSessionConflict(
      dto.date_cours,
      dto.heure_debut,
      dto.heure_fin,
      dto.type_cours
    );

    if (isConflict) {
      throw new Error(`Une séance de ${dto.type_cours} existe déjà sur ce créneau.`);
    }

    return this.repo.createCourse(dto);
  }
}
