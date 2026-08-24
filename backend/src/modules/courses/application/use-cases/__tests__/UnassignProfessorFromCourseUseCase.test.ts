/**
 * UnassignProfessorFromCourseUseCase.test.ts
 * Tests unitaires — courses / UnassignProfessorFromCourseUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { UnassignProfessorFromCourseUseCase } from '../UnassignProfessorFromCourseUseCase';
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

let useCase: UnassignProfessorFromCourseUseCase;

beforeEach(() => {
  useCase = new UnassignProfessorFromCourseUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('UnassignProfessorFromCourseUseCase', () => {
  describe('execute', () => {
    it('devrait désassigner le professeur si le cours existe', async () => {
      const mockCourse: any = { id: 1 };
      mockRepo.getCourseRecurrentById.mockResolvedValue(mockCourse);
      mockRepo.unassignProfessor.mockResolvedValue();

      await useCase.execute(1, 2);

      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.unassignProfessor).toHaveBeenCalledWith(1, 2);
    });

    it('devrait lancer une erreur si le cours est introuvable', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue(null);

      await expect(useCase.execute(999, 2)).rejects.toThrow('Cours récurrent introuvable');
      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(999);
      expect(mockRepo.unassignProfessor).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getCourseRecurrentById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 2)).rejects.toThrow('DB error');
    });
  });
});
