/**
 * CreateStripePaymentIntentUseCase.test.ts
 * Tests unitaires — payments / CreateStripePaymentIntentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { CreateStripePaymentIntentUseCase } from '../CreateStripePaymentIntentUseCase';
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

let useCase: CreateStripePaymentIntentUseCase;

beforeEach(() => {
  useCase = new CreateStripePaymentIntentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreateStripePaymentIntentUseCase', () => {
  let mockStripeService: any;

  beforeEach(() => {
    mockStripeService = {
      createPaymentIntent: jest.fn()
    };
    useCase = new CreateStripePaymentIntentUseCase(mockRepo, mockStripeService);
  });

  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat et créer le paiement (sans plan_tarifaire ni description)', async () => {
      // Arrange
      mockStripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123'
      });
      mockRepo.create.mockResolvedValue(10);

      const input = {
        user_id: 5,
        montant: 20.50
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual({
        paymentId: 10,
        clientSecret: 'secret_123',
        paymentIntentId: 'pi_123'
      });

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        2050, // 20.50 * 100
        'eur',
        { user_id: '5', plan_tarifaire_id: '' }
      );

      expect(mockRepo.create).toHaveBeenCalledWith({
        user_id: 5,
        plan_tarifaire_id: null,
        montant: 20.50,
        methode_paiement_id: 1,
        statut_id: 1,
        description: null,
        stripe_payment_intent_id: 'pi_123'
      });
    });

    it('devrait retourner le résultat et créer le paiement (avec plan_tarifaire et description)', async () => {
      // Arrange
      mockStripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_456',
        client_secret: 'secret_456'
      });
      mockRepo.create.mockResolvedValue(11);

      const input = {
        user_id: 6,
        montant: 50,
        plan_tarifaire_id: 2,
        description: 'Abonnement annuel'
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        5000,
        'eur',
        { user_id: '6', plan_tarifaire_id: '2' }
      );

      expect(mockRepo.create).toHaveBeenCalledWith({
        user_id: 6,
        plan_tarifaire_id: 2,
        montant: 50,
        methode_paiement_id: 1,
        statut_id: 1,
        description: 'Abonnement annuel',
        stripe_payment_intent_id: 'pi_456'
      });
    });

    // ── Cas de validation ────────────────────────────────────────────────

    it('devrait lancer une erreur si user_id est manquant', async () => {
      const input: any = { montant: 100 };
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
    });

    it('devrait lancer une erreur si montant est manquant', async () => {
      const input: any = { user_id: 1 };
      await expect(useCase.execute(input)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    it('devrait lancer une erreur si montant est <= 0', async () => {
      const inputZero: any = { user_id: 1, montant: 0 };
      await expect(useCase.execute(inputZero)).rejects.toThrow("Le montant doit être supérieur à 0");
      
      const inputNeg: any = { user_id: 1, montant: -50 };
      await expect(useCase.execute(inputNeg)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    // ── Cas d'erreur Stripe et DB ────────────────────────────────────────

    it('devrait lancer une erreur si Stripe ne retourne pas de client_secret', async () => {
      mockStripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_789',
        client_secret: null
      });

      const input = { user_id: 1, montant: 10 };
      await expect(useCase.execute(input)).rejects.toThrow("Stripe n'a pas retourné de client_secret pour ce paiement");
    });

    it('devrait lancer une erreur si le stripeService échoue', async () => {
      mockStripeService.createPaymentIntent.mockRejectedValue(new Error('Stripe API error'));

      const input = { user_id: 1, montant: 10 };
      await expect(useCase.execute(input)).rejects.toThrow('Stripe API error');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockStripeService.createPaymentIntent.mockResolvedValue({
        id: 'pi_999',
        client_secret: 'sec_999'
      });
      mockRepo.create.mockRejectedValue(new Error('DB error'));

      const input = { user_id: 1, montant: 100 };

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });

  });
});
