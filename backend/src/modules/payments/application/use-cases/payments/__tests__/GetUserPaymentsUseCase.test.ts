/**
 * GetUserPaymentsUseCase.test.ts
 * Tests unitaires — payments / GetUserPaymentsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetUserPaymentsUseCase } from '../GetUserPaymentsUseCase';
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

let useCase: GetUserPaymentsUseCase;

beforeEach(() => {
  useCase = new GetUserPaymentsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUserPaymentsUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner la liste des paiements de l\'utilisateur', async () => {
      // Arrange
      const mockPayments = [{ id: 1, user_id: 5 }, { id: 2, user_id: 5 }] as any[];
      mockRepo.findByUserId.mockResolvedValue(mockPayments);

      // Act
      const result = await useCase.execute(5);

      // Assert
      expect(result).toEqual(mockPayments);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith(5);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findByUserId.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(5)).rejects.toThrow('DB error');
    });

  });
});
