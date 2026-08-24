/**
 * AnonymizeUserUseCase.test.ts
 * Tests unitaires — users / AnonymizeUserUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : users
 */

import { AnonymizeUserUseCase } from '../AnonymizeUserUseCase';
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

let useCase: AnonymizeUserUseCase;

beforeEach(() => {
  useCase = new AnonymizeUserUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('AnonymizeUserUseCase', () => {
  describe('execute', () => {
    it('devrait anonymiser l\'utilisateur si celui-ci est trouvé et soft-deleted', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, deleted_at: new Date() } as any);
      mockRepo.anonymize.mockResolvedValue();

      // Act
      await useCase.execute(1);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.anonymize).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Utilisateur introuvable');
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.anonymize).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l\'utilisateur n\'a pas de deleted_at', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, deleted_at: null } as any);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow("L'utilisateur doit d'abord être supprimé (soft delete) avant d'être anonymisé");
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.anonymize).not.toHaveBeenCalled();
    });

    it('devrait propager l\'erreur si le repository échoue (findById)', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait propager l\'erreur si le repository échoue (anonymize)', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, deleted_at: new Date() } as any);
      mockRepo.anonymize.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
