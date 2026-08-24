/**
 * GetRecoveryRequestsUseCase.test.ts
 * Tests unitaires — recovery / GetRecoveryRequestsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : recovery
 */

import { GetRecoveryRequestsUseCase } from '../GetRecoveryRequestsUseCase';
import type { IRecoveryRepository } from '../../../domain/repositories/IRecoveryRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IRecoveryRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  updateStatus:   jest.fn(),
  create:         jest.fn(),
} as jest.Mocked<IRecoveryRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: GetRecoveryRequestsUseCase;

beforeEach(() => {
  useCase = new GetRecoveryRequestsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('GetRecoveryRequestsUseCase', () => {
  describe('execute', () => {

    it('should use default page and limit when not provided', async () => {
      const mockResult = { items: [], total: 0, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(mockResult);
      
      const result = await useCase.execute({});
      
      expect(result).toEqual(mockResult);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should limit page to a minimum of 1', async () => {
      const mockResult = { items: [], total: 0, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(mockResult);
      
      await useCase.execute({ page: 0 });
      
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });

    it('should limit limit to a minimum of 1', async () => {
      const mockResult = { items: [], total: 0, page: 1, limit: 1 };
      mockRepo.findAll.mockResolvedValue(mockResult);
      
      await useCase.execute({ limit: 0 });
      
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });
    });

    it('should limit limit to a maximum of 100', async () => {
      const mockResult = { items: [], total: 0, page: 1, limit: 100 };
      mockRepo.findAll.mockResolvedValue(mockResult);
      
      await useCase.execute({ limit: 150 });
      
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });

    it('should pass correct values when within bounds', async () => {
      const mockResult = { items: [], total: 0, page: 2, limit: 50 };
      mockRepo.findAll.mockResolvedValue(mockResult);
      
      await useCase.execute({ page: 2, limit: 50, status: 'pending' });
      
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 50, status: 'pending' });
    });

    it('should propagate repository errors', async () => {
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));
      
      await expect(useCase.execute({})).rejects.toThrow('DB error');
    });

  });
});
