/**
 * GetUnreadCountUseCase.test.ts
 * Tests unitaires — notifications / GetUnreadCountUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : notifications
 */

import { GetUnreadCountUseCase } from '../GetUnreadCountUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<INotificationRepository> = {
  findByUserId:        jest.fn(),
  getUnreadCount:      jest.fn(),
  markAsRead:          jest.fn(),
  markAllAsRead:       jest.fn(),
  create:              jest.fn(),
  deleteOld:           jest.fn(),
  deleteById:          jest.fn(),
  deleteAll:           jest.fn(),
  getUserIdsByCible:   jest.fn(),
  createBulk:          jest.fn(),
} as jest.Mocked<INotificationRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetUnreadCountUseCase;

beforeEach(() => {
  useCase = new GetUnreadCountUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUnreadCountUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { userId: number } = { /* TODO: renseigner les paramètres */ };

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
