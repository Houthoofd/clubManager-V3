import { DeleteGradeUseCase } from '../DeleteGradeUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';
import type { Grade } from '../../../domain/types';

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

let useCase: DeleteGradeUseCase;

beforeEach(() => {
  useCase = new DeleteGradeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DeleteGradeUseCase', () => {
  describe('execute', () => {
    it('devrait supprimer le grade avec succs', async () => {
      const existingGrade: Grade = { id: 1, nom: 'Test', ordre: 1, couleur: null };
      mockRepo.findById.mockResolvedValue(existingGrade);
      mockRepo.delete.mockResolvedValue();

      await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.delete).toHaveBeenCalledWith(1);
    });

    it('devrait lancer une erreur si le grade est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow("Grade introuvable");
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository findById Ǹchoue', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });

    it('devrait lancer une erreur si le repository delete Ǹchoue', async () => {
      const existingGrade: Grade = { id: 1, nom: 'Test', ordre: 1, couleur: null };
      mockRepo.findById.mockResolvedValue(existingGrade);
      mockRepo.delete.mockRejectedValue(new Error('DB delete error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB delete error');
    });
  });
});
