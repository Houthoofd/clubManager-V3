/**
 * GetTemplateByIdUseCase.test.ts
 * Tests unitaires — templates / GetTemplateByIdUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { GetTemplateByIdUseCase } from '../GetTemplateByIdUseCase';
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

let useCase: GetTemplateByIdUseCase;

beforeEach(() => {
  useCase = new GetTemplateByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetTemplateByIdUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le template s\'il existe', async () => {
      // Arrange
      const expectedTemplate = { id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true };
      mockRepo.getById.mockResolvedValue(expectedTemplate as any);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedTemplate);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le template n\'existe pas', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Template introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getById.mockRejectedValue(new Error('DB error get'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error get');
    });

  });
});
