/**
 * AssignProfessorToCourseUseCase.test.ts
 * Tests unitaires — courses / AssignProfessorToCourseUseCase
 */

import { AssignProfessorToCourseUseCase } from '../AssignProfessorToCourseUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';

const mockRepo = {
  getCourseRecurrentById: jest.fn(),
  getProfessorById: jest.fn(),
  assignProfessor: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: AssignProfessorToCourseUseCase;

beforeEach(() => {
  useCase = new AssignProfessorToCourseUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('AssignProfessorToCourseUseCase', () => {
  describe('execute', () => {
    it('devrait assigner le professeur avec succès', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue({ id: 1 } as any);
      mockRepo.getProfessorById.mockResolvedValue({ id: 2 } as any);
      mockRepo.assignProfessor.mockResolvedValue();

      await useCase.execute(1, 2);

      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.getProfessorById).toHaveBeenCalledWith(2);
      expect(mockRepo.assignProfessor).toHaveBeenCalledWith(1, 2);
    });

    it('devrait lancer une erreur si le cours n\'existe pas', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue(null);

      await expect(useCase.execute(1, 2)).rejects.toThrow('Cours récurrent introuvable');
      
      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.getProfessorById).not.toHaveBeenCalled();
      expect(mockRepo.assignProfessor).not.toHaveBeenCalled();
    });

    it('devrait lancer une erreur si le professeur n\'existe pas', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue({ id: 1 } as any);
      mockRepo.getProfessorById.mockResolvedValue(null);

      await expect(useCase.execute(1, 2)).rejects.toThrow('Professeur introuvable');
      
      expect(mockRepo.getCourseRecurrentById).toHaveBeenCalledWith(1);
      expect(mockRepo.getProfessorById).toHaveBeenCalledWith(2);
      expect(mockRepo.assignProfessor).not.toHaveBeenCalled();
    });

    it('devrait relayer l\'erreur si le repository échoue lors de l\'assignation', async () => {
      mockRepo.getCourseRecurrentById.mockResolvedValue({ id: 1 } as any);
      mockRepo.getProfessorById.mockResolvedValue({ id: 2 } as any);
      mockRepo.assignProfessor.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 2)).rejects.toThrow('DB error');
    });
  });
});
