import { DeleteNotificationUseCase } from '../DeleteNotificationUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('DeleteNotificationUseCase', () => {
  let useCase: DeleteNotificationUseCase;
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

    useCase = new DeleteNotificationUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should delete notification successfully', async () => {
      mockRepo.deleteById.mockResolvedValue(true);

      const result = await useCase.execute(1, 2);

      expect(mockRepo.deleteById).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(true);
    });

    it('should throw if repository fails', async () => {
      mockRepo.deleteById.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1, 2)).rejects.toThrow('DB error');
    });
  });
});
