/**
 * MarkScheduleAsPaidUseCase.test.ts
 * Tests unitaires — payments / MarkScheduleAsPaidUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { MarkScheduleAsPaidUseCase } from '../MarkScheduleAsPaidUseCase';
import type { IPaymentScheduleRepository } from '../../../../domain/repositories/IPaymentScheduleRepository';
import type { IPaymentRepository } from '../../../../domain/repositories/IPaymentRepository';

// ─── Mock Repositories ────────────────────────────────────────────

const mockScheduleRepo: jest.Mocked<IPaymentScheduleRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  findByUserId:   jest.fn(),
  findOverdue:    jest.fn(),
  markAsPaid:     jest.fn(),
  updateStatut:   jest.fn(),
  create:         jest.fn(),
  delete:         jest.fn(),
} as jest.Mocked<IPaymentScheduleRepository>;

const mockPaymentRepo: jest.Mocked<IPaymentRepository> = {
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

let useCase: MarkScheduleAsPaidUseCase;

beforeEach(() => {
  useCase = new MarkScheduleAsPaidUseCase(mockScheduleRepo, mockPaymentRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('MarkScheduleAsPaidUseCase', () => {
  describe('execute', () => {
    it('devrait marquer l\'échéance comme payée avec un paiement existant', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ id: 1, statut: 'en_attente' } as any);
      mockScheduleRepo.markAsPaid.mockResolvedValue(undefined);

      await useCase.execute(1, 99);

      expect(mockScheduleRepo.findById).toHaveBeenCalledWith(1);
      expect(mockScheduleRepo.markAsPaid).toHaveBeenCalledWith(1, 99);
      expect(mockPaymentRepo.create).not.toHaveBeenCalled();
    });

    it('devrait créer un paiement et marquer l\'échéance comme payée s\'il n\'y a pas de paiementId', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ 
        id: 1, 
        statut: 'en_attente', 
        user_id: 2, 
        plan_tarifaire_id: 3, 
        montant: 100 
      } as any);
      
      mockPaymentRepo.create.mockResolvedValue(100);
      mockScheduleRepo.markAsPaid.mockResolvedValue(undefined);

      // Fix system clock for date_paiement comparison
      const mockDate = new Date('2025-01-01T12:00:00Z');
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      await useCase.execute(1);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith({
        user_id: 2,
        plan_tarifaire_id: 3,
        montant: 100,
        methode_paiement_id: 1,
        statut_id: 2,
        description: "Règlement automatique de l'échéance #1",
        date_paiement: mockDate.toISOString().slice(0, 19).replace("T", " ")
      });
      expect(mockScheduleRepo.markAsPaid).toHaveBeenCalledWith(1, 100);
      
      spy.mockRestore();
    });

    it('devrait utiliser null pour plan_tarifaire_id si manquant lors de la création du paiement', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ 
        id: 1, 
        statut: 'en_attente', 
        user_id: 2, 
        montant: 100 
      } as any);
      
      mockPaymentRepo.create.mockResolvedValue(101);

      await useCase.execute(1);

      expect(mockPaymentRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        plan_tarifaire_id: null
      }));
    });

    it('devrait lancer une erreur si l\'échéance n\'existe pas', async () => {
      mockScheduleRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute(99)).rejects.toThrow('Échéance introuvable');
    });

    it('devrait lancer une erreur si l\'échéance est déjà payée', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ id: 1, statut: 'paye' } as any);
      await expect(useCase.execute(1)).rejects.toThrow('Cette échéance est déjà marquée comme payée');
    });

    it('devrait lancer une erreur si l\'échéance est annulée', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ id: 1, statut: 'annule' } as any);
      await expect(useCase.execute(1)).rejects.toThrow('Impossible de marquer une échéance annulée comme payée');
    });

    it('devrait lancer une erreur si la création de paiement échoue', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ id: 1, statut: 'en_attente' } as any);
      mockPaymentRepo.create.mockRejectedValue(new Error('Payment DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('Payment DB error');
    });

    it('devrait lancer une erreur si markAsPaid échoue', async () => {
      mockScheduleRepo.findById.mockResolvedValue({ id: 1, statut: 'en_attente' } as any);
      mockScheduleRepo.markAsPaid.mockRejectedValue(new Error('Schedule DB error'));
      await expect(useCase.execute(1, 99)).rejects.toThrow('Schedule DB error');
    });
  });
});
