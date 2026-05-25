/**
 * BulkUpsertInformationsUseCase.test.ts
 * Tests unitaires — settings / BulkUpsertInformationsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : settings
 */

import { BulkUpsertInformationsUseCase } from '../BulkUpsertInformationsUseCase';
import type { IInformationRepository } from '../../../domain/repositories/IInformationRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IInformationRepository> = {
  findAll:      jest.fn(),
  findByKey:    jest.fn(),
  findById:     jest.fn(),
  create:       jest.fn(),
  update:       jest.fn(),
  upsert:       jest.fn(),
  bulkUpsert:   jest.fn(),
  delete:       jest.fn(),
  keyExists:    jest.fn(),
} as jest.Mocked<IInformationRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: BulkUpsertInformationsUseCase;

beforeEach(() => {
  useCase = new BulkUpsertInformationsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('BulkUpsertInformationsUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { informations: CreateInformation[] } = { /* TODO: renseigner les paramètres */ };

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
