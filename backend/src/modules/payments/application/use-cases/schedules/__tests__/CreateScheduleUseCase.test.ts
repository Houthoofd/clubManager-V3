/**
 * CreateScheduleUseCase.test.ts
 * Tests unitaires — payments / CreateScheduleUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { CreateScheduleUseCase } from '../CreateScheduleUseCase';
import type { IPaymentScheduleRepository } from '../../../../domain/repositories/IPaymentScheduleRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IPaymentScheduleRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  findByUserId:   jest.fn(),
  findOverdue:    jest.fn(),
  markAsPaid:     jest.fn(),
  updateStatut:   jest.fn(),
  create:         jest.fn(),
  delete:         jest.fn(),
} as jest.Mocked<IPaymentScheduleRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: CreateScheduleUseCase;

beforeEach(() => {
  useCase = new CreateScheduleUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreateScheduleUseCase', () => {
  describe('execute', () => {
    it('devrait retourner l\'ID quand les données sont valides', async () => {
      mockRepo.create.mockResolvedValue(42);

      const dto = {
        user_id: 1,
        plan_tarifaire_id: 2,
        montant: 50,
        date_echeance: '2025-10-10'
      };

      const result = await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        user_id: 1,
        plan_tarifaire_id: 2,
        montant: 50,
        date_echeance: '2025-10-10',
        statut: 'en_attente',
      });
      expect(result).toBe(42);
    });

    it('devrait utiliser null pour plan_tarifaire_id si manquant', async () => {
      mockRepo.create.mockResolvedValue(43);

      const dto = {
        user_id: 1,
        montant: 50,
        date_echeance: '2025-10-10'
      };

      const result = await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        plan_tarifaire_id: null
      }));
      expect(result).toBe(43);
    });

    it('devrait lancer une erreur si user_id manque', async () => {
      const dto = { montant: 50, date_echeance: '2025-10-10' } as any;
      await expect(useCase.execute(dto)).rejects.toThrow("L'ID utilisateur est requis");
    });

    it('devrait lancer une erreur si montant manque', async () => {
      const dto = { user_id: 1, date_echeance: '2025-10-10' } as any;
      await expect(useCase.execute(dto)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    it('devrait lancer une erreur si montant <= 0', async () => {
      const dto = { user_id: 1, montant: 0, date_echeance: '2025-10-10' } as any;
      await expect(useCase.execute(dto)).rejects.toThrow("Le montant doit être supérieur à 0");
    });

    it('devrait lancer une erreur si date_echeance manque', async () => {
      const dto = { user_id: 1, montant: 50 } as any;
      await expect(useCase.execute(dto)).rejects.toThrow("La date d'échéance est requise");
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.create.mockRejectedValue(new Error('DB error'));
      const dto = { user_id: 1, montant: 50, date_echeance: '2025-10-10' };
      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });
  });
});
