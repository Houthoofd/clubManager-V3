/**
 * GetUserReservationsUseCase.test.ts
 * Tests unitaires — reservations / GetUserReservationsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : reservations
 */

import { GetUserReservationsUseCase } from '../GetUserReservationsUseCase';
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

let useCase: GetUserReservationsUseCase;

beforeEach(() => {
  useCase = new GetUserReservationsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUserReservationsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les réservations d\'un utilisateur sans filtre de statut', async () => {
      // Arrange
      const mockReservations = [{ id: 1, user_id: 10, cours_id: 2, statut: 'confirmee' }];
      mockRepo.findAll.mockResolvedValue({
        reservations: mockReservations,
        pagination: { total: 1, limit: 100, offset: 0 }
      } as any);

      // Act
      const result = await useCase.execute(10);

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({
        user_id: 10,
        statut: undefined,
        limit: 100,
      });
      expect(result).toEqual(mockReservations);
    });

    it('devrait retourner les réservations d\'un utilisateur avec filtre de statut', async () => {
      // Arrange
      const mockReservations = [{ id: 2, user_id: 10, cours_id: 3, statut: 'annulee' }];
      mockRepo.findAll.mockResolvedValue({
        reservations: mockReservations,
        pagination: { total: 1, limit: 100, offset: 0 }
      } as any);

      // Act
      const result = await useCase.execute(10, 'annulee' as any);

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({
        user_id: 10,
        statut: 'annulee',
        limit: 100,
      });
      expect(result).toEqual(mockReservations);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('DB error');
    });

  });
});
