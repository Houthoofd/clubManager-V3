import { UpdateGroupUseCase } from '../UpdateGroupUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { Group, UpdateGroupDto } from '../../../domain/types';

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

let useCase: UpdateGroupUseCase;

beforeEach(() => {
  useCase = new UpdateGroupUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('UpdateGroupUseCase', () => {
  describe('execute', () => {
    it('devrait mettre à jour un groupe existant avec un nouveau nom', async () => {
      const mockGroup: Group = { id: 1, nom: 'Ancien Nom', description: 'Desc' } as Group;
      const expectedGroup: Group = { id: 1, nom: 'Nouveau Nom', description: 'Desc' } as Group;
      const input: UpdateGroupDto = { id: 1, nom: '  Nouveau Nom  ' };
      
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.update.mockResolvedValue(expectedGroup);

      const result = await useCase.execute(input);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith({ id: 1, nom: 'Nouveau Nom' });
      expect(result).toEqual(expectedGroup);
    });

    it('devrait mettre à jour un groupe existant sans changer le nom', async () => {
      const mockGroup: Group = { id: 1, nom: 'Nom', description: 'Desc' } as Group;
      const expectedGroup: Group = { id: 1, nom: 'Nom', description: 'Nouvelle Desc' } as Group;
      const input: UpdateGroupDto = { id: 1, description: 'Nouvelle Desc' };
      
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.update.mockResolvedValue(expectedGroup);

      const result = await useCase.execute(input);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith({ id: 1, description: 'Nouvelle Desc' });
      expect(result).toEqual(expectedGroup);
    });

    it('devrait lancer une erreur si le groupe est introuvable', async () => {
      const input: UpdateGroupDto = { id: 1, nom: 'Nouveau Nom' };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow('Groupe introuvable');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le nouveau nom fait moins de 2 caractères', async () => {
      const mockGroup: Group = { id: 1, nom: 'Ancien Nom', description: 'Desc' } as Group;
      const input: UpdateGroupDto = { id: 1, nom: ' A ' };
      
      mockRepo.findById.mockResolvedValue(mockGroup);

      await expect(useCase.execute(input)).rejects.toThrow('Le nom du groupe doit contenir au moins 2 caractères');
      
      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue lors de la recherche', async () => {
      const input: UpdateGroupDto = { id: 1, nom: 'Nouveau Nom' };
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository échoue lors de la mise à jour', async () => {
      const mockGroup: Group = { id: 1, nom: 'Ancien Nom', description: 'Desc' } as Group;
      const input: UpdateGroupDto = { id: 1, nom: 'Nouveau Nom' };
      
      mockRepo.findById.mockResolvedValue(mockGroup);
      mockRepo.update.mockRejectedValue(new Error('DB error update'));

      await expect(useCase.execute(input)).rejects.toThrow('DB error update');
    });
  });
});
