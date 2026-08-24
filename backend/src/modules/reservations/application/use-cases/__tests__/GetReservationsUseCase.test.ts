/**
 * GetReservationsUseCase.test.ts
 * Tests unitaires — reservations / GetReservationsUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : reservations
 */

import { GetReservationsUseCase } from '../GetReservationsUseCase';
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

let useCase: GetReservationsUseCase;

beforeEach(() => {
  useCase = new GetReservationsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetReservationsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les réservations paginées avec succès', async () => {
      // Arrange
      const query = { limit: 10, page: 1 };
      const paginatedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        reservations: [],
        pagination: { total: 0, limit: 10, offset: 0 }
      };
      mockRepo.findAll.mockResolvedValue(paginatedResult as any);

      // Act
      const result = await useCase.execute(query);

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      const query = { limit: 10, page: 1 };
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(query)).rejects.toThrow('DB error');
    });

  });
});
