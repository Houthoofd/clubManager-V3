/**
 * GetCategoriesUseCase.test.ts
 * Tests unitaires — store / GetCategoriesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : store
 */

import { GetCategoriesUseCase } from '../GetCategoriesUseCase';
import type { ICategoryRepository } from '../../../../domain/repositories/ICategoryRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<ICategoryRepository> = {
  findAll:    jest.fn(),
  findById:   jest.fn(),
  create:     jest.fn(),
  update:     jest.fn(),
  delete:     jest.fn(),
  reorder:    jest.fn(),
} as jest.Mocked<ICategoryRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetCategoriesUseCase;

beforeEach(() => {
  useCase = new GetCategoriesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetCategoriesUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)

      // Act
      // await useCase.execute();

      // Assert
      // expect(mockRepo.<méthode>).toHaveBeenCalledWith(...);
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      // mockRepo.<méthode>.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      // await expect(useCase.execute()).rejects.toThrow('DB error');
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // TODO: Ajouter les cas de validation des paramètres (valeurs manquantes, invalides)
    // TODO: Ajouter les cas de données inexistantes (ex: entité non trouvée → 404)

  });
});
