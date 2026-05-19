/**
 * ResendVerificationEmailUseCase.test.ts
 * Tests unitaires — auth / ResendVerificationEmailUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : auth
 */

jest.mock('@/shared/services/TokenService.js');
jest.mock('../services/EmailService.js');

import { ResendVerificationEmailUseCase } from '../ResendVerificationEmailUseCase';
import type { IAuthRepository } from '../../../domain/repositories/IAuthRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IAuthRepository> = {
  createUser:                       jest.fn(),
  findUserByEmail:                  jest.fn(),
  findUserById:                     jest.fn(),
  findUserByUserId:                 jest.fn(),
  emailExists:                      jest.fn(),
  updatePassword:                   jest.fn(),
  updateLastLogin:                  jest.fn(),
  markEmailAsVerified:              jest.fn(),
  storeEmailVerificationToken:      jest.fn(),
  validateEmailVerificationToken:   jest.fn(),
  deleteEmailVerificationToken:     jest.fn(),
  storePasswordResetToken:          jest.fn(),
  validatePasswordResetToken:       jest.fn(),
  deletePasswordResetToken:         jest.fn(),
  deleteAllPasswordResetTokens:     jest.fn(),
  storeRefreshToken:                jest.fn(),
  validateRefreshToken:             jest.fn(),
  deleteRefreshToken:               jest.fn(),
  deleteAllRefreshTokens:           jest.fn(),
  cleanupExpiredTokens:             jest.fn(),
  getLoginAttempts:                 jest.fn(),
  getAuthAttempts:                  jest.fn(),
  getActiveSessions:                jest.fn(),
  revokeSession:                    jest.fn(),
  updateEmail:                      jest.fn(),
  storeEmailChangeToken:            jest.fn(),
  validateEmailChangeToken:         jest.fn(),
} as jest.Mocked<IAuthRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: ResendVerificationEmailUseCase;

beforeEach(() => {
  useCase = new ResendVerificationEmailUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('ResendVerificationEmailUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      // TODO: configurer le mock → mockRepo.<méthode>.mockResolvedValue(...)
      // const input: { input: ResendVerificationEmailInput } = { /* TODO: renseigner les paramètres */ };

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
