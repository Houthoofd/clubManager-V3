/**
 * GetOverdueSchedulesUseCase.test.ts
 * Tests unitaires — payments / GetOverdueSchedulesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetOverdueSchedulesUseCase } from '../GetOverdueSchedulesUseCase';
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

let useCase: GetOverdueSchedulesUseCase;

beforeEach(() => {
  useCase = new GetOverdueSchedulesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetOverdueSchedulesUseCase', () => {
  describe('execute', () => {
    it('devrait retourner la liste des échéances en retard', async () => {
      const mockResult = [{ id: 1 }, { id: 2 }];
      mockRepo.findOverdue.mockResolvedValue(mockResult as any);

      const result = await useCase.execute();

      expect(mockRepo.findOverdue).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findOverdue.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute()).rejects.toThrow('DB error');
    });
  });
});
