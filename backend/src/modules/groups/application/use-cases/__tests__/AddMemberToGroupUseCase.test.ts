import { AddMemberToGroupUseCase } from '../AddMemberToGroupUseCase';
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

let useCase: AddMemberToGroupUseCase;

beforeEach(() => {
  useCase = new AddMemberToGroupUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AddMemberToGroupUseCase', () => {
  describe('execute', () => {
    it('devrait ajouter un membre si le groupe existe et que l\'utilisateur n\'est pas membre', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.isMember.mockResolvedValue(false);
      mockRepo.addMember.mockResolvedValue(undefined);

      await useCase.execute(1, 2);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.isMember).toHaveBeenCalledWith(1, 2);
      expect(mockRepo.addMember).toHaveBeenCalledWith({ groupe_id: 1, user_id: 2 });
    });

    it('devrait lancer une erreur si le groupe est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(1, 2)).rejects.toThrow('Groupe introuvable');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.isMember).not.toHaveBeenCalled();
      expect(mockRepo.addMember).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si l\'utilisateur est déjà membre', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.isMember.mockResolvedValue(true);

      await expect(useCase.execute(1, 2)).rejects.toThrow('Cet utilisateur est déjà membre de ce groupe');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.isMember).toHaveBeenCalledWith(1, 2);
      expect(mockRepo.addMember).not.toHaveBeenCalled();
    });
    
    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 2)).rejects.toThrow('DB error');
    });
  });
});
