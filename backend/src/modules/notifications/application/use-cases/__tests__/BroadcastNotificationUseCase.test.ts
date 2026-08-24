import { BroadcastNotificationUseCase } from '../BroadcastNotificationUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import type { BroadcastNotificationDto } from '../../../domain/types';

describe('BroadcastNotificationUseCase', () => {
  let useCase: BroadcastNotificationUseCase;
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

    useCase = new BroadcastNotificationUseCase(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should broadcast successfully to multiple users', async () => {
      mockRepo.getUserIdsByCible.mockResolvedValue([1, 2, 3]);
      mockRepo.createBulk.mockResolvedValue(3);

      const dto: BroadcastNotificationDto = {
        cible: 'ALL',
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
      };

      const result = await useCase.execute(dto);

      expect(mockRepo.getUserIdsByCible).toHaveBeenCalledWith('ALL');
      expect(mockRepo.createBulk).toHaveBeenCalledWith([
        { user_id: 1, type: 'info', titre: 'Title', contenu: 'Content' },
        { user_id: 2, type: 'info', titre: 'Title', contenu: 'Content' },
        { user_id: 3, type: 'info', titre: 'Title', contenu: 'Content' },
      ]);
      expect(result).toEqual({ sent: 3, skipped: 0 });
    });

    it('should handle partial success', async () => {
      mockRepo.getUserIdsByCible.mockResolvedValue([1, 2, 3]);
      mockRepo.createBulk.mockResolvedValue(2);

      const dto: BroadcastNotificationDto = {
        cible: 'ALL',
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
      };

      const result = await useCase.execute(dto);
      expect(result).toEqual({ sent: 2, skipped: 1 });
    });

    it('should return 0 if no users found', async () => {
      mockRepo.getUserIdsByCible.mockResolvedValue([]);

      const dto: BroadcastNotificationDto = {
        cible: 'ALL',
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
      };

      const result = await useCase.execute(dto);

      expect(mockRepo.getUserIdsByCible).toHaveBeenCalledWith('ALL');
      expect(mockRepo.createBulk).not.toHaveBeenCalled();
      expect(result).toEqual({ sent: 0, skipped: 0 });
    });
    
    it('should throw an error if the repository fails', async () => {
      mockRepo.getUserIdsByCible.mockRejectedValue(new Error('DB error'));
      const dto: BroadcastNotificationDto = {
        cible: 'ALL',
        type: 'info',
        titre: 'Title',
        contenu: 'Content',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });
  });
});
