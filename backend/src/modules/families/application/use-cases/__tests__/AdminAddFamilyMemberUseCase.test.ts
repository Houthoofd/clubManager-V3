/**
 * AdminAddFamilyMemberUseCase.test.ts
 * Tests unitaires — families / AdminAddFamilyMemberUseCase
 */

import { AdminAddFamilyMemberUseCase } from '../AdminAddFamilyMemberUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { AdminAddMemberDto } from '../../../domain/adminTypes';

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

let useCase: AdminAddFamilyMemberUseCase;

beforeEach(() => {
  useCase = new AdminAddFamilyMemberUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('AdminAddFamilyMemberUseCase', () => {
  describe('execute', () => {

    const dto: AdminAddMemberDto = {
      familleId: 10,
      userId: 5,
      role: 'enfant',
      estResponsable: false,
      estTuteurLegal: false
    };

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait ajouter le membre si la famille existe et que l utilisateur n est pas déjà membre', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.isMembre.mockResolvedValue(false);
      mockRepo.adminAddMembre.mockResolvedValue();

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(10);
      expect(mockRepo.isMembre).toHaveBeenCalledWith(10, 5);
      expect(mockRepo.adminAddMembre).toHaveBeenCalledWith(dto);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si la famille n existe pas', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('Famille introuvable');
      expect(mockRepo.isMembre).not.toHaveBeenCalled();
      expect(mockRepo.adminAddMembre).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l utilisateur est déjà membre', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.isMembre.mockResolvedValue(true);

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('Cet utilisateur est déjà membre de cette famille');
      expect(mockRepo.adminAddMembre).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de l ajout', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.isMembre.mockResolvedValue(false);
      mockRepo.adminAddMembre.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });

  });
});
