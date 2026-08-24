/**
 * GetCourseRecurrentsUseCase.test.ts
 * Tests unitaires — courses / GetCourseRecurrentsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetCourseRecurrentsUseCase } from '../GetCourseRecurrentsUseCase';
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

let useCase: GetCourseRecurrentsUseCase;

beforeEach(() => {
  useCase = new GetCourseRecurrentsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetCourseRecurrentsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner la liste des cours récurrents', async () => {
      const mockResult = [{ id: 1 }, { id: 2 }] as any[];
      mockRepo.getCourseRecurrents.mockResolvedValue(mockResult);

      const result = await useCase.execute();

      expect(mockRepo.getCourseRecurrents).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getCourseRecurrents.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute()).rejects.toThrow('DB error');
    });

  });
});
