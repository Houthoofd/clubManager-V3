import type { ICourseRepository } from '../../domain/repositories/ICourseRepository.js';

/**
 * AssignProfessorToCourseUseCase
 * Assigne un professeur à un cours récurrent.
 * Vérifie l'existence du cours et du professeur avant d'insérer la liaison.
 */
export class AssignProfessorToCourseUseCase {
  constructor(private readonly repo: ICourseRepository) {}

  async execute(coursRecurrentId: number, professorId: number): Promise<void> {
    // Vérifie que le cours récurrent existe
    const course = await this.repo.getCourseRecurrentById(coursRecurrentId);
    if (!course) throw new Error('Cours récurrent introuvable');

    // Vérifie que le professeur existe
    const professor = await this.repo.getProfessorById(professorId);
    if (!professor) throw new Error('Professeur introuvable');

    await this.repo.assignProfessor(coursRecurrentId, professorId);
  }
}
