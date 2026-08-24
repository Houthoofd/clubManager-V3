import { UpdateGradeUseCase } from '../UpdateGradeUseCase';
import type { IGradeRepository } from '../../../domain/repositories/IGradeRepository';
import type { UpdateGradeDto, Grade } from '../../../domain/types';

const mockRepo: jest.Mocked<IGradeRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

let useCase: UpdateGradeUseCase;

beforeEach(() => {
  useCase = new UpdateGradeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('UpdateGradeUseCase', () => {
  describe('execute', () => {
    it('devrait mettre à jour un grade existant', async () => {
      const input: UpdateGradeDto = { id: 1, nom: 'Nouveau', ordre: 2, couleur: '#111' };
      const existingGrade: Grade = { id: 1, nom: 'Ancien', ordre: 1, couleur: null };
      const updatedGrade: Grade = { id: 1, nom: 'Nouveau', ordre: 2, couleur: '#111' };
      
      mockRepo.findById.mockResolvedValue(existingGrade);
      mockRepo.update.mockResolvedValue(updatedGrade);

      const result = await useCase.execute(input);

      expect(mockRepo.findById).toHaveBeenCalledWith(1);
      expect(mockRepo.update).toHaveBeenCalledWith(input);
      expect(result).toEqual(updatedGrade);
    });

    it('devrait mettre à jour en trimant le nom', async () => {
      const input: UpdateGradeDto = { id: 1, nom: '  Trimmed  ' };
      const existingGrade: Grade = { id: 1, nom: 'Ancien', ordre: 1, couleur: null };
      const updatedGrade: Grade = { id: 1, nom: 'Trimmed', ordre: 1, couleur: null };
      
      mockRepo.findById.mockResolvedValue(existingGrade);
      mockRepo.update.mockResolvedValue(updatedGrade);

      const result = await useCase.execute(input);

      expect(mockRepo.update).toHaveBeenCalledWith({ id: 1, nom: 'Trimmed' });
      expect(result).toEqual(updatedGrade);
    });

    it('devrait lancer une erreur si le nom fourni est vide', async () => {
      const input: UpdateGradeDto = { id: 1, nom: '   ' };
      await expect(useCase.execute(input)).rejects.toThrow("Le nom du grade est requis");
    });

    it('devrait lancer une erreur si l\'ordre fourni est négatif ou non entier', async () => {
      await expect(useCase.execute({ id: 1, ordre: -1 })).rejects.toThrow("L'ordre doit être un entier >= 0");
      await expect(useCase.execute({ id: 1, ordre: 1.5 })).rejects.toThrow("L'ordre doit être un entier >= 0");
    });

    it('devrait lancer une erreur si le grade est introuvable', async () => {
      const input: UpdateGradeDto = { id: 999 };
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(input)).rejects.toThrow("Grade introuvable");
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      const input: UpdateGradeDto = { id: 1 };
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(input)).rejects.toThrow('DB error');
    });
  });
});
