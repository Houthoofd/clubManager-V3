/**
 * UpdateAlertTypeUseCase.test.ts
 * Tests unitaires — alerts / UpdateAlertTypeUseCase
 */

import { UpdateAlertTypeUseCase } from '../UpdateAlertTypeUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { UpdateAlertTypeDto, AlertTypeDto, AlertPriorite } from '../../../domain/types';

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

let useCase: UpdateAlertTypeUseCase;

beforeEach(() => {
  useCase = new UpdateAlertTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('UpdateAlertTypeUseCase', () => {
  describe('execute', () => {

    it('devrait mettre à jour avec succès', async () => {
      const data: UpdateAlertTypeDto = { nom: 'Nouveau', priorite: 'haute' };
      const expectedOutput = { id: 1, ...data } as AlertTypeDto;
      mockRepo.findAlertTypeById.mockResolvedValue({ id: 1 } as AlertTypeDto);
      mockRepo.updateAlertType.mockResolvedValue(expectedOutput);

      const result = await useCase.execute(1, data);

      expect(result).toEqual(expectedOutput);
      expect(mockRepo.updateAlertType).toHaveBeenCalledWith(1, data);
    });

    it("devrait lancer une erreur si l'identifiant est invalide", async () => {
      await expect(useCase.execute(0, {})).rejects.toThrow("L'identifiant du type d'alerte est invalide");
    });

    it("devrait lancer une erreur si la priorité est invalide", async () => {
      await expect(useCase.execute(1, { priorite: 'invalide' as AlertPriorite })).rejects.toThrow(/Priorité invalide/);
    });

    it("devrait lancer une erreur si le nom est vide", async () => {
      await expect(useCase.execute(1, { nom: '   ' })).rejects.toThrow("Le nom du type d'alerte ne peut pas être vide");
    });

    it("devrait lancer une erreur si le type d'alerte est introuvable", async () => {
      mockRepo.findAlertTypeById.mockResolvedValue(null);
      await expect(useCase.execute(1, {})).rejects.toThrow("Type d'alerte introuvable (id: 1)");
    });

    it("devrait remonter les erreurs du repository", async () => {
      mockRepo.findAlertTypeById.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(1, {})).rejects.toThrow('Repo error');
    });

  });
});
