/**
 * CreateCourseRecurrentUseCase
 * Application Layer — crée un nouveau cours récurrent après validation
 */

import type { CreateCourseRecurrentDto, CourseRecurrentResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

export class CreateCourseRecurrentUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * Valide le DTO et crée un cours récurrent
   * @throws {Error} Si type_cours est vide
   * @throws {Error} Si jour_semaine n'est pas entre 1 (Lundi) et 7 (Dimanche)
   */
  async execute(
    dto: CreateCourseRecurrentDto,
  ): Promise<CourseRecurrentResponseDto> {
    if (!dto.type_cours || dto.type_cours.trim() === "") {
      throw new Error("Le type de cours est obligatoire");
    }

    if (
      !dto.jour_semaine ||
      !Number.isInteger(dto.jour_semaine) ||
      dto.jour_semaine < 1 ||
      dto.jour_semaine > 7
    ) {
      throw new Error(
        "Le jour de la semaine doit être un entier entre 1 (Lundi) et 7 (Dimanche)",
      );
    }

    if (!dto.heure_debut || !dto.heure_fin) {
      throw new Error("L'heure de début et l'heure de fin sont obligatoires");
    }

    return this.repo.createCourseRecurrent(dto);
  }
}
