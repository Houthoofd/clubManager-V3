/**
 * CreateUserAlertUseCase.test.ts
 * Tests unitaires — alerts / CreateUserAlertUseCase
 */

import { CreateUserAlertUseCase } from '../CreateUserAlertUseCase';
import type { IAlertRepository } from '../../../domain/repositories/IAlertRepository';
import type { CreateUserAlertDto, AlertUserDto, AlertTypeDto } from '../../../domain/types';

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

let useCase: CreateUserAlertUseCase;

beforeEach(() => {
  useCase = new CreateUserAlertUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CreateUserAlertUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le résultat quand les données sont valides', async () => {
      const input: CreateUserAlertDto = {
        user_id: 1,
        alerte_type_id: 2,
        entite_id: 3,
        reference_id: 4,
        donnees: { test: true }
      };
      const alertType: AlertTypeDto = {
        id: 2, code: 'CODE', nom: 'Nom', priorite: 'haute', actif: true, created_at: new Date(), updated_at: new Date(), description: null
      };
      const expectedOutput: AlertUserDto = {
        id: 10,
        ...input,
        statut: 'nouveau',
        created_at: new Date(),
        updated_at: new Date()
      };
      mockRepo.findAlertTypeById.mockResolvedValue(alertType);
      mockRepo.createUserAlert.mockResolvedValue(expectedOutput);

      const result = await useCase.execute(input);

      expect(result).toEqual(expectedOutput);
      expect(mockRepo.findAlertTypeById).toHaveBeenCalledWith(2);
      expect(mockRepo.createUserAlert).toHaveBeenCalledWith(input);
    });

    it("devrait lancer une erreur si user_id est manquant", async () => {
      const input = { alerte_type_id: 2 } as CreateUserAlertDto;
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
    });

    it("devrait lancer une erreur si user_id est <= 0", async () => {
      const input = { user_id: 0, alerte_type_id: 2 } as CreateUserAlertDto;
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
    });

    it("devrait lancer une erreur si alerte_type_id est manquant", async () => {
      const input = { user_id: 1 } as CreateUserAlertDto;
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant du type d'alerte est requis");
    });

    it("devrait lancer une erreur si alerte_type_id est <= 0", async () => {
      const input = { user_id: 1, alerte_type_id: -1 } as CreateUserAlertDto;
      await expect(useCase.execute(input)).rejects.toThrow("L'identifiant du type d'alerte est requis");
    });

    it("devrait lancer une erreur si le type d'alerte est introuvable", async () => {
      const input = { user_id: 1, alerte_type_id: 2 } as CreateUserAlertDto;
      mockRepo.findAlertTypeById.mockResolvedValue(null);
      await expect(useCase.execute(input)).rejects.toThrow("Type d'alerte introuvable (id: 2)");
    });

    it("devrait lancer une erreur si le type d'alerte est désactivé", async () => {
      const input = { user_id: 1, alerte_type_id: 2 } as CreateUserAlertDto;
      const alertType: AlertTypeDto = { id: 2, code: 'CODE', nom: 'Nom', priorite: 'haute', actif: false, created_at: new Date(), updated_at: new Date(), description: null };
      mockRepo.findAlertTypeById.mockResolvedValue(alertType);
      await expect(useCase.execute(input)).rejects.toThrow("Ce type d'alerte est désactivé");
    });

    it("devrait remonter les erreurs du repository", async () => {
      const input = { user_id: 1, alerte_type_id: 2 } as CreateUserAlertDto;
      mockRepo.findAlertTypeById.mockRejectedValue(new Error('Repo error'));
      await expect(useCase.execute(input)).rejects.toThrow('Repo error');
    });

  });
});
