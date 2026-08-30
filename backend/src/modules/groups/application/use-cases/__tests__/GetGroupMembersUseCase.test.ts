import { GetGroupMembersUseCase } from '../GetGroupMembersUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { Group, GroupMember } from '../../../domain/types';

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

let useCase: GetGroupMembersUseCase;

beforeEach(() => {
  useCase = new GetGroupMembersUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetGroupMembersUseCase', () => {
  describe('execute', () => {
    it('devrait retourner les membres du groupe', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      const mockMembers: GroupMember[] = [{ user_id: 2, role: 'member' } as GroupMember];
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.getMembers.mockResolvedValue(mockMembers);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.getMembers).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMembers);
    });

    it('devrait lancer une erreur si le groupe est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(1)).rejects.toThrow('Groupe introuvable');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.getMembers).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de la vérification du groupe', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue lors de la récupération des membres', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.getMembers.mockRejectedValue(new Error('DB error members'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error members');
    });
  });
});
