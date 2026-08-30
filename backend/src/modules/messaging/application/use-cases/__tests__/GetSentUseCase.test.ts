/**
 * GetSentUseCase.test.ts
 * Tests unitaires — messaging / GetSentUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { GetSentUseCase } from '../GetSentUseCase';
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

let useCase: GetSentUseCase;

beforeEach(() => {
  useCase = new GetSentUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetSentUseCase', () => {
  describe('execute', () => {

    it('devrait retourner les messages envoyés avec les paramètres par défaut', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      mockRepo.getSent.mockResolvedValue(mockResult);

      const result = await useCase.execute(42);

      expect(mockRepo.getSent).toHaveBeenCalledWith(42, 1, 20);
      expect(result).toEqual(mockResult);
    });

    it('devrait limiter la page à 1 minimum et limit à 50 maximum', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 50 };
      mockRepo.getSent.mockResolvedValue(mockResult);

      const result = await useCase.execute(42, 0, 100);

      expect(mockRepo.getSent).toHaveBeenCalledWith(42, 1, 50);
      expect(result).toEqual(mockResult);
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getSent.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(42)).rejects.toThrow('DB error');
    });

  });
});
