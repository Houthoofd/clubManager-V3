/**
 * CreateInscriptionUseCase.test.ts
 * Tests unitaires — courses / CreateInscriptionUseCase
 */

import { CreateInscriptionUseCase } from '../CreateInscriptionUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import type { CreateInscriptionDto } from "@clubmanager/types";

const mockRepo = {
  createInscription: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: CreateInscriptionUseCase;

beforeEach(() => {
  useCase = new CreateInscriptionUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateInscriptionUseCase', () => {
  describe('execute', () => {
    
    const validDto: CreateInscriptionDto = {
      utilisateur_id: 1,
      cours_id: 2
    };

    it('devrait créer une inscription avec succès', async () => {
      mockRepo.createInscription.mockResolvedValue();

      await useCase.execute(validDto);

      expect(mockRepo.createInscription).toHaveBeenCalledWith(validDto);
    });

    it('devrait relayer l\'erreur si le repository échoue', async () => {
      mockRepo.createInscription.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(validDto)).rejects.toThrow('DB error');
    });

  });
});
