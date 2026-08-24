/**
 * GetDeletedUsersUseCase.test.ts
 * Tests unitaires — users / GetDeletedUsersUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : users
 */

import { GetDeletedUsersUseCase } from '../GetDeletedUsersUseCase';
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

let useCase: GetDeletedUsersUseCase;

beforeEach(() => {
  useCase = new GetDeletedUsersUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetDeletedUsersUseCase', () => {
  describe('execute', () => {
    it('devrait retourner la liste des utilisateurs supprimés', async () => {
      // Arrange
      const mockDeletedUsers = [{ id: 1 }, { id: 2 }];
      mockRepo.findDeleted.mockResolvedValue(mockDeletedUsers as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepo.findDeleted).toHaveBeenCalled();
      expect(result).toEqual(mockDeletedUsers);
    });

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findDeleted.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('DB error');
    });
  });
});
