/**
 * CreateCourseUseCase.test.ts
 * Tests unitaires — courses / CreateCourseUseCase
 */

import { CreateCourseUseCase } from '../CreateCourseUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import type { CreateCourseDto } from "@clubmanager/types";

const mockRepo = {
  createCourse: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: CreateCourseUseCase;

beforeEach(() => {
  useCase = new CreateCourseUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateCourseUseCase', () => {
  describe('execute', () => {
    
    const validDto: CreateCourseDto = {
      date_cours: '2023-10-10',
      type_cours: 'Judo',
      heure_debut: '14:00',
      heure_fin: '16:00'
    };

    it('devrait créer un cours avec succès', async () => {
      mockRepo.createCourse.mockResolvedValue({ id: 1, ...validDto } as any);

      const result = await useCase.execute(validDto);

      expect(mockRepo.createCourse).toHaveBeenCalledWith(validDto);
      expect(result).toHaveProperty('id', 1);
    });

    it('devrait relayer l\'erreur si le repository échoue', async () => {
      mockRepo.createCourse.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('DB error');
    });

  });
});
