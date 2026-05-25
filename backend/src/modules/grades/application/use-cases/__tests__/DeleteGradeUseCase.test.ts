/**
 * DeleteGradeUseCase.test.ts
 * Tests unitaires — grades / DeleteGradeUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : grades
 */

import { DeleteGradeUseCase } from '../DeleteGradeUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll:    jest.fn(),
  findById:   jest.fn(),
  create:     jest.fn(),
  update:     jest.fn(),
  delete:     jest.fn(),
} as jest.Mocked<IGradeRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: DeleteGradeUseCase;

beforeEach(() => {
  useCase = new DeleteGradeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteGradeUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { id: number } = { /* TODO: renseigner les paramètres */ };

      // Act
      // await useCase.execute(input);

      // Assert
      // expect(mockRepo.<méthode>).toHaveBeenCalledWith(...);
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      // mockRepo.<méthode>.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      // await expect(useCase.execute(input)).rejects.toThrow('DB error');
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // TODO: Ajouter les cas de validation des paramètres (valeurs manquantes, invalides)
    // TODO: Ajouter les cas de données inexistantes (ex: entité non trouvée → 404)

  });
});
