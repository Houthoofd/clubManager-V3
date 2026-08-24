/**
 * GetTemplateTypesUseCase.test.ts
 * Tests unitaires — templates / GetTemplateTypesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { GetTemplateTypesUseCase } from '../GetTemplateTypesUseCase';
import type { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<ITemplateRepository> = {
  getTypes:     jest.fn(),
  createType:   jest.fn(),
  updateType:   jest.fn(),
  deleteType:   jest.fn(),
  getAll:       jest.fn(),
  getById:      jest.fn(),
  create:       jest.fn(),
  update:       jest.fn(),
  delete:       jest.fn(),
  toggle:       jest.fn(),
} as jest.Mocked<ITemplateRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetTemplateTypesUseCase;

beforeEach(() => {
  useCase = new GetTemplateTypesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetTemplateTypesUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner les types de templates', async () => {
      // Arrange
      const expectedTypes = [{ id: 1, nom: 'Type 1' }];
      mockRepo.getTypes.mockResolvedValue(expectedTypes as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepo.getTypes).toHaveBeenCalled();
      expect(result).toEqual(expectedTypes);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getTypes.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('DB error');
    });

  });
});
