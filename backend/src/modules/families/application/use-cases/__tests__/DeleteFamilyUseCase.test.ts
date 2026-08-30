/**
 * DeleteFamilyUseCase.test.ts
 * Tests unitaires — families / DeleteFamilyUseCase
 */

import { DeleteFamilyUseCase } from '../DeleteFamilyUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IFamilyRepository> = {
  createFamille:           jest.fn(),
  findFamilleByUserId:     jest.fn(),
  addMembre:               jest.fn(),
  getMembresByFamilleId:   jest.fn(),
  removeMembre:            jest.fn(),
  isMembre:                jest.fn(),
  findAll:                 jest.fn(),
  findById:                jest.fn(),
  update:                  jest.fn(),
  delete:                  jest.fn(),
  adminAddMembre:          jest.fn(),
  createChildUser:         jest.fn(),
} as jest.Mocked<IFamilyRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: DeleteFamilyUseCase;

beforeEach(() => {
  useCase = new DeleteFamilyUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('DeleteFamilyUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait supprimer la famille si elle existe', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.delete.mockResolvedValue();

      // Act
      await useCase.execute(10);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(10);
      expect(mockRepo.delete).toHaveBeenCalledWith(10);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si la famille n existe pas', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('Famille introuvable');
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de la suppression', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.delete.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('DB error');
    });

  });
});
