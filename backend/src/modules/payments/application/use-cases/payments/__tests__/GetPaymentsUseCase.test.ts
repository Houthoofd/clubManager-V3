/**
 * GetPaymentsUseCase.test.ts
 * Tests unitaires — payments / GetPaymentsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetPaymentsUseCase } from '../GetPaymentsUseCase';
import type { IPaymentRepository } from '../../../../domain/repositories/IPaymentRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IPaymentRepository> = {
  findAll:                jest.fn(),
  findById:               jest.fn(),
  findByUserId:           jest.fn(),
  findByStripeIntentId:   jest.fn(),
  create:                 jest.fn(),
  updateStatus:           jest.fn(),
  updateStripeIntent:     jest.fn(),
  refund:                 jest.fn(),
} as jest.Mocked<IPaymentRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetPaymentsUseCase;

beforeEach(() => {
  useCase = new GetPaymentsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetPaymentsUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner la liste paginée avec les valeurs par défaut', async () => {
      // Arrange
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(mockResult);

      const query = {};

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('devrait respecter les valeurs de page et limit fournies', async () => {
      // Arrange
      const mockResult = { data: [{ id: 1 }], total: 1, page: 2, limit: 10 } as any;
      mockRepo.findAll.mockResolvedValue(mockResult);

      const query = { page: 2, limit: 10, user_id: 5 };

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ user_id: 5, page: 2, limit: 10 });
    });

    it('devrait forcer la page à 1 si page < 1', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

      // Act
      await useCase.execute({ page: 0 });

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('devrait forcer la limit entre 1 et 100', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 100 });

      // Act limit < 1
      await useCase.execute({ limit: 0 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });

      // Act limit > 100
      await useCase.execute({ limit: 150 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow('DB error');
    });

  });
});
