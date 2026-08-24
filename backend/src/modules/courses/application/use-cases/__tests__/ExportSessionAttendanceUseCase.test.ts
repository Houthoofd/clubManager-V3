/**
 * ExportSessionAttendanceUseCase.test.ts
 * Tests unitaires — courses / ExportSessionAttendanceUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : courses
 */

import { ExportSessionAttendanceUseCase } from '../ExportSessionAttendanceUseCase';
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

let useCase: ExportSessionAttendanceUseCase;

beforeEach(() => {
  useCase = new ExportSessionAttendanceUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('ExportSessionAttendanceUseCase', () => {
  describe('execute', () => {
    it('devrait retourner null si les données ne sont pas trouvées', async () => {
      mockRepo.getAttendanceForExport.mockResolvedValue(null);
      const result = await useCase.execute(1);
      expect(result).toBeNull();
    });

    it('devrait générer un CSV avec les données complètes', async () => {
      mockRepo.getAttendanceForExport.mockResolvedValue({
        session: { type_cours: 'Judo Enfants', date_cours: '2023-10-15', heure_debut: '14:00', heure_fin: '15:00' } as any,
        professeurs: ['Maitre Yoda', 'Obi-Wan'],
        inscriptions: [
          { nom_complet: 'Luke Skywalker', grade: 'Ceinture Blanche', present: true, commentaire: 'Super; Bien' },
          { nom_complet: 'Darth Vader', grade: 'Ceinture Noire', present: false, commentaire: null },
          { nom_complet: 'Chewbacca', grade: undefined, present: null, commentaire: '' }
        ] as any
      });

      const result = await useCase.execute(1);
      expect(result).not.toBeNull();
      expect(result!.filename).toBe('appel_judo_enfants_2023-10-15.csv');
      
      const csvLines = result!.csv.split('\r\n');
      expect(csvLines).toContain(`Feuille d'appel - Judo Enfants`);
      expect(csvLines).toContain(`Date;2023-10-15`);
      expect(csvLines).toContain(`Horaire;14:00 - 15:00`);
      expect(csvLines).toContain(`Professeur(s);Maitre Yoda, Obi-Wan`);
      expect(csvLines).toContain(`Nom complet;Grade;Présent;Commentaire`);
      expect(csvLines).toContain(`Luke Skywalker;Ceinture Blanche;Oui;Super, Bien`);
      expect(csvLines).toContain(`Darth Vader;Ceinture Noire;Non;`);
      expect(csvLines).toContain(`Chewbacca;;;`);
      expect(csvLines).toContain(`Total inscrits;3`);
      expect(csvLines).toContain(`Présents;1`);
      expect(csvLines).toContain(`Absents;1`);
    });

    it('devrait générer un CSV sans ligne professeurs s\'il n\'y en a pas', async () => {
      mockRepo.getAttendanceForExport.mockResolvedValue({
        session: { type_cours: 'Judo Libre', date_cours: '2023-10-16', heure_debut: '18:00', heure_fin: '20:00' } as any,
        professeurs: [],
        inscriptions: []
      });

      const result = await useCase.execute(2);
      expect(result).not.toBeNull();
      expect(result!.csv).not.toContain('Professeur(s);');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getAttendanceForExport.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
