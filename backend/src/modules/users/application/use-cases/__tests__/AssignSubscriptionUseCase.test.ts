/**
 * AssignSubscriptionUseCase.test.ts
 * Tests unitaires — users / AssignSubscriptionUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : users
 */

import { AssignSubscriptionUseCase } from '../AssignSubscriptionUseCase';
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

let useCase: AssignSubscriptionUseCase;

beforeEach(() => {
  useCase = new AssignSubscriptionUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('AssignSubscriptionUseCase', () => {
  describe('execute', () => {
    it('devrait assigner un abonnement si l\'utilisateur existe', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1 } as any);
      mockRepo.updateSubscription.mockResolvedValue();

      // Act
      await useCase.execute(1, 100);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.updateSubscription).toHaveBeenCalledWith(1, 100);
    });

    it('devrait retirer un abonnement (null) si l\'utilisateur existe', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1 } as any);
      mockRepo.updateSubscription.mockResolvedValue();

      // Act
      await useCase.execute(1, null);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.updateSubscription).toHaveBeenCalledWith(1, null);
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1, 100)).rejects.toThrow('Utilisateur introuvable');
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.updateSubscription).not.toHaveBeenCalled();
    });

    it('devrait propager l\'erreur si le repository échoue (findById)', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1, 100)).rejects.toThrow('DB error');
    });

    it('devrait propager l\'erreur si le repository échoue (updateSubscription)', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1 } as any);
      mockRepo.updateSubscription.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1, 100)).rejects.toThrow('DB error');
    });
  });
});
