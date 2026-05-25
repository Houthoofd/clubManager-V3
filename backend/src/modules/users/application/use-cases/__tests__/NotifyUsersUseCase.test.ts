/**
 * NotifyUsersUseCase.test.ts
 * Tests unitaires — users / NotifyUsersUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : users
 */

jest.mock('@/modules/messaging/application/services/MessagingEmailService.js');

import { NotifyUsersUseCase } from '../NotifyUsersUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll:              jest.fn(),
  findById:             jest.fn(),
  findProfile:          jest.fn(),
  updateRole:           jest.fn(),
  updateStatus:         jest.fn(),
  updateLanguage:       jest.fn(),
  updateProfile:        jest.fn(),
  softDelete:           jest.fn(),
  restore:              jest.fn(),
  findDeleted:          jest.fn(),
  anonymize:            jest.fn(),
  updateSubscription:   jest.fn(),
} as jest.Mocked<IUserRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: NotifyUsersUseCase;

beforeEach(() => {
  useCase = new NotifyUsersUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('NotifyUsersUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { dto: NotifyUsersDto } = { /* TODO: renseigner les paramètres */ };

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
