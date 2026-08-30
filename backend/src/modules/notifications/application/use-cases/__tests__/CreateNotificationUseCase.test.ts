import { CreateNotificationUseCase } from '../CreateNotificationUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import type { CreateNotificationDto } from '../../../domain/types';

describe('CreateNotificationUseCase', () => {
  let useCase: CreateNotificationUseCase;
  let mockRepo: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      getUnreadCount: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      create: jest.fn(),
      deleteOld: jest.fn(),
      deleteById: jest.fn(),
      deleteAll: jest.fn(),
      getUserIdsByCible: jest.fn(),
      createBulk: jest.fn(),
    } as unknown as jest.Mocked<INotificationRepository>;

    useCase = new CreateNotificationUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should create notification successfully', async () => {
      mockRepo.create.mockResolvedValue({
        id: 1,
        user_id: 1,
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
        lu: false,
        date_creation: new Date(),
      });

      const dto: CreateNotificationDto = {
        user_id: 1,
        type: 'info',
        titre: ' Title ',
        contenu: ' Content ',
      };

      const result = await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith({
        user_id: 1,
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
      });
      expect(result.id).toBe(1);
    });

    it('should throw if user_id is missing or invalid', async () => {
      await expect(useCase.execute({ user_id: 0, type: 'info', titre: 'A', contenu: 'B' } as any)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
      await expect(useCase.execute({ type: 'info', titre: 'A', contenu: 'B' } as any)).rejects.toThrow("L'identifiant de l'utilisateur est requis");
    });

    it('should throw if titre is missing or invalid', async () => {
      await expect(useCase.execute({ user_id: 1, type: 'info', titre: '', contenu: 'B' } as any)).rejects.toThrow("Le titre de la notification est requis");
      await expect(useCase.execute({ user_id: 1, type: 'info', titre: '   ', contenu: 'B' } as any)).rejects.toThrow("Le titre de la notification est requis");
      await expect(useCase.execute({ user_id: 1, type: 'info', contenu: 'B' } as any)).rejects.toThrow("Le titre de la notification est requis");
    });

    it('should throw if contenu is missing or invalid', async () => {
      await expect(useCase.execute({ user_id: 1, type: 'info', titre: 'A', contenu: '' } as any)).rejects.toThrow("Le contenu de la notification est requis");
      await expect(useCase.execute({ user_id: 1, type: 'info', titre: 'A', contenu: '   ' } as any)).rejects.toThrow("Le contenu de la notification est requis");
      await expect(useCase.execute({ user_id: 1, type: 'info', titre: 'A' } as any)).rejects.toThrow("Le contenu de la notification est requis");
    });

    it('should throw if type is missing or invalid', async () => {
      await expect(useCase.execute({ user_id: 1, titre: 'A', contenu: 'B' } as any)).rejects.toThrow(/Le type de notification est invalide/);
      await expect(useCase.execute({ user_id: 1, type: 'invalid_type', titre: 'A', contenu: 'B' } as any)).rejects.toThrow(/Le type de notification est invalide/);
    });
  });
});
