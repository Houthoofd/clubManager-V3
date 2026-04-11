import type { UpdateCourseRecurrentDto, CourseRecurrentResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * UpdateCourseRecurrentUseCase
 * Met à jour un cours récurrent existant.
 * Si `professeur_ids` est fourni, la liste des professeurs est intégralement remplacée.
 * Lève une erreur si le cours récurrent est introuvable.
 */
export class UpdateCourseRecurrentUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * @param dto - Données de mise à jour (id obligatoire, autres champs optionnels)
   * @throws {Error} Si le cours récurrent n'existe pas
   */
  async execute(dto: UpdateCourseRecurrentDto): Promise<CourseRecurrentResponseDto> {
    return this.repo.updateCourseRecurrent(dto);
  }
}
