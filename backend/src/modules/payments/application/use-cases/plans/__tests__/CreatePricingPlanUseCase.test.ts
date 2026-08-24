/**
 * CreatePricingPlanUseCase.test.ts
 * Tests unitaires — payments / CreatePricingPlanUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { CreatePricingPlanUseCase } from '../CreatePricingPlanUseCase';
import type { IPricingPlanRepository, CreatePricingPlanInput } from '../../../../domain/repositories/IPricingPlanRepository';

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

let useCase: CreatePricingPlanUseCase;

beforeEach(() => {
  useCase = new CreatePricingPlanUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('CreatePricingPlanUseCase', () => {
  describe('execute', () => {
    it('devrait créer un plan quand les données sont valides', async () => {
      mockRepo.create.mockResolvedValue(1);
      
      const input: CreatePricingPlanInput = {
        nom: ' Plan Premium ',
        prix: 10,
        duree_mois: 12,
        is_active: true
      };

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...input,
        nom: 'Plan Premium'
      });
      expect(result).toBe(1);
    });

    it('devrait lancer une erreur si le nom est manquant', async () => {
      const input = { prix: 10, duree_mois: 12 } as CreatePricingPlanInput;
      await expect(useCase.execute(input)).rejects.toThrow("Le nom du plan est requis");
    });

    it('devrait lancer une erreur si le nom est vide ou que des espaces', async () => {
      const input = { nom: '   ', prix: 10, duree_mois: 12 } as CreatePricingPlanInput;
      await expect(useCase.execute(input)).rejects.toThrow("Le nom du plan est requis");
    });

    it('devrait lancer une erreur si le prix est manquant ou <= 0', async () => {
      const input1 = { nom: 'Plan', prix: 0, duree_mois: 12 } as CreatePricingPlanInput;
      await expect(useCase.execute(input1)).rejects.toThrow("Le prix doit être supérieur à 0");

      const input2 = { nom: 'Plan', prix: -5, duree_mois: 12 } as CreatePricingPlanInput;
      await expect(useCase.execute(input2)).rejects.toThrow("Le prix doit être supérieur à 0");
    });

    it('devrait lancer une erreur si la durée est manquante ou <= 0', async () => {
      const input1 = { nom: 'Plan', prix: 10, duree_mois: 0 } as CreatePricingPlanInput;
      await expect(useCase.execute(input1)).rejects.toThrow("La durée en mois doit être supérieure à 0");

      const input2 = { nom: 'Plan', prix: 10, duree_mois: -1 } as CreatePricingPlanInput;
      await expect(useCase.execute(input2)).rejects.toThrow("La durée en mois doit être supérieure à 0");
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.create.mockRejectedValue(new Error('DB error'));
      const input: CreatePricingPlanInput = { nom: 'Plan', prix: 10, duree_mois: 12 };
      
      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });
  });
});
