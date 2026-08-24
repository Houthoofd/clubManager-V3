/**
 * CreateTemplateTypeUseCase.test.ts
 * Tests unitaires — templates / CreateTemplateTypeUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { CreateTemplateTypeUseCase } from '../CreateTemplateTypeUseCase';
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

let useCase: CreateTemplateTypeUseCase;

beforeEach(() => {
  useCase = new CreateTemplateTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreateTemplateTypeUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides (avec description)', async () => {
      // Arrange
      const expectedResult = { id: 1, nom: 'Type 1', description: 'Desc 1' };
      mockRepo.createType.mockResolvedValue(expectedResult as any);

      // Act
      const result = await useCase.execute({ nom: ' Type 1 ', description: ' Desc 1 ' });

      // Assert
      expect(mockRepo.createType).toHaveBeenCalledWith({ nom: 'Type 1', description: 'Desc 1' });
      expect(result).toEqual(expectedResult);
    });

    it('devrait retourner le résultat quand les données sont valides (sans description)', async () => {
      // Arrange
      const expectedResult = { id: 1, nom: 'Type 1' };
      mockRepo.createType.mockResolvedValue(expectedResult as any);

      // Act
      const result = await useCase.execute({ nom: 'Type 1' });

      // Assert
      expect(mockRepo.createType).toHaveBeenCalledWith({ nom: 'Type 1', description: undefined });
      expect(result).toEqual(expectedResult);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le nom est manquant', async () => {
      // Act & Assert
      await expect(useCase.execute({ nom: '' })).rejects.toThrow('Le nom du type de template est requis');
      await expect(useCase.execute({ nom: '   ' })).rejects.toThrow('Le nom du type de template est requis');
      await expect(useCase.execute({ nom: undefined as any })).rejects.toThrow('Le nom du type de template est requis');
    });

    it('devrait lancer une erreur si le nom dépasse 100 caractères', async () => {
      const longName = 'a'.repeat(101);
      // Act & Assert
      await expect(useCase.execute({ nom: longName })).rejects.toThrow('Le nom du type de template ne peut pas dépasser 100 caractères');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.createType.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute({ nom: 'Valid Name' })).rejects.toThrow('DB error');
    });

  });
});
