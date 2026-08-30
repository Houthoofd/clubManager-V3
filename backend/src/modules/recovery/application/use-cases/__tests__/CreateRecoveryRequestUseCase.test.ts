/**
 * CreateRecoveryRequestUseCase.test.ts
 * Tests unitaires — recovery / CreateRecoveryRequestUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : recovery
 */

import { CreateRecoveryRequestUseCase } from '../CreateRecoveryRequestUseCase';
import type { IRecoveryRepository } from '../../../domain/repositories/IRecoveryRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IRecoveryRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  updateStatus:   jest.fn(),
  create:         jest.fn(),
} as jest.Mocked<IRecoveryRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: CreateRecoveryRequestUseCase;

beforeEach(() => {
  useCase = new CreateRecoveryRequestUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('CreateRecoveryRequestUseCase', () => {
  describe('execute', () => {

    it('should create a recovery request when inputs are valid', async () => {
      const dto = { email: 'test@example.com', reason: 'J ai perdu mon accès', ip_address: '127.0.0.1' };
      mockRepo.create.mockResolvedValue(undefined);
      
      await useCase.execute(dto);
      
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if email is missing', async () => {
      const dto = { email: '', reason: 'J ai perdu mon accès', ip_address: '127.0.0.1' };
      
      await expect(useCase.execute(dto)).rejects.toThrow('Adresse email invalide');
    });

    it('should throw an error if email does not contain @', async () => {
      const dto = { email: 'testexample.com', reason: 'J ai perdu mon accès', ip_address: '127.0.0.1' };
      
      await expect(useCase.execute(dto)).rejects.toThrow('Adresse email invalide');
    });

    it('should throw an error if reason is missing', async () => {
      const dto = { email: 'test@example.com', reason: '', ip_address: '127.0.0.1' };
      
      await expect(useCase.execute(dto)).rejects.toThrow('La raison doit contenir au moins 10 caractères');
    });

    it('should throw an error if reason length is less than 10', async () => {
      const dto = { email: 'test@example.com', reason: 'tropcourt', ip_address: '127.0.0.1' };
      
      await expect(useCase.execute(dto)).rejects.toThrow('La raison doit contenir au moins 10 caractères');
    });

    it('should propagate repository errors', async () => {
      const dto = { email: 'test@example.com', reason: 'J ai perdu mon accès', ip_address: '127.0.0.1' };
      mockRepo.create.mockRejectedValue(new Error('DB error'));
      
      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });

  });
});
