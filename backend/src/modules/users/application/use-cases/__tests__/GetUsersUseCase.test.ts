/**
 * GetUsersUseCase.test.ts
 * Tests unitaires — users / GetUsersUseCase
 */

import { GetUsersUseCase } from '../GetUsersUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { GetUsersQueryDto, PaginatedUsersResponseDto } from '@clubmanager/types';

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findProfile: jest.fn(),
  updateRole: jest.fn(),
  updateStatus: jest.fn(),
  updateLanguage: jest.fn(),
  updateProfile: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findDeleted: jest.fn(),
  anonymize: jest.fn(),
  updateSubscription: jest.fn(),
} as jest.Mocked<IUserRepository>;

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  beforeEach(() => {
    useCase = new GetUsersUseCase(mockRepo);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait utiliser les valeurs par défaut si page et limit ne sont pas fournis', async () => {
      const mockResult: PaginatedUsersResponseDto = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      mockRepo.findAll.mockResolvedValue(mockResult);

      const query: GetUsersQueryDto = {};
      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result).toEqual(mockResult);
    });

    it('devrait contraindre la page à 1 minimum', async () => {
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });

      const query: GetUsersQueryDto = { page: -5, limit: 10 };
      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('devrait contraindre la limit entre 1 et 100', async () => {
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 1, totalPages: 0 });

      await useCase.execute({ page: 2, limit: 0 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 1 });

      await useCase.execute({ page: 2, limit: 150 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 100 });
    });

    it('devrait utiliser les valeurs fournies si elles sont valides', async () => {
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 2, limit: 50, totalPages: 0 });

      await useCase.execute({ page: 2, limit: 50 });
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 50 });
    });
  });
});
