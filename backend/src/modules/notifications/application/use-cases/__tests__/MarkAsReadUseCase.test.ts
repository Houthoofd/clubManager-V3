import { MarkAsReadUseCase } from '../MarkAsReadUseCase';
import type { INotificationRepository } from '../../../domain/repositories/INotificationRepository';

describe('MarkAsReadUseCase', () => {
  let useCase: MarkAsReadUseCase;
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

    useCase = new MarkAsReadUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should mark notification as read', async () => {
      mockRepo.markAsRead.mockResolvedValue();

      await useCase.execute(1, 2);

      expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, 2);
    });

    it('should throw if id is invalid', async () => {
      await expect(useCase.execute(0, 2)).rejects.toThrow("L'identifiant de la notification est invalide");
    });

    it('should throw if userId is invalid', async () => {
      await expect(useCase.execute(1, 0)).rejects.toThrow("L'identifiant de l'utilisateur est invalide");
    });

    it('should throw if repository fails', async () => {
      mockRepo.markAsRead.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute(1, 2)).rejects.toThrow('DB error');
    });
  });
});
