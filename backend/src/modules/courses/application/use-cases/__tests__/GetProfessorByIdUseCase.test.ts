/**
 * GetProfessorByIdUseCase.test.ts
 * Tests unitaires — courses / GetProfessorByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetProfessorByIdUseCase } from '../GetProfessorByIdUseCase';
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

let useCase: GetProfessorByIdUseCase;

beforeEach(() => {
  useCase = new GetProfessorByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetProfessorByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le professeur quand il existe', async () => {
      const mockProf: any = { id: 1, name: 'John Doe' };
      mockRepo.getProfessorById.mockResolvedValue(mockProf);

      const result = await useCase.execute(1);

      expect(mockRepo.getProfessorById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProf);
    });

    it('devrait lancer une erreur si le professeur est introuvable', async () => {
      mockRepo.getProfessorById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow('Professeur introuvable');
      expect(mockRepo.getProfessorById).toHaveBeenCalledWith(999);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getProfessorById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
