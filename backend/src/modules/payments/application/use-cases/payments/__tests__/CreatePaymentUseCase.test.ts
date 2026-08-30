/**
 * CreatePaymentUseCase.test.ts
 * Tests unitaires — payments / CreatePaymentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { CreatePaymentUseCase } from '../CreatePaymentUseCase';
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

let useCase: CreatePaymentUseCase;

beforeEach(() => {
  useCase = new CreatePaymentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreatePaymentUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner l\'id du paiement quand les données sont valides (sans date_paiement)', async () => {
      // Arrange
      const mockDate = new Date('2023-01-01T12:00:00Z');
      jest.useFakeTimers().setSystemTime(mockDate);
      mockRepo.create.mockResolvedValue(1);

      const input = {
        user_id: 1,
        montant: 100,
        methode_paiement_id: 1
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBe(1);
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...input,
        statut_id: 2,
        date_paiement: mockDate.toISOString()
      });
      jest.useRealTimers();
    });

    it('devrait utiliser la date fournie', async () => {
      // Arrange
      mockRepo.create.mockResolvedValue(2);
      const customDate = '2022-12-31T23:59:59.000Z';

      const input = {
        user_id: 2,
        montant: 50,
        methode_paiement_id: 2,
        date_paiement: customDate
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toBe(2);
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...input,
        statut_id: 2,
        date_paiement: customDate
      });
    });

    // ── Cas de validation ────────────────────────────────────────────────

    it('devrait lancer une erreur si user_id est manquant', async () => {
      const input: any = { montant: 100, methode_paiement_id: 1 };
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
    });

    it('devrait lancer une erreur si montant est manquant', async () => {
      const input: any = { user_id: 1, methode_paiement_id: 1 };
      await expect(useCase.execute(input)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    it('devrait lancer une erreur si montant est <= 0', async () => {
      const input: any = { user_id: 1, montant: 0, methode_paiement_id: 1 };
      await expect(useCase.execute(input)).rejects.toThrow("Le montant doit être supérieur à 0");
      
      const inputNegative: any = { user_id: 1, montant: -10, methode_paiement_id: 1 };
      await expect(useCase.execute(inputNegative)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    it('devrait lancer une erreur si methode_paiement_id est manquant', async () => {
      const input: any = { user_id: 1, montant: 100 };
      await expect(useCase.execute(input)).rejects.toThrow("La méthode de paiement est requise");
    });

    it('devrait lancer une erreur si methode_paiement_id est 3 (Stripe)', async () => {
      const input: any = { user_id: 1, montant: 100, methode_paiement_id: 3 };
      await expect(useCase.execute(input)).rejects.toThrow("Utilisez l'endpoint Stripe pour les paiements par carte bancaire");
    });

    // ── Cas d'erreur du repository ───────────────────────────────────────

    it('devrait propager l\'erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.create.mockRejectedValue(new Error('DB error'));

      const input = {
        user_id: 1,
        montant: 100,
        methode_paiement_id: 1
      };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });

  });
});
