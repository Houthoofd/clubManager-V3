/**
 * AdminGetFamilyMembersUseCase.test.ts
 * Tests unitaires — families / AdminGetFamilyMembersUseCase
 */

import { AdminGetFamilyMembersUseCase } from '../AdminGetFamilyMembersUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { FamilyMemberWithUser } from '@clubmanager/types';

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

let useCase: AdminGetFamilyMembersUseCase;

beforeEach(() => {
  useCase = new AdminGetFamilyMembersUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('AdminGetFamilyMembersUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner les membres de la famille si elle existe', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      
      const mockMembers: FamilyMemberWithUser[] = [
        {
          id: 1, userId: 100, role: 'parent', est_responsable: true, est_tuteur_legal: true,
          first_name: 'John', last_name: 'Doe', date_of_birth: '1980-01-01', genre_id: 1,
          email: 'john@example.com', phone: '123456', est_mineur: false, date_ajout: new Date().toISOString()
        }
      ];
      mockRepo.getMembresByFamilleId.mockResolvedValue(mockMembers);

      // Act
      const result = await useCase.execute(10);

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(10);
      expect(mockRepo.getMembresByFamilleId).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockMembers);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si la famille n existe pas', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('Famille introuvable');
      expect(mockRepo.getMembresByFamilleId).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de findById', async () => {
      // Arrange
      mockRepo.findById.mockRejectedValue(new Error('DB error 1'));

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('DB error 1');
    });

    it('devrait lancer une erreur si le repository échoue lors de getMembresByFamilleId', async () => {
      // Arrange
      mockRepo.findById.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.getMembresByFamilleId.mockRejectedValue(new Error('DB error 2'));

      // Act & Assert
      await expect(useCase.execute(10)).rejects.toThrow('DB error 2');
    });

  });
});
