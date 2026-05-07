import type { ICourseRepository } from '../../domain/repositories/ICourseRepository.js';

/**
 * GetCourseProfessorsUseCase
 * Retourne la liste des IDs de professeurs assignés à un cours récurrent.
 * Vérifie l'existence du cours récurrent avant la requête.
 */
export class GetCourseProfessorsUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  async execute(coursRecurrentId: number): Promise<number[]> {
    const course = await this.repo.getCourseRecurrentById(coursRecurrentId);
    if (!course) throw new Error('Cours récurrent introuvable');
    return this.repo.getProfessorsForCourse(coursRecurrentId);
  }
}
