/**
 * GetMyFamilyUseCase.test.ts
 * Tests unitaires — families / GetMyFamilyUseCase
 */

import { GetMyFamilyUseCase } from '../GetMyFamilyUseCase';
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

let useCase: GetMyFamilyUseCase;

beforeEach(() => {
  useCase = new GetMyFamilyUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('GetMyFamilyUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait retourner null si l utilisateur n a pas de famille', async () => {
      // Arrange
      mockRepo.findFamilleByUserId.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(mockRepo.findFamilleByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: "Aucune famille trouvée",
        data: null,
      });
      expect(mockRepo.getMembresByFamilleId).not.toHaveBeenCalled();
    });

    it('devrait retourner la famille et ses membres si elle existe (dates comme objets Date)', async () => {
      // Arrange
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10, nom: 'Doe Family', created_at: new Date(), updated_at: new Date() });
      
      const dob = new Date('2010-01-01T00:00:00.000Z');
      const dateAjout = new Date('2023-01-01T00:00:00.000Z');
      
      const mockMembers = [{
        user: { id: 100, userId: 100, first_name: 'John', last_name: 'Doe', date_of_birth: dob, genre_id: 1, est_mineur: true },
        role: 'enfant', est_responsable: false, est_tuteur_legal: false, date_ajout: dateAjout
      }];
      mockRepo.getMembresByFamilleId.mockResolvedValue(mockMembers as any);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(mockRepo.findFamilleByUserId).toHaveBeenCalledWith(1);
      expect(mockRepo.getMembresByFamilleId).toHaveBeenCalledWith(10);
      expect(result.success).toBe(true);
      expect(result.data?.famille_id).toBe(10);
      expect(result.data?.nom).toBe('Doe Family');
      expect(result.data?.membres).toHaveLength(1);
      expect(result.data?.membres[0].date_of_birth).toBe('2010-01-01');
      expect(result.data?.membres[0].date_ajout).toBe(dateAjout.toISOString());
    });

    it('devrait retourner la famille et ses membres si elle existe (dates comme strings)', async () => {
      // Arrange
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10, nom: null, created_at: new Date(), updated_at: new Date() });
      
      const mockMembers = [{
        user: { id: 100, userId: 100, first_name: 'John', last_name: 'Doe', date_of_birth: '2010-01-01T00:00:00.000Z', genre_id: 1, est_mineur: true },
        role: 'enfant', est_responsable: false, est_tuteur_legal: false, date_ajout: '2023-01-01T00:00:00.000Z'
      }];
      mockRepo.getMembresByFamilleId.mockResolvedValue(mockMembers as any);

      // Act
      const result = await useCase.execute(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.famille_id).toBe(10);
      expect(result.data?.nom).toBeNull();
      expect(result.data?.membres[0].date_of_birth).toBe('2010-01-01');
      expect(result.data?.membres[0].date_ajout).toBe(new Date('2023-01-01T00:00:00.000Z').toISOString());
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si findFamilleByUserId échoue', async () => {
      // Arrange
      mockRepo.findFamilleByUserId.mockRejectedValue(new Error('DB error 1'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error 1');
    });

    it('devrait lancer une erreur si getMembresByFamilleId échoue', async () => {
      // Arrange
      mockRepo.findFamilleByUserId.mockResolvedValue({ id: 10, created_at: new Date(), updated_at: new Date() });
      mockRepo.getMembresByFamilleId.mockRejectedValue(new Error('DB error 2'));

      // Act & Assert
      await expect(useCase.execute(1)).rejects.toThrow('DB error 2');
    });

  });
});
