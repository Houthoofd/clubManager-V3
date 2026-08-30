/**
 * CreateCourseRecurrentUseCase.test.ts
 * Tests unitaires — courses / CreateCourseRecurrentUseCase
 */

import { CreateCourseRecurrentUseCase } from '../CreateCourseRecurrentUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import type { CreateCourseRecurrentDto } from "@clubmanager/types";

const mockRepo = {
  hasTimeConflict: jest.fn(),
  createCourseRecurrent: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: CreateCourseRecurrentUseCase;

beforeEach(() => {
  useCase = new CreateCourseRecurrentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateCourseRecurrentUseCase', () => {
  describe('execute', () => {
    
    const validDto: CreateCourseRecurrentDto = {
      type_cours: 'Judo',
      jour_semaine: 3, // Mercredi
      heure_debut: '14:00:00',
      heure_fin: '16:00:00'
    };

    it('devrait créer un cours avec succès', async () => {
      mockRepo.hasTimeConflict.mockResolvedValue(null);
      mockRepo.createCourseRecurrent.mockResolvedValue({ id: 1, ...validDto } as any);

      const result = await useCase.execute(validDto);

      expect(mockRepo.hasTimeConflict).toHaveBeenCalledWith(3, '14:00:00', '16:00:00');
      expect(mockRepo.createCourseRecurrent).toHaveBeenCalledWith(validDto);
      expect(result).toHaveProperty('id', 1);
    });

    it('devrait lancer une erreur si le type_cours est vide ou manquant', async () => {
      const dto = { ...validDto, type_cours: '   ' };
      await expect(useCase.execute(dto)).rejects.toThrow("Le type de cours est obligatoire");

      const dto2 = { ...validDto, type_cours: undefined } as unknown as CreateCourseRecurrentDto;
      await expect(useCase.execute(dto2)).rejects.toThrow("Le type de cours est obligatoire");
    });

    it('devrait lancer une erreur si le jour_semaine est invalide', async () => {
      const dto = { ...validDto, jour_semaine: 8 };
      await expect(useCase.execute(dto)).rejects.toThrow("Le jour de la semaine doit être un entier entre 1 (Lundi) et 7 (Dimanche)");

      const dto2 = { ...validDto, jour_semaine: 0 };
      await expect(useCase.execute(dto2)).rejects.toThrow("Le jour de la semaine doit être un entier entre 1 (Lundi) et 7 (Dimanche)");

      const dto3 = { ...validDto, jour_semaine: 3.5 };
      await expect(useCase.execute(dto3)).rejects.toThrow("Le jour de la semaine doit être un entier entre 1 (Lundi) et 7 (Dimanche)");
      
      const dto4 = { ...validDto, jour_semaine: undefined } as unknown as CreateCourseRecurrentDto;
      await expect(useCase.execute(dto4)).rejects.toThrow("Le jour de la semaine doit être un entier entre 1 (Lundi) et 7 (Dimanche)");
    });

    it('devrait lancer une erreur si l\'heure_debut ou l\'heure_fin est manquante', async () => {
      const dto = { ...validDto, heure_debut: undefined } as unknown as CreateCourseRecurrentDto;
      await expect(useCase.execute(dto)).rejects.toThrow("L'heure de début et l'heure de fin sont obligatoires");

      const dto2 = { ...validDto, heure_fin: undefined } as unknown as CreateCourseRecurrentDto;
      await expect(useCase.execute(dto2)).rejects.toThrow("L'heure de début et l'heure de fin sont obligatoires");
    });

    it('devrait lancer une erreur si l\'heure_fin n\'est pas postérieure à l\'heure_debut', async () => {
      const dto = { ...validDto, heure_debut: '16:00:00', heure_fin: '14:00:00' };
      await expect(useCase.execute(dto)).rejects.toThrow("L'heure de fin doit être postérieure à l'heure de début");

      const dto2 = { ...validDto, heure_debut: '14:00:00', heure_fin: '14:00:00' };
      await expect(useCase.execute(dto2)).rejects.toThrow("L'heure de fin doit être postérieure à l'heure de début");
    });

    it('devrait lancer une erreur s\'il y a un conflit de créneau', async () => {
      mockRepo.hasTimeConflict.mockResolvedValue({
        type_cours: 'Karaté',
        heure_debut: '14:00:00',
        heure_fin: '16:00:00'
      } as any);

      await expect(useCase.execute(validDto)).rejects.toThrow('Ce créneau est déjà occupé par le cours "Karaté" (14:00–16:00)');
    });

    it('devrait relayer l\'erreur si le repository échoue', async () => {
      mockRepo.hasTimeConflict.mockResolvedValue(null);
      mockRepo.createCourseRecurrent.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('DB error');
    });

  });
});
