/**
 * DeleteInscriptionUseCase.test.ts
 * Tests unitaires — courses / DeleteInscriptionUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { DeleteInscriptionUseCase } from '../DeleteInscriptionUseCase';
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

let useCase: DeleteInscriptionUseCase;

beforeEach(() => {
  useCase = new DeleteInscriptionUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteInscriptionUseCase', () => {
  describe('execute', () => {
    it('devrait appeler la méthode de suppression avec l\'ID donné', async () => {
      mockRepo.deleteInscription.mockResolvedValue(undefined);
      await useCase.execute(123);
      expect(mockRepo.deleteInscription).toHaveBeenCalledWith(123);
      expect(mockRepo.deleteInscription).toHaveBeenCalledTimes(1);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.deleteInscription.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(123)).rejects.toThrow('DB error');
    });
  });
});
