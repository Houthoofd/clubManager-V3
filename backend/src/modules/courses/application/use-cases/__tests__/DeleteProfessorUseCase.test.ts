/**
 * DeleteProfessorUseCase.test.ts
 * Tests unitaires — courses / DeleteProfessorUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { DeleteProfessorUseCase } from '../DeleteProfessorUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<ICourseRepository> = {
  getCourseRecurrents:      jest.fn(),
  getCourseRecurrentById:   jest.fn(),
  createCourseRecurrent:    jest.fn(),
  updateCourseRecurrent:    jest.fn(),
  deleteCourseRecurrent:    jest.fn(),
  hasTimeConflict:          jest.fn(),
  assignProfessor:          jest.fn(),
  unassignProfessor:        jest.fn(),
  getProfessorsForCourse:   jest.fn(),
  getProfessors:            jest.fn(),
  getProfessorById:         jest.fn(),
  createProfessor:          jest.fn(),
  updateProfessor:          jest.fn(),
  deleteProfessor:          jest.fn(),
  getCourses:               jest.fn(),
  getCourseById:            jest.fn(),
  createCourse:             jest.fn(),
  generateCourses:          jest.fn(),
  getCourseInscriptions:    jest.fn(),
  createInscription:        jest.fn(),
  bulkUpdatePresence:       jest.fn(),
  deleteInscription:        jest.fn(),
  getAttendanceForExport:   jest.fn(),
  getMyEnrollments:         jest.fn(),
} as jest.Mocked<ICourseRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: DeleteProfessorUseCase;

beforeEach(() => {
  useCase = new DeleteProfessorUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteProfessorUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer le professeur si celui-ci existe', async () => {
      const existingProf = { id: 1, name: 'Jean' };
      mockRepo.getProfessorById.mockResolvedValue(existingProf as any);
      mockRepo.deleteProfessor.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(mockRepo.getProfessorById).toHaveBeenCalledWith(1);
      expect(mockRepo.deleteProfessor).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si le professeur n\'existe pas', async () => {
      mockRepo.getProfessorById.mockResolvedValue(null);

      await expect(useCase.execute(99)).rejects.toThrow('Professeur introuvable');
      expect(mockRepo.deleteProfessor).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si la suppression échoue', async () => {
      const existingProf = { id: 1, name: 'Jean' };
      mockRepo.getProfessorById.mockResolvedValue(existingProf as any);
      mockRepo.deleteProfessor.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
