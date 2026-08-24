/**
 * GetFamiliesUseCase.test.ts
 * Tests unitaires — families / GetFamiliesUseCase
 */

import { GetFamiliesUseCase } from '../GetFamiliesUseCase';
import type { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';
import type { GetFamiliesQuery, PaginatedFamiliesResponse } from '../../../domain/adminTypes';

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

let useCase: GetFamiliesUseCase;

beforeEach(() => {
  useCase = new GetFamiliesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('GetFamiliesUseCase', () => {
  describe('execute', () => {

    const mockResponse: PaginatedFamiliesResponse = {
      data: [{ id: 1, created_at: new Date(), updated_at: new Date(), membre_count: 2 }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1
    };

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait utiliser les valeurs par défaut pour page et limit si non fournis', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue(mockResponse);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result).toEqual(mockResponse);
    });

    it('devrait appliquer Math.max pour page et limit', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue(mockResponse);

      // Act
      await useCase.execute({ page: -5, limit: 0 });

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });
    });

    it('devrait appliquer Math.min pour limit au maximum 100', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue(mockResponse);

      // Act
      await useCase.execute({ page: 2, limit: 150 });

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 100 });
    });

    it('devrait transmettre les autres paramètres de requête', async () => {
      // Arrange
      mockRepo.findAll.mockResolvedValue(mockResponse);
      const query: GetFamiliesQuery = { page: 3, limit: 15, search: 'Doe', sortBy: 'created_at', sortOrder: 'desc' };

      // Act
      await useCase.execute(query);

      // Assert
      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      // Arrange
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow('DB error');
    });

  });
});
