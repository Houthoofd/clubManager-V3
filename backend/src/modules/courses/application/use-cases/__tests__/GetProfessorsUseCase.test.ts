/**
 * GetProfessorsUseCase.test.ts
 * Tests unitaires — courses / GetProfessorsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetProfessorsUseCase } from '../GetProfessorsUseCase';
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

let useCase: GetProfessorsUseCase;

beforeEach(() => {
  useCase = new GetProfessorsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetProfessorsUseCase', () => {
  describe('execute', () => {
    it('devrait retourner la liste des professeurs', async () => {
      const mockProfs: any[] = [{ id: 1 }, { id: 2 }];
      mockRepo.getProfessors.mockResolvedValue(mockProfs);

      const result = await useCase.execute();

      expect(mockRepo.getProfessors).toHaveBeenCalled();
      expect(result).toEqual(mockProfs);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getProfessors.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute()).rejects.toThrow('DB error');
    });
  });
});
