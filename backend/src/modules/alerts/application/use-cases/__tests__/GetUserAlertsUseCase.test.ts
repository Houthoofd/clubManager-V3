/**
 * GetUserAlertsUseCase.test.ts
 * Tests unitaires — alerts / GetUserAlertsUseCase
 */

import { GetUserAlertsUseCase } from '../GetUserAlertsUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { AlertStatut } from '../../../domain/types';

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

let useCase: GetUserAlertsUseCase;

beforeEach(() => {
  useCase = new GetUserAlertsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetUserAlertsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les alertes de l\'utilisateur sans statut', async () => {
      mockRepo.findUserAlerts.mockResolvedValue([]);
      const result = await useCase.execute(1);
      expect(result).toEqual([]);
      expect(mockRepo.findUserAlerts).toHaveBeenCalledWith(1, undefined);
    });

    it('devrait retourner les alertes de l\'utilisateur avec statut', async () => {
      mockRepo.findUserAlerts.mockResolvedValue([]);
      const result = await useCase.execute(1, 'active');
      expect(result).toEqual([]);
      expect(mockRepo.findUserAlerts).toHaveBeenCalledWith(1, 'active');
    });

    it("devrait lancer une erreur si l'identifiant est invalide (<= 0)", async () => {
      await expect(useCase.execute(0)).rejects.toThrow("L'identifiant de l'utilisateur est invalide");
    });

    it("devrait lancer une erreur si l'identifiant est manquant", async () => {
      await expect(useCase.execute(undefined as unknown as number)).rejects.toThrow("L'identifiant de l'utilisateur est invalide");
    });

    it("devrait lancer une erreur si le statut est invalide", async () => {
      await expect(useCase.execute(1, 'invalide' as AlertStatut)).rejects.toThrow(/Statut invalide/);
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.findUserAlerts.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1)).rejects.toThrow('Repo error');
    });

  });
});
