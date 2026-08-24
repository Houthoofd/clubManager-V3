/**
 * GetCategoriesUseCase.test.ts
 * Tests unitaires — store / GetCategoriesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : store
 */

import { GetCategoriesUseCase } from '../GetCategoriesUseCase';
import type { ICategoryRepository, CategoryRow } from '../../../../domain/repositories/ICategoryRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<ICategoryRepository> = {
  findAll:    jest.fn(),
  findById:   jest.fn(),
  create:     jest.fn(),
  update:     jest.fn(),
  delete:     jest.fn(),
  reorder:    jest.fn(),
} as jest.Mocked<ICategoryRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: GetCategoriesUseCase;

beforeEach(() => {
  useCase = new GetCategoriesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('GetCategoriesUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      const mockCategories: CategoryRow[] = [
        { id: 1, nom: 'Cat 1', position: 1, parent_id: null },
        { id: 2, nom: 'Cat 2', position: 2, parent_id: null }
      ];
      mockRepo.findAll.mockResolvedValue(mockCategories);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCategories);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('DB error');
      expect(mockRepo.findAll).toHaveBeenCalledTimes(1);
    });

  });
});
