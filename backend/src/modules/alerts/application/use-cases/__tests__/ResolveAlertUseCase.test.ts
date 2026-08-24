/**
 * ResolveAlertUseCase.test.ts
 * Tests unitaires — alerts / ResolveAlertUseCase
 */

import { ResolveAlertUseCase } from '../ResolveAlertUseCase';
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

let useCase: ResolveAlertUseCase;

beforeEach(() => {
  useCase = new ResolveAlertUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('ResolveAlertUseCase', () => {
  describe('execute', () => {

    it('devrait résoudre l\'alerte avec succès', async () => {
      const mockAlert = { id: 1, statut: 'resolue' } as AlertUserDto;
      mockRepo.resolveAlert.mockResolvedValue(mockAlert);

      const result = await useCase.execute(1, 2, 'notes');

      expect(result).toEqual(mockAlert);
      expect(mockRepo.resolveAlert).toHaveBeenCalledWith(1, 2, 'notes');
    });

    it('devrait résoudre l\'alerte avec succès sans notes', async () => {
      const mockAlert = { id: 1, statut: 'resolue' } as AlertUserDto;
      mockRepo.resolveAlert.mockResolvedValue(mockAlert);

      const result = await useCase.execute(1, 2);

      expect(result).toEqual(mockAlert);
      expect(mockRepo.resolveAlert).toHaveBeenCalledWith(1, 2, undefined);
    });

    it("devrait lancer une erreur si l'identifiant de l'alerte est invalide", async () => {
      await expect(useCase.execute(0, 2)).rejects.toThrow("L'identifiant de l'alerte est invalide");
    });

    it("devrait lancer une erreur si l'identifiant du résolveur est invalide", async () => {
      await expect(useCase.execute(1, 0)).rejects.toThrow("L'identifiant du résolveur est requis");
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.resolveAlert.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1, 2)).rejects.toThrow('Repo error');
    });

  });
});
