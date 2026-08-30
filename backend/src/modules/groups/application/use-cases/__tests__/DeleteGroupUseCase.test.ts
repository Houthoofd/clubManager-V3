import { DeleteGroupUseCase } from '../DeleteGroupUseCase';
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

let useCase: DeleteGroupUseCase;

beforeEach(() => {
  useCase = new DeleteGroupUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DeleteGroupUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer un groupe existant', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.delete.mockResolvedValue(undefined);

      await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si le groupe est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(1)).rejects.toThrow('Groupe introuvable');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de la recherche', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue lors de la suppression', async () => {
      const mockGroup: Group = { id: 1, nom: 'Group 1' } as Group;
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.delete.mockRejectedValue(new Error('DB error delete'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error delete');
    });
  });
});
