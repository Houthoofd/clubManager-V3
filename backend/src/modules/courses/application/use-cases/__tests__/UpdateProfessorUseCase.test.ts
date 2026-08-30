/**
 * UpdateProfessorUseCase.test.ts
 * Tests unitaires — courses / UpdateProfessorUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { UpdateProfessorUseCase } from '../UpdateProfessorUseCase';
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

let useCase: UpdateProfessorUseCase;

beforeEach(() => {
  useCase = new UpdateProfessorUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('UpdateProfessorUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le professeur mis à jour', async () => {
      const mockProf: any = { id: 1, name: 'John Doe' };
      mockRepo.updateProfessor.mockResolvedValue(mockProf);

      const result = await useCase.execute({ id: 1, name: 'John Doe' } as any);

      expect(mockRepo.updateProfessor).toHaveBeenCalledWith({ id: 1, name: 'John Doe' });
      expect(result).toEqual(mockProf);
    });

    it('devrait lancer une erreur si le professeur est introuvable', async () => {
      mockRepo.updateProfessor.mockResolvedValue(null);

      await expect(useCase.execute({ id: 999 } as any)).rejects.toThrow('Professeur introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.updateProfessor.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute({ id: 1 } as any)).rejects.toThrow('DB error');
    });
  });
});
