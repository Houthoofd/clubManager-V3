/**
 * UpdateCourseRecurrentUseCase.test.ts
 * Tests unitaires — courses / UpdateCourseRecurrentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { UpdateCourseRecurrentUseCase } from '../UpdateCourseRecurrentUseCase';
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

let useCase: UpdateCourseRecurrentUseCase;

beforeEach(() => {
  useCase = new UpdateCourseRecurrentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('UpdateCourseRecurrentUseCase', () => {
  describe('execute', () => {
    it('devrait mettre à jour le cours quand les données sont valides', async () => {
      const mockCourse: any = { id: 1, jour_semaine: 1, heure_debut: '10:00', heure_fin: '11:00' };
      const updatedDto = { id: 1, heure_debut: '09:00', heure_fin: '10:00' };
      const returnedCourse: any = { ...mockCourse, ...updatedDto };

      mockRepo.getCourseRecurrentById.mockResolvedValue(mockCourse);
      mockRepo.hasTimeConflict.mockResolvedValue(null);
      mockRepo.updateCourseRecurrent.mockResolvedValue(returnedCourse);

      const result = await useCase.execute(updatedDto as any);

      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.hasTimeConflict).toHaveBeenCalledWith(1, '09:00', '10:00', 1);
      expect(mockRepo.updateCourseRecurrent).toHaveBeenCalledWith(updatedDto);
      expect(result).toEqual(returnedCourse);
    });

    it('devrait lancer une erreur si le cours est introuvable', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue(null);
      await expect(useCase.execute({ id: 999 } as any)).rejects.toThrow('Cours récurrent introuvable');
    });

    it('devrait lancer une erreur si l\'heure de fin est <= heure de début', async () => {
      const mockCourse: any = { id: 1, jour_semaine: 1, heure_debut: '10:00', heure_fin: '11:00' };
      mockRepo.getCourseRecurrentById.mockResolvedValue(mockCourse);

      await expect(useCase.execute({ id: 1, heure_debut: '11:00', heure_fin: '10:00' } as any))
        .rejects.toThrow("L'heure de fin doit être postérieure à l'heure de début");
    });

    it('devrait lancer une erreur s\'il y a un conflit d\'horaire', async () => {
      const mockCourse: any = { id: 1, jour_semaine: 1, heure_debut: '10:00', heure_fin: '11:00' };
      mockRepo.getCourseRecurrentById.mockResolvedValue(mockCourse);
      
      const conflict: any = { type_cours: 'Judo', heure_debut: '10:00:00', heure_fin: '11:00:00' };
      mockRepo.hasTimeConflict.mockResolvedValue(conflict);

      await expect(useCase.execute({ id: 1 } as any))
        .rejects.toThrow('Ce créneau est déjà occupé par le cours "Judo" (10:00–11:00)');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getCourseRecurrentById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute({ id: 1 } as any)).rejects.toThrow('DB error');
    });
  });
});
