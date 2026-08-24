/**
 * GetPricingPlanByIdUseCase.test.ts
 * Tests unitaires — payments / GetPricingPlanByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetPricingPlanByIdUseCase } from '../GetPricingPlanByIdUseCase';
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

let useCase: GetPricingPlanByIdUseCase;

beforeEach(() => {
  useCase = new GetPricingPlanByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('GetPricingPlanByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le plan si celui-ci existe', async () => {
      const plan = {
        id_plan: 1, nom: 'Plan', prix: 10, duree_mois: 12, is_active: true, created_at: new Date(), updated_at: new Date()
      };
      mockRepo.findById.mockResolvedValue(plan);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(plan);
    });

    it('devrait lancer une erreur si le plan est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow("Plan introuvable");
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
