import { CreateGroupUseCase } from '../CreateGroupUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { Group, CreateGroupDto } from '../../../domain/types';

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

let useCase: CreateGroupUseCase;

beforeEach(() => {
  useCase = new CreateGroupUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateGroupUseCase', () => {
  describe('execute', () => {
    it('devrait créer un groupe avec des données valides', async () => {
      const input: CreateGroupDto = { nom: 'Group 1', description: 'Desc' };
      const expectedGroup: Group = { id: 1, nom: 'Group 1', description: 'Desc' } as Group;
      
      mockRepo.create.mockResolvedValue(expectedGroup);

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledWith({ nom: 'Group 1', description: 'Desc' });
      expect(result).toEqual(expectedGroup);
    });

    it('devrait créer un groupe sans description', async () => {
      const input: CreateGroupDto = { nom: 'Group 1' };
      const expectedGroup: Group = { id: 1, nom: 'Group 1', description: null } as Group;
      
      mockRepo.create.mockResolvedValue(expectedGroup);

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledWith({ nom: 'Group 1', description: null });
      expect(result).toEqual(expectedGroup);
    });

    it('devrait lancer une erreur si le nom est manquant', async () => {
      const input = { description: 'Desc' } as CreateGroupDto;

      await expect(useCase.execute(input)).rejects.toThrow('Le nom du groupe est requis');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le nom est vide après trim', async () => {
      const input: CreateGroupDto = { nom: '   ' };

      await expect(useCase.execute(input)).rejects.toThrow('Le nom du groupe est requis');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le nom fait moins de 2 caractères', async () => {
      const input: CreateGroupDto = { nom: 'A' };

      await expect(useCase.execute(input)).rejects.toThrow('Le nom du groupe doit contenir au moins 2 caractères');
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      const input: CreateGroupDto = { nom: 'Group 1' };
      mockRepo.create.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });
  });
});
