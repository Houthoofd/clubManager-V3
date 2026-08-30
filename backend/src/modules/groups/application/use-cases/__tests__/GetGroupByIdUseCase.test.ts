import { GetGroupByIdUseCase } from '../GetGroupByIdUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { Group } from '../../../domain/types';

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

let useCase: GetGroupByIdUseCase;

beforeEach(() => {
  useCase = new GetGroupByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetGroupByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le groupe si le groupe existe', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGroup);
    });

    it('devrait lancer une erreur si le groupe est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(1)).rejects.toThrow('Groupe introuvable');
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
