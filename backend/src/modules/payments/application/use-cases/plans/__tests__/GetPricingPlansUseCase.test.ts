/**
 * GetPricingPlansUseCase.test.ts
 * Tests unitaires — payments / GetPricingPlansUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { GetPricingPlansUseCase } from '../GetPricingPlansUseCase';
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

let useCase: GetPricingPlansUseCase;

beforeEach(() => {
  useCase = new GetPricingPlansUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetPricingPlansUseCase', () => {
  describe('execute', () => {
    it('devrait retourner tous les plans (sans filtre)', async () => {
      const plans = [{ id_plan: 1, nom: 'Plan 1' }, { id_plan: 2, nom: 'Plan 2' }];
      mockRepo.findAll.mockResolvedValue(plans as any);

      const result = await useCase.execute();

      expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(plans);
    });

    it('devrait retourner les plans actifs (avec filtre actif=true)', async () => {
      const plans = [{ id_plan: 1, nom: 'Plan 1' }];
      mockRepo.findAll.mockResolvedValue(plans as any);

      const result = await useCase.execute(true);

      expect(mockRepo.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual(plans);
    });

    it('devrait retourner les plans inactifs (avec filtre actif=false)', async () => {
      const plans = [{ id_plan: 2, nom: 'Plan 2' }];
      mockRepo.findAll.mockResolvedValue(plans as any);

      const result = await useCase.execute(false);

      expect(mockRepo.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual(plans);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute()).rejects.toThrow('DB error');
    });
  });
});
