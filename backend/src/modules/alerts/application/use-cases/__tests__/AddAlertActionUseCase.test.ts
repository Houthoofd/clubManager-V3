/**
 * AddAlertActionUseCase.test.ts
 * Tests unitaires — alerts / AddAlertActionUseCase
 */

import { AddAlertActionUseCase } from '../AddAlertActionUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { CreateAlertActionDto, AlertActionDto, AlertActionType } from '../../../domain/types';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IAlertRepository> = {
  findAllAlertTypes:     jest.fn().mockResolvedValue([]),
  findAlertTypeById:     jest.fn().mockResolvedValue(null),
  findAlertTypeByCode:   jest.fn().mockResolvedValue(null),
  createAlertType:       jest.fn(),
  updateAlertType:       jest.fn(),
  deleteAlertType:       jest.fn().mockResolvedValue(false),
  findUserAlerts:        jest.fn().mockResolvedValue([]),
  findAllActiveAlerts:   jest.fn().mockResolvedValue([]),
  createUserAlert:       jest.fn(),
  resolveAlert:          jest.fn(),
  ignoreAlert:           jest.fn(),
  findAlertActions:      jest.fn().mockResolvedValue([]),
  addAlertAction:        jest.fn(),
} as unknown as jest.Mocked<IAlertRepository>;

// ─── Setup ────────────────────────────────────────────────────

let useCase: AddAlertActionUseCase;

beforeEach(() => {
  useCase = new AddAlertActionUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────

describe('AddAlertActionUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le résultat quand les données sont valides', async () => {
      // Arrange
      const input: CreateAlertActionDto = {
        alerte_user_id: 1,
        action_type: 'message_envoye',
        details: 'Détails action',
        created_by: 2
      };
      const expectedOutput: AlertActionDto = {
        id: 10,
        alerte_user_id: 1,
        action_type: 'message_envoye',
        details: 'Détails action',
        created_by: 2,
        created_at: new Date()
      };
      mockRepo.addAlertAction.mockResolvedValue(expectedOutput);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockRepo.addAlertAction).toHaveBeenCalledWith(input);
    });

    it("devrait lancer une erreur si l'identifiant de l'alerte est manquant", async () => {
      // Arrange
      const input = {
        action_type: 'message_envoye' as AlertActionType,
      } as CreateAlertActionDto;

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'alerte est requis");
    });

    it("devrait lancer une erreur si l'identifiant de l'alerte est <= 0", async () => {
      // Arrange
      const input = {
        alerte_user_id: 0,
        action_type: 'message_envoye' as AlertActionType,
      } as CreateAlertActionDto;

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'alerte est requis");
    });

    it("devrait lancer une erreur si le type d'action est manquant", async () => {
      // Arrange
      const input = {
        alerte_user_id: 1,
      } as CreateAlertActionDto;

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(/Type d'action invalide/);
    });

    it("devrait lancer une erreur si le type d'action est invalide", async () => {
      // Arrange
      const input = {
        alerte_user_id: 1,
        action_type: 'invalide' as AlertActionType,
      } as CreateAlertActionDto;

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow(/Type d'action invalide/);
    });

    it('devrait remonter les erreurs du repository', async () => {
      // Arrange
      const input: CreateAlertActionDto = {
        alerte_user_id: 1,
        action_type: 'autre',
      };
      mockRepo.addAlertAction.mockRejectedValue(new Error('Repo error'));

      // Act & Assert
      await expect(useCase.execute(input)).rejects.toThrow('Repo error');
    });

  });
});
