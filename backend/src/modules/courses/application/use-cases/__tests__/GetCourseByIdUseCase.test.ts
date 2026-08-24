/**
 * GetCourseByIdUseCase.test.ts
 * Tests unitaires — courses / GetCourseByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetCourseByIdUseCase } from '../GetCourseByIdUseCase';
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

let useCase: GetCourseByIdUseCase;

beforeEach(() => {
  useCase = new GetCourseByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetCourseByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le cours quand l\'identifiant existe', async () => {
      const mockCourse = { id: 1, type_cours: 'Judo' } as any;
      mockRepo.getCourseById.mockResolvedValue(mockCourse);

      const result = await useCase.execute(1);

      expect(mockRepo.getCourseById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCourse);
    });

    it('devrait lancer une erreur si le cours est introuvable', async () => {
      mockRepo.getCourseById.mockResolvedValue(null);

      await expect(useCase.execute(99)).rejects.toThrow('Cours introuvable');
      expect(mockRepo.getCourseById).toHaveBeenCalledWith(99);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getCourseById.mockRejectedValue(new Error('DB error'));
      
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
