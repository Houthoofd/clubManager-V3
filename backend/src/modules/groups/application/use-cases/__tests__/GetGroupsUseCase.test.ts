import { GetGroupsUseCase } from '../GetGroupsUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { GetGroupsQuery, PaginatedGroupsResponse, Group } from '../../../domain/types';

const mockRepo: jest.Mocked<IGroupRepository> = {
  findAll:        jest.fn(),
  findById:       jest.fn(),
  create:         jest.fn(),
  update:         jest.fn(),
  delete:         jest.fn(),
  getMembers:     jest.fn(),
  addMember:      jest.fn(),
  removeMember:   jest.fn(),
  isMember:       jest.fn(),
};

let useCase: GetGroupsUseCase;

beforeEach(() => {
  useCase = new GetGroupsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetGroupsUseCase', () => {
  describe('execute', () => {
    it('devrait retourner les groupes paginés avec les valeurs par défaut pour page et limit', async () => {
      const query: GetGroupsQuery = {};
      const expectedResponse: PaginatedGroupsResponse = {
        data: [{ id: 1, nom: 'Group 1' } as Group],
        total: 1,
        page: 1,
        limit: 20
      };
      
      mockRepo.findAll.mockResolvedValue(expectedResponse);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
      expect(result).toEqual(expectedResponse);
    });

    it('devrait utiliser les paramètres page et limit fournis', async () => {
      const query: GetGroupsQuery = { page: 2, limit: 10 };
      const expectedResponse: PaginatedGroupsResponse = {
        data: [],
        total: 0,
        page: 2,
        limit: 10
      };
      
      mockRepo.findAll.mockResolvedValue(expectedResponse);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 10 });
      expect(result).toEqual(expectedResponse);
    });

    it('devrait limiter la page à un minimum de 1', async () => {
      const query: GetGroupsQuery = { page: 0, limit: 10 };
      const expectedResponse: PaginatedGroupsResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10
      };
      
      mockRepo.findAll.mockResolvedValue(expectedResponse);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('devrait limiter limit à un minimum de 1 et maximum de 100', async () => {
      const queryMin: GetGroupsQuery = { page: 1, limit: 0 };
      const queryMax: GetGroupsQuery = { page: 1, limit: 150 };
      
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 1 });

      await useCase.execute(queryMin);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });

      await useCase.execute(queryMax);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });
    });

    it('devrait passer le reste des paramètres de recherche', async () => {
      const query: GetGroupsQuery = { search: 'test', page: 1, limit: 10 };
      
      mockRepo.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 });

      await useCase.execute(query);
      expect(mockRepo.findAll).toHaveBeenCalledWith({ search: 'test', page: 1, limit: 10 });
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      const query: GetGroupsQuery = { page: 1, limit: 10 };
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(query)).rejects.toThrow('DB error');
    });
  });
});
