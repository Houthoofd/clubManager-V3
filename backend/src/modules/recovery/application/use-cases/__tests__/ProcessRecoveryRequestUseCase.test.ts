/**
 * ProcessRecoveryRequestUseCase.test.ts
 * Tests unitaires — recovery / ProcessRecoveryRequestUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : recovery
 */

import { ProcessRecoveryRequestUseCase } from '../ProcessRecoveryRequestUseCase';
import type { IRecoveryRepository } from '../../../domain/repositories/IRecoveryRepository';
import type { ProcessRecoveryDto } from '../../../domain/types';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IRecoveryRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  updateStatus:   jest.fn(),
  create:         jest.fn(),
} as jest.Mocked<IRecoveryRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: ProcessRecoveryRequestUseCase;

beforeEach(() => {
  useCase = new ProcessRecoveryRequestUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('ProcessRecoveryRequestUseCase', () => {
  describe('execute', () => {

    it('should update status when request exists and is pending', async () => {
      const dto: ProcessRecoveryDto = { id: 1, status: 'approved' };
      mockRepo.findById.mockResolvedValue({ id: 1, email: 'a@a.com', reason: 'reason12345', status: 'pending', ip_address: '1.1.1.1', created_at: new Date() });
      mockRepo.updateStatus.mockResolvedValue();
      
      await useCase.execute(dto);
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'approved');
    });

    it('should throw an error if request is not found', async () => {
      const dto: ProcessRecoveryDto = { id: 999, status: 'approved' };
      mockRepo.findById.mockResolvedValue(null);
      
      await expect(useCase.execute(dto)).rejects.toThrow('Demande introuvable');
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw an error if request is already approved', async () => {
      const dto: ProcessRecoveryDto = { id: 1, status: 'rejected' };
      mockRepo.findById.mockResolvedValue({ id: 1, email: 'a@a.com', reason: 'reason12345', status: 'approved', ip_address: '1.1.1.1', created_at: new Date() });
      
      await expect(useCase.execute(dto)).rejects.toThrow('Cette demande a déjà été traitée');
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw an error if request is already rejected', async () => {
      const dto: ProcessRecoveryDto = { id: 1, status: 'approved' };
      mockRepo.findById.mockResolvedValue({ id: 1, email: 'a@a.com', reason: 'reason12345', status: 'rejected', ip_address: '1.1.1.1', created_at: new Date() });
      
      await expect(useCase.execute(dto)).rejects.toThrow('Cette demande a déjà été traitée');
      expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    });

    it('should propagate error if findById fails', async () => {
      const dto: ProcessRecoveryDto = { id: 1, status: 'approved' };
      mockRepo.findById.mockRejectedValue(new Error('DB error on find'));
      
      await expect(useCase.execute(dto)).rejects.toThrow('DB error on find');
    });

    it('should propagate error if updateStatus fails', async () => {
      const dto: ProcessRecoveryDto = { id: 1, status: 'approved' };
      mockRepo.findById.mockResolvedValue({ id: 1, email: 'a@a.com', reason: 'reason12345', status: 'pending', ip_address: '1.1.1.1', created_at: new Date() });
      mockRepo.updateStatus.mockRejectedValue(new Error('DB error on update'));
      
      await expect(useCase.execute(dto)).rejects.toThrow('DB error on update');
    });

  });
});
