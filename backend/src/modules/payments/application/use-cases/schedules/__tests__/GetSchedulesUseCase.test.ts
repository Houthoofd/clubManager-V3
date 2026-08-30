/**
 * GetSchedulesUseCase.test.ts
 * Tests unitaires — payments / GetSchedulesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetSchedulesUseCase } from '../GetSchedulesUseCase';
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

let useCase: GetSchedulesUseCase;

beforeEach(() => {
  useCase = new GetSchedulesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetSchedulesUseCase', () => {
  describe('execute', () => {
    it('devrait retourner les échéances avec les valeurs par défaut de pagination', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(mockResult as any);

      const result = await useCase.execute({});

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result).toEqual(mockResult);
    });

    it('devrait retourner les échéances avec la pagination demandée', async () => {
      const mockResult = { data: [{ id: 1 }], total: 1, page: 2, limit: 10 };
      mockRepo.findAll.mockResolvedValue(mockResult as any);

      const result = await useCase.execute({ page: 2, limit: 10 });

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 10 });
      expect(result).toEqual(mockResult);
    });

    it('devrait limiter page à un minimum de 1', async () => {
      mockRepo.findAll.mockResolvedValue({} as any);
      await useCase.execute({ page: 0, limit: 10 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('devrait limiter limit à un minimum de 1 et maximum de 100', async () => {
      mockRepo.findAll.mockResolvedValue({} as any);
      
      await useCase.execute({ limit: 0 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });

      await useCase.execute({ limit: 200 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute({})).rejects.toThrow('DB error');
    });
  });
});
