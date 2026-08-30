/**
 * UpdateTemplateUseCase.test.ts
 * Tests unitaires — templates / UpdateTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { UpdateTemplateUseCase } from '../UpdateTemplateUseCase';
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

let useCase: UpdateTemplateUseCase;

beforeEach(() => {
  useCase = new UpdateTemplateUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('UpdateTemplateUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait mettre à jour le template si les données sont valides', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1 } as any);
      mockRepo.update.mockResolvedValue(true);

      // Act
      await useCase.execute(1, { titre: ' New Titre ', contenu: ' New Contenu ', type_id: 2, actif: false });

      // Assert
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith(1, { type_id: 2, titre: 'New Titre', contenu: 'New Contenu', actif: false });
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si aucun champ n\'est fourni', async () => {
      await expect(useCase.execute(1, {})).rejects.toThrow('Au moins un champ doit être fourni pour la mise à jour');
    });

    it('devrait lancer une erreur si le titre est fourni mais vide', async () => {
      await expect(useCase.execute(1, { titre: '   ' })).rejects.toThrow('Le titre du template ne peut pas être vide');
      await expect(useCase.execute(1, { titre: '' })).rejects.toThrow('Le titre du template ne peut pas être vide');
    });

    it('devrait lancer une erreur si le contenu est fourni mais vide', async () => {
      await expect(useCase.execute(1, { contenu: '   ' })).rejects.toThrow('Le contenu du template ne peut pas être vide');
      await expect(useCase.execute(1, { contenu: '' })).rejects.toThrow('Le contenu du template ne peut pas être vide');
    });

    it('devrait lancer une erreur si le template n\'existe pas', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1, { titre: 'T' })).rejects.toThrow('Template introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValue({ id: 1 } as any);
      mockRepo.update.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1, { titre: 'T' })).rejects.toThrow('DB error');
    });

  });
});
