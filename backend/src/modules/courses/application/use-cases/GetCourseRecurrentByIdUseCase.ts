import type { CourseRecurrentResponseDto } from "@clubmanager/types";
import type { ICourseRepository } from "../../domain/repositories/ICourseRepository.js";

/**
 * GetCourseRecurrentByIdUseCase
 * Récupère un cours récurrent par son identifiant.
 * Lève une erreur si le cours récurrent est introuvable.
 */
export class GetCourseRecurrentByIdUseCase {
  constructor(private repo: ICourseRepository) {}

  /**
   * @param id - Identifiant du cours récurrent
   * @throws Error si le cours récurrent n'existe pas
   */
  async execute(id: number): Promise<CourseRecurrentResponseDto> {
    const courseRecurrent = await this.repo.getCourseRecurrentById(id);
    if (!courseRecurrent) {
      throw new Error("Cours récurrent introuvable");
    }
    return courseRecurrent;
  }
}
