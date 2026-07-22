/**
 * GetUserAlertsUseCase.test.ts
 * Tests unitaires — alerts / GetUserAlertsUseCase
 */

import { GetUserAlertsUseCase } from '../GetUserAlertsUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IAlertRepository> = {
  findAllAlertTypes:     jest.fn().mockResolvedValue([]),
  findAlertTypeById:     jest.fn().mockResolvedValue(null),
  findAlertTypeByCode:   jest.fn().mockResolvedValue(null),
  createAlertType:       jest.fn(),
  updateAlertType:       jest.fn(),
  deleteAlertType:       jest.fn().mockResolvedValue(false),
  findUserAlerts:        jest.fn().mockResolvedValue([]),
  findAllActiveAlerts:   jest.fn().mockResolvedValue([]),
  createUserAlert:       jest.fn(),
  resolveAlert:          jest.fn(),
  ignoreAlert:           jest.fn(),
  findAlertActions:      jest.fn().mockResolvedValue([]),
  addAlertAction:        jest.fn(),
} as jest.Mocked<IAlertRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetUserAlertsUseCase;

beforeEach(() => {
  useCase = new GetUserAlertsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUserAlertsUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { userId: number, statut?: AlertStatut } = { /* TODO: renseigner les paramètres */ };

      // Act
      // const result = await useCase.execute(input);

      // Assert
      // expect(result).toEqual(expect.arrayContaining([]));
      // expect(Array.isArray(result)).toBe(true);
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer Error si une erreur interne survient', async () => {
      // Arrange
      // mockRepo.<méthode>.mockRejectedValue(new Error('Not found'));

      // Act & Assert
      // await expect(useCase.execute(input)).rejects.toThrow(Error);
      expect(true).toBe(true); // placeholder — à remplacer
    });

    // TODO: Ajouter les cas de validation des paramètres (valeurs manquantes, invalides)
    // TODO: Ajouter les cas de données inexistantes (ex: entité non trouvée → 404)

  });
});
