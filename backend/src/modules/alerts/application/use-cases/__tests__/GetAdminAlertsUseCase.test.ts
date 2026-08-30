/**
 * GetAdminAlertsUseCase.test.ts
 * Tests unitaires — alerts / GetAdminAlertsUseCase
 */

import { GetAdminAlertsUseCase } from '../GetAdminAlertsUseCase';
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

let useCase: GetAdminAlertsUseCase;

beforeEach(() => {
  useCase = new GetAdminAlertsUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('GetAdminAlertsUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le résultat sans filtres', async () => {
      const expectedOutput: AlertUserDto[] = [];
      mockRepo.findAllActiveAlerts.mockResolvedValue(expectedOutput);

      const result = await useCase.execute();

      expect(result).toBe(expectedOutput);
      expect(mockRepo.findAllActiveAlerts).toHaveBeenCalledWith(undefined);
    });

    it('devrait retourner le résultat avec filtres', async () => {
      const filters = { priorite: 'haute' as const, statut: 'nouveau' as const, userId: 1 };
      const expectedOutput: AlertUserDto[] = [];
      mockRepo.findAllActiveAlerts.mockResolvedValue(expectedOutput);

      const result = await useCase.execute(filters);

      expect(result).toBe(expectedOutput);
      expect(mockRepo.findAllActiveAlerts).toHaveBeenCalledWith(filters);
    });

    it('devrait remonter les erreurs du repository', async () => {
      mockRepo.findAllActiveAlerts.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute()).rejects.toThrow('Repo error');
    });

  });
});
