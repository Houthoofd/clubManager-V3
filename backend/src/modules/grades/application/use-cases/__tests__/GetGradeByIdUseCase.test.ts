import { GetGradeByIdUseCase } from '../GetGradeByIdUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';
import type { Grade } from '../../../domain/types';

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

let useCase: GetGradeByIdUseCase;

beforeEach(() => {
  useCase = new GetGradeByIdUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetGradeByIdUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le grade si trouvǸ', async () => {
      const grade: Grade = { id: 1, nom: 'Test', ordre: 1, couleur: null };
      mockRepo.findById.mockResolvedValue(grade);

      const result = await useCase.execute(1);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(grade);
    });

    it('devrait lancer une erreur si le grade est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(999)).rejects.toThrow("Grade introuvable");
      expect(mockRepo.findById).toHaveBeenCalledWith(999);
    });

    it('devrait lancer une erreur si le repository Ǹchoue', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
