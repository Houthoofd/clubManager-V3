import { DeleteAllNotificationsUseCase } from '../DeleteAllNotificationsUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('DeleteAllNotificationsUseCase', () => {
  let useCase: DeleteAllNotificationsUseCase;
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

    useCase = new DeleteAllNotificationsUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should delete all notifications for a user', async () => {
      mockRepo.deleteAll.mockResolvedValue(5);

      const result = await useCase.execute(1);

      expect(mockRepo.deleteAll).toHaveBeenCalledWith(1);
      expect(result).toBe(5);
    });

    it('should throw if repository fails', async () => {
      mockRepo.deleteAll.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
