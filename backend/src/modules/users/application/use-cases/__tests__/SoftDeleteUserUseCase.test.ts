/**
 * SoftDeleteUserUseCase.test.ts
 * Tests unitaires — users / SoftDeleteUserUseCase
 */

import { SoftDeleteUserUseCase } from '../SoftDeleteUserUseCase';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

const mockRepo: jest.Mocked<IUserRepository> = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findProfile: jest.fn(),
  updateRole: jest.fn(),
  updateStatus: jest.fn(),
  updateLanguage: jest.fn(),
  updateProfile: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  findDeleted: jest.fn(),
  anonymize: jest.fn(),
  updateSubscription: jest.fn(),
} as jest.Mocked<IUserRepository>;

describe('SoftDeleteUserUseCase', () => {
  let useCase: SoftDeleteUserUseCase;

  beforeEach(() => {
    useCase = new SoftDeleteUserUseCase(mockRepo);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lancer une erreur si on essaie de supprimer son propre compte', async () => {
      await expect(useCase.execute(1, 1, 'Raison')).rejects.toThrow('Vous ne pouvez pas supprimer votre propre compte');
    });

    it('devrait lancer une erreur si la raison est trop courte ou absente', async () => {
      await expect(useCase.execute(2, 1, '')).rejects.toThrow("Une raison d'au moins 5 caractères est requise");
      await expect(useCase.execute(2, 1, 'abc')).rejects.toThrow("Une raison d'au moins 5 caractères est requise");
      await expect(useCase.execute(2, 1, '   ab   ')).rejects.toThrow("Une raison d'au moins 5 caractères est requise");
    });

    it('devrait lancer une erreur si l\'utilisateur est introuvable', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(useCase.execute(2, 1, 'Raison valable')).rejects.toThrow('Utilisateur introuvable');
    });

    it('devrait lancer une erreur si l\'utilisateur est déjà supprimé', async () => {
      mockRepo.findById.mockResolvedValue({ id: 2, deleted_at: new Date() } as any);
      await expect(useCase.execute(2, 1, 'Raison valable')).rejects.toThrow('Utilisateur déjà supprimé');
    });

    it('devrait supprimer l\'utilisateur si tout est valide', async () => {
      mockRepo.findById.mockResolvedValue({ id: 2, deleted_at: null } as any);
      mockRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(2, 1, '  Raison valable  ');

      expect(mockRepo.findById).toHaveBeenCalledWith(2);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(2, 1, 'Raison valable');
    });
  });
});
