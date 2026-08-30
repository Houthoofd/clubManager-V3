import { RemoveMemberFromGroupUseCase } from '../RemoveMemberFromGroupUseCase';
import type { IGroupRepository } from '../../../domain/repositories/IGroupRepository';
import type { RemoveMemberDto } from '../../../domain/types';

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

let useCase: RemoveMemberFromGroupUseCase;

beforeEach(() => {
  useCase = new RemoveMemberFromGroupUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RemoveMemberFromGroupUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer un membre du groupe', async () => {
      const input: RemoveMemberDto = { groupe_id: 1, user_id: 2 };
      mockRepo.removeMember.mockResolvedValue(undefined);

      await useCase.execute(input);

      expect(mockRepo.removeMember).toHaveBeenCalledWith(input);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      const input: RemoveMemberDto = { groupe_id: 1, user_id: 2 };
      mockRepo.removeMember.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });
  });
});
