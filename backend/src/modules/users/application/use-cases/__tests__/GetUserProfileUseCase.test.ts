/**
 * GetUserProfileUseCase.test.ts
 * Tests unitaires — users / GetUserProfileUseCase
 */

import { GetUserProfileUseCase } from '../GetUserProfileUseCase';
import type { IUserRepository, UserProfileDto } from '../../../domain/repositories/IUserRepository';

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

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    useCase = new GetUserProfileUseCase(mockRepo);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner le profil quand l\'utilisateur existe', async () => {
      const mockProfile = { id: 1, email: 'test@test.com' } as UserProfileDto;
      mockRepo.findProfile.mockResolvedValue(mockProfile);

      const result = await useCase.execute(1);

      expect(mockRepo.findProfile).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProfile);
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      mockRepo.findProfile.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow('Utilisateur introuvable');
      expect(mockRepo.findProfile).toHaveBeenCalledWith(999);
    });
  });
});
