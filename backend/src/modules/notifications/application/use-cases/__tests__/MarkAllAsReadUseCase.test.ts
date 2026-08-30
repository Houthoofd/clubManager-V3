import { MarkAllAsReadUseCase } from '../MarkAllAsReadUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('MarkAllAsReadUseCase', () => {
  let useCase: MarkAllAsReadUseCase;
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

    useCase = new MarkAllAsReadUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should mark all notifications as read', async () => {
      mockRepo.markAllAsRead.mockResolvedValue();

      await useCase.execute(1);

      expect(mockRepo.markAllAsRead).toHaveBeenCalledWith(1);
    });

    it('should throw if repository fails', async () => {
      mockRepo.markAllAsRead.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1)).rejects.toThrow('DB error');
    });
  });
});
