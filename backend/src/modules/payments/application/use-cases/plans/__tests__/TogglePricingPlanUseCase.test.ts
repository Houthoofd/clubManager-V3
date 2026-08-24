/**
 * TogglePricingPlanUseCase.test.ts
 * Tests unitaires — payments / TogglePricingPlanUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { TogglePricingPlanUseCase } from '../TogglePricingPlanUseCase';
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

let useCase: TogglePricingPlanUseCase;

beforeEach(() => {
  useCase = new TogglePricingPlanUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('TogglePricingPlanUseCase', () => {
  describe('execute', () => {
    it('devrait basculer l\'état de actif à inactif', async () => {
      mockRepo.findById
        .mockResolvedValueOnce({ id_plan: 1, actif: true } as any)
        .mockResolvedValueOnce({ id_plan: 1, actif: false } as any);
      mockRepo.toggleActive.mockResolvedValue(undefined);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenNthCalledWith(1, 1);
      expect(mockRepo.toggleActive).toHaveBeenCalledWith(1, false);
      expect(mockRepo.findById).toHaveBeenNthCalledWith(2, 1);
      expect(result).toEqual({ id_plan: 1, actif: false });
    });

    it('devrait basculer l\'état de inactif à actif', async () => {
      mockRepo.findById
        .mockResolvedValueOnce({ id_plan: 1, actif: false } as any)
        .mockResolvedValueOnce({ id_plan: 1, actif: true } as any);
      mockRepo.toggleActive.mockResolvedValue(undefined);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenNthCalledWith(1, 1);
      expect(mockRepo.toggleActive).toHaveBeenCalledWith(1, true);
      expect(mockRepo.findById).toHaveBeenNthCalledWith(2, 1);
      expect(result).toEqual({ id_plan: 1, actif: true });
    });

    it('devrait lancer une erreur si le plan est introuvable au début', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow("Plan introuvable");
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
      expect(mockRepo.toggleActive).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue (findById initial)', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue (toggleActive)', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1, actif: true } as any);
      mockRepo.toggleActive.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le plan est supprimé entre-temps (findById final retourne null)', async () => {
      mockRepo.findById
        .mockResolvedValueOnce({ id_plan: 1, actif: true } as any)
        .mockResolvedValueOnce(null);
      mockRepo.toggleActive.mockResolvedValue(undefined);

      const result = await useCase.execute(1);
      expect(result).toBeNull();
    });
  });
});
