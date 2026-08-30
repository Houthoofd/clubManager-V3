/**
 * GetUserSchedulesUseCase.test.ts
 * Tests unitaires — payments / GetUserSchedulesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetUserSchedulesUseCase } from '../GetUserSchedulesUseCase';
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

let useCase: GetUserSchedulesUseCase;

beforeEach(() => {
  useCase = new GetUserSchedulesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUserSchedulesUseCase', () => {
  describe('execute', () => {
    it('devrait retourner les échéances d\'un utilisateur', async () => {
      const mockResult = [{ id: 1 }, { id: 2 }];
      mockRepo.findByUserId.mockResolvedValue(mockResult as any);

      const result = await useCase.execute(42);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith(42);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findByUserId.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(42)).rejects.toThrow('DB error');
    });
  });
});
