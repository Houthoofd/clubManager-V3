import { GetGradesUseCase } from '../GetGradesUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';
import type { Grade } from '../../../domain/types';

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

let useCase: GetGradesUseCase;

beforeEach(() => {
  useCase = new GetGradesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetGradesUseCase', () => {
  describe('execute', () => {
    it('devrait retourner la liste des grades', async () => {
      const grades: Grade[] = [
        { id: 1, nom: 'Test', ordre: 1, couleur: null },
        { id: 2, nom: 'Test 2', ordre: 2, couleur: '#fff' }
      ];
      mockRepo.findAll.mockResolvedValue(grades);

      const result = await useCase.execute();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(grades);
    });

    it('devrait lancer une erreur si le repository Ǹchoue', async () => {
      mockRepo.findAll.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute()).rejects.toThrow('DB error');
    });
  });
});
