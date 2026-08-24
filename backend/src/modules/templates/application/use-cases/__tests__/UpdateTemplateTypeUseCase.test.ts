/**
 * UpdateTemplateTypeUseCase.test.ts
 * Tests unitaires — templates / UpdateTemplateTypeUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { UpdateTemplateTypeUseCase } from '../UpdateTemplateTypeUseCase';
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

let useCase: UpdateTemplateTypeUseCase;

beforeEach(() => {
  useCase = new UpdateTemplateTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('UpdateTemplateTypeUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait mettre à jour le type de template si les données sont valides', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Old' }] as any);
      mockRepo.updateType.mockResolvedValue(true);

      // Act
      await useCase.execute(1, { nom: ' New ', description: ' Desc ', actif: false });

      // Assert
      expect(mockRepo.getTypes).toHaveBeenCalled();
      expect(mockRepo.updateType).toHaveBeenCalledWith(1, { nom: 'New', description: 'Desc', actif: false });
    });

    it('devrait mettre à jour avec seulement un champ (description)', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Old' }] as any);
      mockRepo.updateType.mockResolvedValue(true);

      // Act
      await useCase.execute(1, { description: 'New desc' });

      // Assert
      expect(mockRepo.updateType).toHaveBeenCalledWith(1, { nom: undefined, description: 'New desc', actif: undefined });
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si aucun champ n\'est fourni', async () => {
      await expect(useCase.execute(1, {})).rejects.toThrow('Au moins un champ doit être fourni pour la mise à jour');
    });

    it('devrait lancer une erreur si le nom est fourni mais vide', async () => {
      await expect(useCase.execute(1, { nom: '   ' })).rejects.toThrow('Le nom du type ne peut pas être vide');
      await expect(useCase.execute(1, { nom: '' })).rejects.toThrow('Le nom du type ne peut pas être vide');
    });

    it('devrait lancer une erreur si le type de template n\'existe pas', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 2, nom: 'Type 2' }] as any);

      // Act & Assert
      await expect(useCase.execute(1, { nom: 'New' })).rejects.toThrow('Type de template introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      mockRepo.updateType.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1, { nom: 'New' })).rejects.toThrow('DB error');
    });

  });
});
