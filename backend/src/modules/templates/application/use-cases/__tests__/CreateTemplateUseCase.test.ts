/**
 * CreateTemplateUseCase.test.ts
 * Tests unitaires — templates / CreateTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

import { CreateTemplateUseCase } from '../CreateTemplateUseCase';
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

let useCase: CreateTemplateUseCase;

beforeEach(() => {
  useCase = new CreateTemplateUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreateTemplateUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      const expectedTemplate = { id: 10, type_id: 1, titre: 'Titre 1', contenu: 'Contenu 1', variables: [], actif: true };
      mockRepo.create.mockResolvedValue(expectedTemplate as any);

      // Act
      const result = await useCase.execute({ type_id: 1, titre: ' Titre 1 ', contenu: ' Contenu 1 ' });

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith({ type_id: 1, titre: 'Titre 1', contenu: 'Contenu 1', actif: true });
      expect(result).toEqual(expectedTemplate);
    });

    it('devrait retourner le résultat avec actif false si spécifié', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      const expectedTemplate = { id: 10, type_id: 1, titre: 'Titre 1', contenu: 'Contenu 1', variables: [], actif: false };
      mockRepo.create.mockResolvedValue(expectedTemplate as any);

      // Act
      const result = await useCase.execute({ type_id: 1, titre: 'Titre 1', contenu: 'Contenu 1', actif: false });

      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith({ type_id: 1, titre: 'Titre 1', contenu: 'Contenu 1', actif: false });
      expect(result).toEqual(expectedTemplate);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le titre est manquant', async () => {
      await expect(useCase.execute({ type_id: 1, titre: '', contenu: 'c' })).rejects.toThrow('Le titre du template est requis');
      await expect(useCase.execute({ type_id: 1, titre: '   ', contenu: 'c' })).rejects.toThrow('Le titre du template est requis');
    });

    it('devrait lancer une erreur si le titre dépasse 255 caractères', async () => {
      const longTitle = 'a'.repeat(256);
      await expect(useCase.execute({ type_id: 1, titre: longTitle, contenu: 'c' })).rejects.toThrow('Le titre du template ne peut pas dépasser 255 caractères');
    });

    it('devrait lancer une erreur si le contenu est manquant', async () => {
      await expect(useCase.execute({ type_id: 1, titre: 't', contenu: '' })).rejects.toThrow('Le contenu du template est requis');
      await expect(useCase.execute({ type_id: 1, titre: 't', contenu: '   ' })).rejects.toThrow('Le contenu du template est requis');
    });

    it('devrait lancer une erreur si le type_id est invalide', async () => {
      await expect(useCase.execute({ type_id: 0, titre: 't', contenu: 'c' })).rejects.toThrow('Le type du template est requis');
      await expect(useCase.execute({ type_id: -1, titre: 't', contenu: 'c' })).rejects.toThrow('Le type du template est requis');
      await expect(useCase.execute({ type_id: NaN, titre: 't', contenu: 'c' })).rejects.toThrow('Le type du template est requis');
    });

    it('devrait lancer une erreur si le type de template n\'existe pas', async () => {
      mockRepo.getTypes.mockResolvedValue([{ id: 2, nom: 'Type 2' }] as any);
      await expect(useCase.execute({ type_id: 1, titre: 't', contenu: 'c' })).rejects.toThrow('Type de template introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.getTypes.mockResolvedValue([{ id: 1, nom: 'Type 1' }] as any);
      mockRepo.create.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute({ type_id: 1, titre: 't', contenu: 'c' })).rejects.toThrow('DB error');
    });

  });
});
