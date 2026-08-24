/**
 * CreateProfessorUseCase.test.ts
 * Tests unitaires — courses / CreateProfessorUseCase
 */

import { CreateProfessorUseCase } from '../CreateProfessorUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import type { CreateProfessorDto } from "@clubmanager/types";

const mockRepo = {
  createProfessor: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: CreateProfessorUseCase;

beforeEach(() => {
  useCase = new CreateProfessorUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateProfessorUseCase', () => {
  describe('execute', () => {
    
    const validDto: CreateProfessorDto = {
      nom: 'Doe',
      prenom: 'John'
    };

    it('devrait créer un professeur avec succès', async () => {
      mockRepo.createProfessor.mockResolvedValue({ id: 1, ...validDto } as any);

      const result = await useCase.execute(validDto);

      expect(mockRepo.createProfessor).toHaveBeenCalledWith(validDto);
      expect(result).toHaveProperty('id', 1);
    });

    it('devrait lancer une erreur si le nom est manquant', async () => {
      const dto = { ...validDto, nom: '   ' };
      await expect(useCase.execute(dto)).rejects.toThrow("Le nom du professeur est obligatoire");

      const dto2 = { ...validDto, nom: undefined } as unknown as CreateProfessorDto;
      await expect(useCase.execute(dto2)).rejects.toThrow("Le nom du professeur est obligatoire");
    });

    it('devrait lancer une erreur si le prénom est manquant', async () => {
      const dto = { ...validDto, prenom: '   ' };
      await expect(useCase.execute(dto)).rejects.toThrow("Le prénom du professeur est obligatoire");

      const dto2 = { ...validDto, prenom: undefined } as unknown as CreateProfessorDto;
      await expect(useCase.execute(dto2)).rejects.toThrow("Le prénom du professeur est obligatoire");
    });

    it('devrait relayer l\'erreur si le repository échoue', async () => {
      mockRepo.createProfessor.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('DB error');
    });

  });
});
