/**
 * GetCourseRecurrentByIdUseCase.test.ts
 * Tests unitaires — courses / GetCourseRecurrentByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { GetCourseRecurrentByIdUseCase } from '../GetCourseRecurrentByIdUseCase';
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

let useCase: GetCourseRecurrentByIdUseCase;

beforeEach(() => {
  useCase = new GetCourseRecurrentByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetCourseRecurrentByIdUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le cours récurrent quand il est trouvé', async () => {
      const mockResult = { id: 1, type_cours: 'Yoga' } as any;
      mockRepo.getCourseRecurrentById.mockResolvedValue(mockResult);

      const result = await useCase.execute(1);

      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le cours récurrent est introuvable', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue(null as any);

      await expect(useCase.execute(99)).rejects.toThrow('Cours récurrent introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getCourseRecurrentById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

  });
});
