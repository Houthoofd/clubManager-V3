/**
 * IgnoreAlertUseCase.test.ts
 * Tests unitaires — alerts / IgnoreAlertUseCase
 */

import { IgnoreAlertUseCase } from '../IgnoreAlertUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { AlertUserDto } from '../../../domain/types';

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

let useCase: IgnoreAlertUseCase;

beforeEach(() => {
  useCase = new IgnoreAlertUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('IgnoreAlertUseCase', () => {
  describe('execute', () => {

    it('devrait ignorer l\'alerte avec succès', async () => {
      const mockAlert = { id: 1, statut: 'ignoree' } as AlertUserDto;
      mockRepo.ignoreAlert.mockResolvedValue(mockAlert);

      const result = await useCase.execute(1);

      expect(result).toEqual(mockAlert);
      expect(mockRepo.ignoreAlert).toHaveBeenCalledWith(1);
    });

    it("devrait lancer une erreur si l'identifiant est manquant", async () => {
      await expect(useCase.execute(undefined as unknown as number)).rejects.toThrow("L'identifiant de l'alerte est invalide");
    });

    it("devrait lancer une erreur si l'identifiant est <= 0", async () => {
      await expect(useCase.execute(0)).rejects.toThrow("L'identifiant de l'alerte est invalide");
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.ignoreAlert.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1)).rejects.toThrow('Repo error');
    });

  });
});
