import { GetUnreadCountUseCase } from '../GetUnreadCountUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('GetUnreadCountUseCase', () => {
  let useCase: GetUnreadCountUseCase;
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

    useCase = new GetUnreadCountUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should get unread count successfully', async () => {
      mockRepo.getUnreadCount.mockResolvedValue(5);

      const result = await useCase.execute(1);

      expect(mockRepo.getUnreadCount).toHaveBeenCalledWith(1);
      expect(result).toBe(5);
    });

    it('should throw if repository fails', async () => {
      mockRepo.getUnreadCount.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
