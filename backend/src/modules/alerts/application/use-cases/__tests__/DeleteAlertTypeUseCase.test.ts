/**
 * DeleteAlertTypeUseCase.test.ts
 * Tests unitaires — alerts / DeleteAlertTypeUseCase
 */

import { DeleteAlertTypeUseCase } from '../DeleteAlertTypeUseCase';
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

let useCase: DeleteAlertTypeUseCase;

beforeEach(() => {
  useCase = new DeleteAlertTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('DeleteAlertTypeUseCase', () => {
  describe('execute', () => {

    it('devrait retourner true si la suppression réussit', async () => {
      mockRepo.deleteAlertType.mockResolvedValue(true);
      const result = await useCase.execute(1);
      expect(result).toBe(true);
      expect(mockRepo.deleteAlertType).toHaveBeenCalledWith(1);
    });

    it('devrait retourner false si la suppression échoue (ex: introuvable)', async () => {
      mockRepo.deleteAlertType.mockResolvedValue(false);
      const result = await useCase.execute(2);
      expect(result).toBe(false);
      expect(mockRepo.deleteAlertType).toHaveBeenCalledWith(2);
    });

    it("devrait lancer une erreur si l'identifiant est manquant", async () => {
      await expect(useCase.execute(undefined as unknown as number)).rejects.toThrow("L'identifiant du type d'alerte est invalide");
    });

    it("devrait lancer une erreur si l'identifiant est <= 0", async () => {
      await expect(useCase.execute(0)).rejects.toThrow("L'identifiant du type d'alerte est invalide");
      await expect(useCase.execute(-1)).rejects.toThrow("L'identifiant du type d'alerte est invalide");
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.deleteAlertType.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1)).rejects.toThrow('Repo error');
    });

  });
});
