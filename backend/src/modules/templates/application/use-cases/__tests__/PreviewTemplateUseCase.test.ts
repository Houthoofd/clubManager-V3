/**
 * PreviewTemplateUseCase.test.ts
 * Tests unitaires — templates / PreviewTemplateUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : templates
 */

// removed mock

import { PreviewTemplateUseCase } from '../PreviewTemplateUseCase';
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

let useCase: PreviewTemplateUseCase;

beforeEach(() => {
  useCase = new PreviewTemplateUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('PreviewTemplateUseCase', () => {
  describe('execute', () => {
    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le rendu du template avec les données d\'exemple par défaut', async () => {
      // Arrange
      mockRepo.getById.mockResolvedValueOnce({
        id: 1,
        type_id: 1,
        titre: 'Bonjour {{prenom}}',
        contenu: 'Votre id est {{userId}} et date: {{date}}',
        actif: true,
        created_at: new Date(),
        updated_at: new Date()
      } as any);

      const result = await useCase.execute(1, {});

      // Assert
      expect(mockRepo.getById).toHaveBeenCalledWith(1);
      expect(result.titre).toBe('Bonjour Jean');
      expect(result.contenu).toBe('Votre id est U-2025-0001 et date: {{date}}');
      expect(result.auto_variables).toContain('prenom');
      expect(result.auto_variables).toContain('userId');
      expect(result.manual_variables).toContain('date');
    });

    it('devrait retourner le rendu du template avec des données d\'exemple fournies', async () => {
      // Arrange
      const expectedTemplate = { id: 1, type_id: 1, titre: 'Bonjour {{prenom}}', contenu: 'Votre id est {{userId}} et date: {{date}}', variables: ['prenom', 'userId', 'date'], actif: true };
      mockRepo.getById.mockResolvedValue(expectedTemplate as any);

      // Act
      const result = await useCase.execute(1, {
        recipient_example: { first_name: 'Alice', last_name: 'Bob', userId: 'A-123' },
        manual_vars: { date: '12/12/2025' }
      });

      // Assert
      expect(result.titre).toBe('Bonjour Alice');
      expect(result.contenu).toBe('Votre id est A-123 et date: 12/12/2025');
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
      mockRepo.getById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

  });
});
