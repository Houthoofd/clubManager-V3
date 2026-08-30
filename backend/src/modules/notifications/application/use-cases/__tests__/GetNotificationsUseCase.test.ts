import { GetNotificationsUseCase } from '../GetNotificationsUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('GetNotificationsUseCase', () => {
  let useCase: GetNotificationsUseCase;
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

    useCase = new GetNotificationsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should get all notifications for a user', async () => {
      mockRepo.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(1);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual([]);
    });

    it('should get only unread notifications if specified', async () => {
      mockRepo.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(1, true);

      expect(mockRepo.findByUserId).toHaveBeenCalledWith(1, true);
      expect(result).toEqual([]);
    });

    it('should throw if repository fails', async () => {
      mockRepo.findByUserId.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
