import { CreateGradeUseCase } from '../CreateGradeUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';
import type { CreateGradeDto, Grade } from '../../../domain/types';

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

let useCase: CreateGradeUseCase;

beforeEach(() => {
  useCase = new CreateGradeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateGradeUseCase', () => {
  describe('execute', () => {
    it('devrait retourner le résultat quand les données sont valides', async () => {
      const input: CreateGradeDto = { nom: 'Ceinture Noire', ordre: 1, couleur: '#000000' };
      const expected: Grade = { id: 1, nom: 'Ceinture Noire', ordre: 1, couleur: '#000000' };
      mockRepo.create.mockResolvedValue(expected);

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledWith({ nom: 'Ceinture Noire', ordre: 1, couleur: '#000000' });
      expect(result).toEqual(expected);
    });

    it('devrait retourner le résultat quand la couleur n\'est pas fournie', async () => {
      const input: CreateGradeDto = { nom: 'Ceinture Blanche', ordre: 0 };
      const expected: Grade = { id: 2, nom: 'Ceinture Blanche', ordre: 0, couleur: null };
      mockRepo.create.mockResolvedValue(expected);

      const result = await useCase.execute(input);

      expect(mockRepo.create).toHaveBeenCalledWith({ nom: 'Ceinture Blanche', ordre: 0, couleur: null });
      expect(result).toEqual(expected);
    });

    it('devrait lancer une erreur si le nom est manquant ou vide', async () => {
      await expect(useCase.execute({ nom: '   ', ordre: 1 })).rejects.toThrow("Le nom du grade est requis");
      await expect(useCase.execute({ ordre: 1 } as CreateGradeDto)).rejects.toThrow("Le nom du grade est requis");
    });

    it('devrait lancer une erreur si l\'ordre est manquant', async () => {
      await expect(useCase.execute({ nom: 'Test' } as CreateGradeDto)).rejects.toThrow("L'ordre du grade est requis");
      await expect(useCase.execute({ nom: 'Test', ordre: null as any })).rejects.toThrow("L'ordre du grade est requis");
    });

    it('devrait lancer une erreur si l\'ordre n\'est pas un entier positif', async () => {
      await expect(useCase.execute({ nom: 'Test', ordre: -1 })).rejects.toThrow("L'ordre doit être un entier supérieur ou égal à 0");
      await expect(useCase.execute({ nom: 'Test', ordre: 1.5 })).rejects.toThrow("L'ordre doit être un entier supérieur ou égal à 0");
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.create.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute({ nom: 'Test', ordre: 1 })).rejects.toThrow('DB error');
    });
  });
});
