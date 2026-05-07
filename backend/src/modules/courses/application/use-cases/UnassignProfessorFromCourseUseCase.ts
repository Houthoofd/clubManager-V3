import type { ICourseRepository } from '../../domain/repositories/ICourseRepository.js';

/**
 * UnassignProfessorFromCourseUseCase
 * Retire un professeur d'un cours récurrent.
 * Vérifie l'existence du cours récurrent avant de supprimer la liaison.
 */
export class UnassignProfessorFromCourseUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  async execute(coursRecurrentId: number, professorId: number): Promise<void> {
    const course = await this.repo.getCourseRecurrentById(coursRecurrentId);
    if (!course) throw new Error('Cours récurrent introuvable');
    await this.repo.unassignProfessor(coursRecurrentId, professorId);
  }
}
