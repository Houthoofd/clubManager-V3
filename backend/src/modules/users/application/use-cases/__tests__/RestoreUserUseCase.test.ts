/**
 * RestoreUserUseCase.test.ts
 * Tests unitaires — users / RestoreUserUseCase
 */

import { RestoreUserUseCase } from '../RestoreUserUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findProfile: jest.fn(),
  updateRole: jest.fn(),
  updateStatus: jest.fn(),
  updateLanguage: jest.fn(),
  updateProfile: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findDeleted: jest.fn(),
  anonymize: jest.fn(),
  updateSubscription: jest.fn(),
} as jest.Mocked<IUserRepository>;

describe('RestoreUserUseCase', () => {
  let useCase: RestoreUserUseCase;

  beforeEach(() => {
    useCase = new RestoreUserUseCase(mockRepo);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait restaurer l\'utilisateur s\'il existe', async () => {
      mockRepo.findById.mockResolvedValue({ id: 1 } as any);
      mockRepo.restore.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.restore).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow('Utilisateur introuvable');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
      expect(mockRepo.restore).not.toHaveBeenCalled();
    });
  });
});
