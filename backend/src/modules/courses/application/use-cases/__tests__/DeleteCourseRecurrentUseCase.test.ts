/**
 * DeleteCourseRecurrentUseCase.test.ts
 * Tests unitaires — courses / DeleteCourseRecurrentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { DeleteCourseRecurrentUseCase } from '../DeleteCourseRecurrentUseCase';
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

let useCase: DeleteCourseRecurrentUseCase;

beforeEach(() => {
  useCase = new DeleteCourseRecurrentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteCourseRecurrentUseCase', () => {
  describe('execute', () => {
    it('devrait appeler la méthode de suppression avec l\'ID donné', async () => {
      mockRepo.deleteCourseRecurrent.mockResolvedValue(undefined);
      await useCase.execute(42);
      expect(mockRepo.deleteCourseRecurrent).toHaveBeenCalledWith(42);
      expect(mockRepo.deleteCourseRecurrent).toHaveBeenCalledTimes(1);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.deleteCourseRecurrent.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(42)).rejects.toThrow('DB error');
    });
  });
});
