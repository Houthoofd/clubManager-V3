/**
 * RefundPaymentUseCase.test.ts
 * Tests unitaires — payments / RefundPaymentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { RefundPaymentUseCase } from '../RefundPaymentUseCase';
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

let useCase: RefundPaymentUseCase;

beforeEach(() => {
  useCase = new RefundPaymentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('RefundPaymentUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait rembourser le paiement avec succès', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, statut_id: 2 } as any);
      mockRepo.refund.mockResolvedValue();

      // Act
      await useCase.execute(1);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.refund).toHaveBeenCalledWith(1);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le paiement n\'existe pas', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(99)).rejects.toThrow('Paiement introuvable');
      expect(mockRepo.refund).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le paiement est déjà remboursé (statut 4)', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, statut_id: 4 } as any);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Ce paiement est déjà remboursé');
      expect(mockRepo.refund).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le paiement a échoué (statut 3)', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, statut_id: 3 } as any);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Impossible de rembourser un paiement échoué');
      expect(mockRepo.refund).not.toHaveBeenCalled();
    });

    it('devrait propager l\'erreur si la recherche échoue', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error on find'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error on find');
    });

    it('devrait propager l\'erreur si le remboursement échoue', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 1, statut_id: 2 } as any);
      mockRepo.refund.mockRejectedValue(new Error('DB error on refund'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error on refund');
    });

  });
});
