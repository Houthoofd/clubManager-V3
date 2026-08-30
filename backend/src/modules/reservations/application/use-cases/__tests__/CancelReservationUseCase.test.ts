/**
 * CancelReservationUseCase.test.ts
 * Tests unitaires — reservations / CancelReservationUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : reservations
 */

import { CancelReservationUseCase } from '../CancelReservationUseCase';
import type { IReservationRepository } from '../../../domain/repositories/IReservationRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IReservationRepository> = {
  findAll:              jest.fn(),
  findById:             jest.fn(),
  findByUserAndCours:   jest.fn(),
  create:               jest.fn(),
  updateStatus:         jest.fn(),
  countActive:          jest.fn(),
} as jest.Mocked<IReservationRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: CancelReservationUseCase;

beforeEach(() => {
  useCase = new CancelReservationUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CancelReservationUseCase', () => {
  describe('execute', () => {

    it('devrait annuler la réservation si l\'utilisateur est le propriétaire', async () => {
      // Arrange
      const reservation = { id: 1, user_id: 10, cours_id: 20, statut: 'confirmee' };
      mockRepo.findById.mockResolvedValue(reservation as any);
      mockRepo.updateStatus.mockResolvedValue(undefined);

      // Act
      await useCase.execute(1, 10, 'user');

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'annulee');
    });

    it('devrait annuler la réservation si l\'utilisateur est admin', async () => {
      // Arrange
      const reservation = { id: 1, user_id: 10, cours_id: 20, statut: 'confirmee' };
      mockRepo.findById.mockResolvedValue(reservation as any);
      mockRepo.updateStatus.mockResolvedValue(undefined);

      // Act
      await useCase.execute(1, 999, 'admin');

      // Assert
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(1, 'annulee');
    });

    it('devrait lancer une erreur si la réservation est introuvable', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1, 10, 'user')).rejects.toThrow('Réservation introuvable');
    });

    it('devrait lancer une erreur si l\'accès est refusé (non propriétaire et non admin)', async () => {
      // Arrange
      const reservation = { id: 1, user_id: 10, cours_id: 20, statut: 'confirmee' };
      mockRepo.findById.mockResolvedValue(reservation as any);

      // Act & Assert
      await expect(useCase.execute(1, 11, 'user')).rejects.toThrow('Accès refusé');
    });

    it('devrait lancer une erreur si la réservation est déjà annulée', async () => {
      // Arrange
      const reservation = { id: 1, user_id: 10, cours_id: 20, statut: 'annulee' };
      mockRepo.findById.mockResolvedValue(reservation as any);

      // Act & Assert
      await expect(useCase.execute(1, 10, 'user')).rejects.toThrow('Cette réservation est déjà annulée');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1, 10, 'user')).rejects.toThrow('DB error');
    });

  });
});
