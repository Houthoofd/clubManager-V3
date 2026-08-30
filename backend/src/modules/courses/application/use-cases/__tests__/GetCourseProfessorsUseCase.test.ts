/**
 * GetCourseProfessorsUseCase.test.ts
 * Tests unitaires — courses / GetCourseProfessorsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetCourseProfessorsUseCase } from '../GetCourseProfessorsUseCase';
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

let useCase: GetCourseProfessorsUseCase;

beforeEach(() => {
  useCase = new GetCourseProfessorsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetCourseProfessorsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le résultat quand les données sont valides', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue({ id: 1 } as any);
      mockRepo.getProfessorsForCourse.mockResolvedValue([10, 20]);

      const result = await useCase.execute(1);

      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.getProfessorsForCourse).toHaveBeenCalledWith(1);
      expect(result).toEqual([10, 20]);
    });

    it('devrait lancer une erreur si le cours est introuvable', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue(null as any);

      await expect(useCase.execute(99)).rejects.toThrow('Cours récurrent introuvable');
      expect(mockRepo.getProfessorsForCourse).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de la récupération du cours', async () => {
      mockRepo.getCourseRecurrentById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue lors de la récupération des profs', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue({ id: 1 } as any);
      mockRepo.getProfessorsForCourse.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

  });
});
