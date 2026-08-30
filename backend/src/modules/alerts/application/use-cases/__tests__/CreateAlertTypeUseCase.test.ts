/**
 * CreateAlertTypeUseCase.test.ts
 * Tests unitaires — alerts / CreateAlertTypeUseCase
 */

import { CreateAlertTypeUseCase } from '../CreateAlertTypeUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { CreateAlertTypeDto, AlertTypeDto, AlertPriorite } from '../../../domain/types';

// ─── Mock Repository ────────────────────────────────────────────

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

// ─── Setup ────────────────────────────────────────────────────

let useCase: CreateAlertTypeUseCase;

beforeEach(() => {
  useCase = new CreateAlertTypeUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('CreateAlertTypeUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      const input: CreateAlertTypeDto = {
        code: ' NEW_CODE ',
        nom: ' Nouveau Type ',
        description: ' Description test ',
        priorite: 'haute',
        actif: false
      };
      const expectedOutput: AlertTypeDto = {
        id: 1,
        code: 'NEW_CODE',
        nom: 'Nouveau Type',
        description: 'Description test',
        priorite: 'haute',
        actif: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockRepo.findAlertTypeByCode.mockResolvedValue(null);
      mockRepo.createAlertType.mockResolvedValue(expectedOutput);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockRepo.findAlertTypeByCode).toHaveBeenCalledWith('NEW_CODE');
      expect(mockRepo.createAlertType).toHaveBeenCalledWith({
        code: 'NEW_CODE',
        nom: 'Nouveau Type',
        description: 'Description test',
        priorite: 'haute',
        actif: false
      });
    });

    it('devrait utiliser les valeurs par défaut si optionnelles non fournies', async () => {
      // Arrange
      const input: CreateAlertTypeDto = {
        code: 'CODE2',
        nom: 'Nom 2'
      };
      const expectedOutput: AlertTypeDto = {
        id: 2,
        code: 'CODE2',
        nom: 'Nom 2',
        description: null,
        priorite: 'normale',
        actif: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockRepo.findAlertTypeByCode.mockResolvedValue(null);
      mockRepo.createAlertType.mockResolvedValue(expectedOutput);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockRepo.createAlertType).toHaveBeenCalledWith({
        code: 'CODE2',
        nom: 'Nom 2',
        description: undefined,
        priorite: 'normale',
        actif: true
      });
    });

    it("devrait lancer une erreur si le code est manquant", async () => {
      const input = { nom: 'Nom' } as CreateAlertTypeDto;
      await expect(useCase.execute(input)).rejects.toThrow("Le code du type d'alerte est requis");
    });

    it("devrait lancer une erreur si le code est vide", async () => {
      const input = { code: '   ', nom: 'Nom' } as CreateAlertTypeDto;
      await expect(useCase.execute(input)).rejects.toThrow("Le code du type d'alerte est requis");
    });

    it("devrait lancer une erreur si le nom est manquant", async () => {
      const input = { code: 'CODE' } as CreateAlertTypeDto;
      await expect(useCase.execute(input)).rejects.toThrow("Le nom du type d'alerte est requis");
    });

    it("devrait lancer une erreur si le nom est vide", async () => {
      const input = { code: 'CODE', nom: '  ' } as CreateAlertTypeDto;
      await expect(useCase.execute(input)).rejects.toThrow("Le nom du type d'alerte est requis");
    });

    it("devrait lancer une erreur si la priorité est invalide", async () => {
      const input = { code: 'CODE', nom: 'Nom', priorite: 'invalide' as AlertPriorite } as CreateAlertTypeDto;
      await expect(useCase.execute(input)).rejects.toThrow(/Priorité invalide/);
    });

    it("devrait lancer une erreur si le code existe déjà", async () => {
      const input: CreateAlertTypeDto = { code: 'EXISTING', nom: 'Nom' };
      mockRepo.findAlertTypeByCode.mockResolvedValue({ id: 1, code: 'EXISTING', nom: 'Old', priorite: 'normale', actif: true, created_at: new Date(), updated_at: new Date(), description: null });
      await expect(useCase.execute(input)).rejects.toThrow(`Un type d'alerte avec le code "EXISTING" existe déjà`);
    });

    it('devrait remonter les erreurs du repository', async () => {
      const input: CreateAlertTypeDto = { code: 'CODE', nom: 'Nom' };
      mockRepo.findAlertTypeByCode.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(input)).rejects.toThrow('Repo error');
    });

  });
});
