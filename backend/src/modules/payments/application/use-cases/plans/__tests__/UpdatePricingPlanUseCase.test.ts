/**
 * UpdatePricingPlanUseCase.test.ts
 * Tests unitaires — payments / UpdatePricingPlanUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : payments
 */

import { UpdatePricingPlanUseCase } from '../UpdatePricingPlanUseCase';
import type { IPricingPlanRepository, UpdatePricingPlanInput } from '../../../../domain/repositories/IPricingPlanRepository';

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

let useCase: UpdatePricingPlanUseCase;

beforeEach(() => {
  useCase = new UpdatePricingPlanUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('UpdatePricingPlanUseCase', () => {
  describe('execute', () => {
    it('devrait mettre à jour le plan quand les données sont valides', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1, nom: 'Ancien' } as any);
      mockRepo.update.mockResolvedValue(undefined);
      
      const input: UpdatePricingPlanInput = {
        nom: ' Nouveau Plan ',
        prix: 15,
        duree_mois: 24,
      };

      await useCase.execute(1, input);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        ...input,
        nom: 'Nouveau Plan' // trimed
      });
    });

    it('devrait mettre à jour avec un nom non fourni', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1, nom: 'Ancien' } as any);
      mockRepo.update.mockResolvedValue(undefined);
      
      const input: UpdatePricingPlanInput = {
        prix: 15
      };

      await useCase.execute(1, input);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        prix: 15,
        nom: undefined
      });
    });

    it('devrait lancer une erreur si le plan est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute(999, {})).rejects.toThrow("Plan introuvable");
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le nom est vide ou que des espaces', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1 } as any);
      const input = { nom: '   ' } as UpdatePricingPlanInput;
      await expect(useCase.execute(1, input)).rejects.toThrow("Le nom du plan ne peut pas être vide");
    });

    it('devrait lancer une erreur si le prix est <= 0', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1 } as any);
      const input1 = { prix: 0 } as UpdatePricingPlanInput;
      await expect(useCase.execute(1, input1)).rejects.toThrow("Le prix doit être supérieur à 0");

      const input2 = { prix: -5 } as UpdatePricingPlanInput;
      await expect(useCase.execute(1, input2)).rejects.toThrow("Le prix doit être supérieur à 0");
    });

    it('devrait lancer une erreur si la durée est <= 0', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1 } as any);
      const input1 = { duree_mois: 0 } as UpdatePricingPlanInput;
      await expect(useCase.execute(1, input1)).rejects.toThrow("La durée en mois doit être supérieure à 0");

      const input2 = { duree_mois: -1 } as UpdatePricingPlanInput;
      await expect(useCase.execute(1, input2)).rejects.toThrow("La durée en mois doit être supérieure à 0");
    });

    it('devrait lancer une erreur si le repository échoue (findById)', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1, {})).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue (update)', async () => {
      mockRepo.findById.mockResolvedValue({ id_plan: 1 } as any);
      mockRepo.update.mockRejectedValue(new Error('DB error update'));
      await expect(useCase.execute(1, { prix: 10 })).rejects.toThrow('DB error update');
    });
  });
});
