/**
 * DeleteScheduleUseCase.test.ts
 * Tests unitaires — payments / DeleteScheduleUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { DeleteScheduleUseCase } from '../DeleteScheduleUseCase';
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

let useCase: DeleteScheduleUseCase;

beforeEach(() => {
  useCase = new DeleteScheduleUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteScheduleUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer l\'échéance si elle n\'est pas payée', async () => {
      mockRepo.findById.mockResolvedValue({ id: 1, statut: 'en_attente' } as any);
      mockRepo.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si l\'échéance n\'existe pas', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(99)).rejects.toThrow('Échéance introuvable');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l\'échéance est déjà payée', async () => {
      mockRepo.findById.mockResolvedValue({ id: 2, statut: 'paye' } as any);

      await expect(useCase.execute(2)).rejects.toThrow('Impossible de supprimer une échéance déjà payée');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors du fetch', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue lors de la suppression', async () => {
      mockRepo.findById.mockResolvedValue({ id: 1, statut: 'en_attente' } as any);
      mockRepo.delete.mockRejectedValue(new Error('DB delete error'));
      
      await expect(useCase.execute(1)).rejects.toThrow('DB delete error');
    });
  });
});
