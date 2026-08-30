/**
 * GetAlertTypesUseCase.test.ts
 * Tests unitaires — alerts / GetAlertTypesUseCase
 */

import { GetAlertTypesUseCase } from '../GetAlertTypesUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { AlertTypeDto } from '../../../domain/types';

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

let useCase: GetAlertTypesUseCase;

beforeEach(() => {
  useCase = new GetAlertTypesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetAlertTypesUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les types d\'alertes sans filtre', async () => {
      mockRepo.findAllAlertTypes.mockResolvedValue([]);
      const result = await useCase.execute();
      expect(result).toEqual([]);
      expect(mockRepo.findAllAlertTypes).toHaveBeenCalledWith(undefined);
    });

    it('devrait retourner les types d\'alertes avec filtre onlyActive', async () => {
      mockRepo.findAllAlertTypes.mockResolvedValue([]);
      const result = await useCase.execute(true);
      expect(result).toEqual([]);
      expect(mockRepo.findAllAlertTypes).toHaveBeenCalledWith(true);
    });

    it('devrait remonter les erreurs du repository', async () => {
      mockRepo.findAllAlertTypes.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute()).rejects.toThrow('Repo error');
    });

  });
});
