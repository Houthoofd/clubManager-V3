/**
 * ResolveAlertUseCase.test.ts
 * Tests unitaires — alerts / ResolveAlertUseCase
 */

import { ResolveAlertUseCase } from '../ResolveAlertUseCase';
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

let useCase: ResolveAlertUseCase;

beforeEach(() => {
  useCase = new ResolveAlertUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('ResolveAlertUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { alertId: number, resolvedBy: number, notes?: string } = { /* TODO: renseigner les paramètres */ };

      // Act
      // const result = await useCase.execute(input);

      // Assert
      // expect(result).toBeDefined();
      // expect(result).toMatchObject({});
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
