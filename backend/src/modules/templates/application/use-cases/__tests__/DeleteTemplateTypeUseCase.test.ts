/**
 * DeleteTemplateTypeUseCase.test.ts
 * Tests unitaires — templates / DeleteTemplateTypeUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { DeleteTemplateTypeUseCase } from '../DeleteTemplateTypeUseCase';
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

let useCase: DeleteTemplateTypeUseCase;

beforeEach(() => {
  useCase = new DeleteTemplateTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteTemplateTypeUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait supprimer le type s\'il existe et qu\'il n\'a pas de templates actifs', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      mockRepo.getAll.mockResolvedValue([]);
      mockRepo.deleteType.mockResolvedValue(true);

      // Act
      await useCase.execute(1);

      // Assert
      expect(mockRepo.getTypes).toHaveBeenCalled();
      expect(mockRepo.getAll).toHaveBeenCalledWith(1, true);
      expect(mockRepo.deleteType).toHaveBeenCalledWith(1);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le type n\'existe pas', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 2, nom: 'Type 2' }] as any);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Type de template introuvable');
      expect(mockRepo.getAll).not.toHaveBeenCalled();
      expect(mockRepo.deleteType).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le type a des templates actifs', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      mockRepo.getAll.mockResolvedValue([{ id: 10, type_id: 1, titre: 'Titre', contenu: 'C', variables: [], actif: true }]);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Impossible de supprimer ce type : 1 template(s) actif(s) y sont rattachés. Désactivez ou supprimez ces templates avant de supprimer le type.');
      expect(mockRepo.deleteType).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository (deleteType) échoue', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      mockRepo.getAll.mockResolvedValue([]);
      mockRepo.deleteType.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository (getTypes) échoue', async () => {
      // Arrange
      mockRepo.getTypes.mockRejectedValue(new Error('DB error types'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error types');
    });

  });
});
