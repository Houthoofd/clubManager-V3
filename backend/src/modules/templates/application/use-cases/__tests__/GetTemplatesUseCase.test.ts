/**
 * GetTemplatesUseCase.test.ts
 * Tests unitaires — templates / GetTemplatesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { GetTemplatesUseCase } from '../GetTemplatesUseCase';
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

let useCase: GetTemplatesUseCase;

beforeEach(() => {
  useCase = new GetTemplatesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetTemplatesUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner la liste des templates sans filtres', async () => {
      // Arrange
      const expectedTemplates = [{ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true }];
      mockRepo.getAll.mockResolvedValue(expectedTemplates as any);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockRepo.getAll).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(expectedTemplates);
    });

    it('devrait retourner la liste des templates avec filtres', async () => {
      // Arrange
      const expectedTemplates = [{ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true }];
      mockRepo.getAll.mockResolvedValue(expectedTemplates as any);

      // Act
      const result = await useCase.execute({ type_id: 1, actif: false });

      // Assert
      expect(mockRepo.getAll).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(expectedTemplates);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('DB error');
    });

  });
});
