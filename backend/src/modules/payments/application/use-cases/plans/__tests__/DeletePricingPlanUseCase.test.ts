/**
 * DeletePricingPlanUseCase.test.ts
 * Tests unitaires — payments / DeletePricingPlanUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { DeletePricingPlanUseCase } from '../DeletePricingPlanUseCase';
import type { IPricingPlanRepository } from '../../../../domain/repositories/IPricingPlanRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IPricingPlanRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  create:         jest.fn(),
  update:         jest.fn(),
  toggleActive:   jest.fn(),
  delete:         jest.fn(),
} as jest.Mocked<IPricingPlanRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: DeletePricingPlanUseCase;

beforeEach(() => {
  useCase = new DeletePricingPlanUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('DeletePricingPlanUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer le plan si celui-ci existe', async () => {
      mockRepo.findById.mockResolvedValue({
        id_plan: 1, nom: 'Plan', prix: 10, duree_mois: 12, is_active: true, created_at: new Date(), updated_at: new Date()
      });
      mockRepo.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si le plan est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow("Plan introuvable");
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue (findById)', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue (delete)', async () => {
      mockRepo.findById.mockResolvedValue({
        id_plan: 1, nom: 'Plan', prix: 10, duree_mois: 12, is_active: true, created_at: new Date(), updated_at: new Date()
      });
      mockRepo.delete.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
