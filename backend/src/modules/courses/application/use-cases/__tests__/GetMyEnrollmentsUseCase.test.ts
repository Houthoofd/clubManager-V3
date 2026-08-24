/**
 * GetMyEnrollmentsUseCase.test.ts
 * Tests unitaires — courses / GetMyEnrollmentsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetMyEnrollmentsUseCase } from '../GetMyEnrollmentsUseCase';
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

let useCase: GetMyEnrollmentsUseCase;

beforeEach(() => {
  useCase = new GetMyEnrollmentsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetMyEnrollmentsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les inscriptions de l\'utilisateur', async () => {
      const mockResult = [{ inscription_id: 1, cours_id: 2 }] as any[];
      mockRepo.getMyEnrollments.mockResolvedValue(mockResult);

      const result = await useCase.execute(10);

      expect(mockRepo.getMyEnrollments).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getMyEnrollments.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(10)).rejects.toThrow('DB error');
    });

  });
});
