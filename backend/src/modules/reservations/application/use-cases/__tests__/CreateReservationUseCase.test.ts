/**
 * CreateReservationUseCase.test.ts
 * Tests unitaires — reservations / CreateReservationUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : reservations
 */

import { CreateReservationUseCase } from '../CreateReservationUseCase';
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

let useCase: CreateReservationUseCase;

beforeEach(() => {
  useCase = new CreateReservationUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('CreateReservationUseCase', () => {
  describe('execute', () => {

    it('devrait créer une nouvelle réservation s\'il n\'y en a pas de précédente', async () => {
      // Arrange
      const input = { user_id: 1, cours_id: 2 };
      mockRepo.findByUserAndCours.mockResolvedValue(null);
      const created = { id: 10, user_id: 1, cours_id: 2, statut: 'confirmee' };
      mockRepo.create.mockResolvedValue(created as any);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockRepo.findByUserAndCours).toHaveBeenCalledWith(1, 2);
      expect(mockRepo.create).toHaveBeenCalledWith({ user_id: 1, cours_id: 2, statut: 'confirmee' });
      expect(result).toEqual(created);
    });

    it('devrait lancer une erreur si une réservation active existe déjà', async () => {
      // Arrange
      const input = { user_id: 1, cours_id: 2 };
      const existing = { id: 10, user_id: 1, cours_id: 2, statut: 'confirmee' };
      mockRepo.findByUserAndCours.mockResolvedValue(existing as any);

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Vous avez déjà une réservation pour ce cours');
    });

    it('devrait réactiver une réservation si elle était annulée', async () => {
      // Arrange
      const input = { user_id: 1, cours_id: 2 };
      const existing = { id: 10, user_id: 1, cours_id: 2, statut: 'annulee' };
      const reactivated = { id: 10, user_id: 1, cours_id: 2, statut: 'confirmee' };
      
      mockRepo.findByUserAndCours.mockResolvedValue(existing as any);
      mockRepo.updateStatus.mockResolvedValue(undefined);
      mockRepo.findById.mockResolvedValue(reactivated as any);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(10, 'confirmee');
      expect(mockRepo.findById).toHaveBeenCalledWith(10);
      expect(result).toEqual(reactivated);
    });

    it('devrait lancer une erreur si la réactivation échoue (introuvable)', async () => {
      // Arrange
      const input = { user_id: 1, cours_id: 2 };
      const existing = { id: 10, user_id: 1, cours_id: 2, statut: 'annulee' };
      
      mockRepo.findByUserAndCours.mockResolvedValue(existing as any);
      mockRepo.updateStatus.mockResolvedValue(undefined);
      mockRepo.findById.mockResolvedValue(null); // not found after update

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Erreur lors de la réactivation de la réservation');
    });

    it('devrait lancer une erreur si le repository échoue lors de la création', async () => {
      // Arrange
      const input = { user_id: 1, cours_id: 2 };
      mockRepo.findByUserAndCours.mockResolvedValue(null);
      mockRepo.create.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });

  });
});
