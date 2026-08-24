/**
 * GetAlertActionsUseCase.test.ts
 * Tests unitaires — alerts / GetAlertActionsUseCase
 */

import { GetAlertActionsUseCase } from '../GetAlertActionsUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';

const mockRepo: jest.Mocked<IAlertRepository> = {
  findAllAlertTypes:     jest.fn(),
  findAlertTypeById:     jest.fn(),
  findAlertTypeByCode:   jest.fn(),
  createAlertType:       jest.fn(),
  updateAlertType:       jest.fn(),
  deleteAlertType:       jest.fn(),
  findUserAlerts:        jest.fn(),
  findAllActiveAlerts:   jest.fn(),
  createUserAlert:       jest.fn(),
  resolveAlert:          jest.fn(),
  ignoreAlert:           jest.fn(),
  findAlertActions:      jest.fn(),
  addAlertAction:        jest.fn(),
} as unknown as jest.Mocked<IAlertRepository>;

let useCase: GetAlertActionsUseCase;

beforeEach(() => {
  useCase = new GetAlertActionsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetAlertActionsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner la liste des actions', async () => {
      mockRepo.findAlertActions.mockResolvedValue([]);
      const result = await useCase.execute(1);
      expect(result).toEqual([]);
      expect(mockRepo.findAlertActions).toHaveBeenCalledWith(1);
    });

    it("devrait lancer une erreur si l'identifiant est manquant", async () => {
      await expect(useCase.execute(undefined as unknown as number)).rejects.toThrow("L'identifiant de l'alerte est invalide");
    });

    it("devrait lancer une erreur si l'identifiant est <= 0", async () => {
      await expect(useCase.execute(0)).rejects.toThrow("L'identifiant de l'alerte est invalide");
      await expect(useCase.execute(-1)).rejects.toThrow("L'identifiant de l'alerte est invalide");
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.findAlertActions.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1)).rejects.toThrow('Repo error');
    });

  });
});
