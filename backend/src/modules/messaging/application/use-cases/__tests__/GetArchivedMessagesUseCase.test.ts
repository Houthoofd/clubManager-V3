/**
 * GetArchivedMessagesUseCase.test.ts
 * Tests unitaires — messaging / GetArchivedMessagesUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { GetArchivedMessagesUseCase } from '../GetArchivedMessagesUseCase';
import type { IMessagingRepository } from '../../../domain/repositories/IMessagingRepository';

// ─── Mock Repository ────────────────────────────────────────────

const mockRepo: jest.Mocked<IMessagingRepository> = {
  sendToUser:                  jest.fn(),
  createBroadcast:             jest.fn(),
  updateBroadcastCount:        jest.fn(),
  getInbox:                    jest.fn(),
  getSent:                     jest.fn(),
  getById:                     jest.fn(),
  markAsRead:                  jest.fn(),
  deleteForUser:               jest.fn(),
  getUnreadCount:              jest.fn(),
  archiveMessage:              jest.fn(),
  getArchived:                 jest.fn(),
  getRecipientsForBroadcast:   jest.fn(),
  recordMessageStatus:         jest.fn(),
} as jest.Mocked<IMessagingRepository>;


// ─── Setup ────────────────────────────────────────────────────

let useCase: GetArchivedMessagesUseCase;

beforeEach(() => {
  useCase = new GetArchivedMessagesUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetArchivedMessagesUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les messages archivés', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 10 };
      mockRepo.getArchived.mockResolvedValue(mockResult);

      const result = await useCase.execute(42, 1, 10);

      expect(mockRepo.getArchived).toHaveBeenCalledWith(42, 1, 10);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getArchived.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(42, 1, 10)).rejects.toThrow('DB error');
    });

  });
});
