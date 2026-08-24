/**
 * GetUserByIdUseCase.test.ts
 * Tests unitaires — users / GetUserByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : users
 */

import { GetUserByIdUseCase } from '../GetUserByIdUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll:              jest.fn(),
  findById:             jest.fn(),
  findProfile:          jest.fn(),
  updateRole:           jest.fn(),
  updateStatus:         jest.fn(),
  updateLanguage:       jest.fn(),
  updateProfile:        jest.fn(),
  softDelete:           jest.fn(),
  restore:              jest.fn(),
  findDeleted:          jest.fn(),
  anonymize:            jest.fn(),
  updateSubscription:   jest.fn(),
} as jest.Mocked<IUserRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetUserByIdUseCase;

beforeEach(() => {
  useCase = new GetUserByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUserByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner l\'utilisateur s\'il est trouvé', async () => {
      // Arrange
      const mockUser = { id: 1, nom: 'Doe' };
      mockRepo.findById.mockResolvedValue(mockUser as any);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Utilisateur introuvable');
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
