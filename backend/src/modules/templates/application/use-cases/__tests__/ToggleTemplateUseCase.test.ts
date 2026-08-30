/**
 * ToggleTemplateUseCase.test.ts
 * Tests unitaires — templates / ToggleTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { ToggleTemplateUseCase } from '../ToggleTemplateUseCase';
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

let useCase: ToggleTemplateUseCase;

beforeEach(() => {
  useCase = new ToggleTemplateUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('ToggleTemplateUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait basculer l\'état du template s\'il existe', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true });
      mockRepo.toggle.mockResolvedValue(true);

      // Act
      await useCase.execute(1, false);

      // Assert
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(mockRepo.toggle).toHaveBeenCalledWith(1, false);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le template n\'existe pas', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1, true)).rejects.toThrow('Template introuvable');
      expect(mockRepo.toggle).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository (getById) échoue', async () => {
      // Arrange
      mockRepo.getById.mockRejectedValue(new Error('DB error get'));

      // Act & Assert
      await expect(useCase.execute(1, true)).rejects.toThrow('DB error get');
      expect(mockRepo.toggle).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository (toggle) échoue', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true });
      mockRepo.toggle.mockRejectedValue(new Error('DB error toggle'));

      // Act & Assert
      await expect(useCase.execute(1, true)).rejects.toThrow('DB error toggle');
    });

  });
});
