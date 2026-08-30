/**
 * GenerateCoursesUseCase.test.ts
 * Tests unitaires — courses / GenerateCoursesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GenerateCoursesUseCase } from '../GenerateCoursesUseCase';
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

let useCase: GenerateCoursesUseCase;

beforeEach(() => {
  useCase = new GenerateCoursesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GenerateCoursesUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le résultat quand les données sont valides', async () => {
      const mockResult = { generated: 2, cours: [{ id: 1 }, { id: 2 }] as any };
      mockRepo.generateCourses.mockResolvedValue(mockResult);

      const dto = { cours_recurrent_id: 1, date_debut: '2023-10-01', date_fin: '2023-10-31' };
      const result = await useCase.execute(dto);

      expect(mockRepo.generateCourses).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.generateCourses.mockRejectedValue(new Error('DB error'));
      const dto = { cours_recurrent_id: 1, date_debut: '2023-10-01', date_fin: '2023-10-31' };
      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });
  });
});
