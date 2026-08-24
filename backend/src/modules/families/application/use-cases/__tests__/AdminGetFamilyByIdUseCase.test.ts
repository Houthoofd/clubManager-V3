/**
 * AdminGetFamilyByIdUseCase.test.ts
 * Tests unitaires — families / AdminGetFamilyByIdUseCase
 */

import { AdminGetFamilyByIdUseCase } from '../AdminGetFamilyByIdUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { FamilyWithCount } from '../../../domain/adminTypes';

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

let useCase: AdminGetFamilyByIdUseCase;

beforeEach(() => {
  useCase = new AdminGetFamilyByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('AdminGetFamilyByIdUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner la famille si elle existe', async () => {
      // Arrange
      const mockFamily: FamilyWithCount = { id: 1, created_at: new Date(), updated_at: new Date(), membre_count: 3 };
      mockRepo.findById.mockResolvedValue(mockFamily);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockFamily);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si la famille n existe pas', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('Famille introuvable');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

  });
});
