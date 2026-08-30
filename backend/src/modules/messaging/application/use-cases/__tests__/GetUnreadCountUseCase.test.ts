/**
 * GetUnreadCountUseCase.test.ts
 * Tests unitaires — messaging / GetUnreadCountUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { GetUnreadCountUseCase } from '../GetUnreadCountUseCase';
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

let useCase: GetUnreadCountUseCase;

beforeEach(() => {
  useCase = new GetUnreadCountUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetUnreadCountUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le nombre de messages non lus', async () => {
      mockRepo.getUnreadCount.mockResolvedValue(5);

      const result = await useCase.execute(42);

      expect(mockRepo.getUnreadCount).toHaveBeenCalledWith(42);
      expect(result).toBe(5);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getUnreadCount.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(42)).rejects.toThrow('DB error');
    });

  });
});
