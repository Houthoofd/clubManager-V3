/**
 * DeleteTemplateUseCase.test.ts
 * Tests unitaires — templates / DeleteTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { DeleteTemplateUseCase } from '../DeleteTemplateUseCase';
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

let useCase: DeleteTemplateUseCase;

beforeEach(() => {
  useCase = new DeleteTemplateUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteTemplateUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait supprimer le template s\'il existe', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true });
      mockRepo.delete.mockResolvedValue(true);

      // Act
      await useCase.execute(1);

      // Assert
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le template n\'existe pas', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Template introuvable');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository (getById) échoue', async () => {
      // Arrange
      mockRepo.getById.mockRejectedValue(new Error('DB error get'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error get');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository (delete) échoue', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true });
      mockRepo.delete.mockRejectedValue(new Error('DB error delete'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error delete');
    });

  });
});
