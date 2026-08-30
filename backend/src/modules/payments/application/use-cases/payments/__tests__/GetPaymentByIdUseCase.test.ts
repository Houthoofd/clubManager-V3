/**
 * GetPaymentByIdUseCase.test.ts
 * Tests unitaires — payments / GetPaymentByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetPaymentByIdUseCase } from '../GetPaymentByIdUseCase';
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

let useCase: GetPaymentByIdUseCase;

beforeEach(() => {
  useCase = new GetPaymentByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetPaymentByIdUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le paiement quand il existe', async () => {
      // Arrange
      const mockPayment = { id: 1, montant: 100 } as any;
      mockRepo.findById.mockResolvedValue(mockPayment);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(result).toEqual(mockPayment);
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le paiement n\'est pas trouvé', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(999)).rejects.toThrow('Paiement introuvable');
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
    });

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

  });
});
