/**
 * ArchiveMessageUseCase.test.ts
 * Tests unitaires — messaging / ArchiveMessageUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { ArchiveMessageUseCase } from '../ArchiveMessageUseCase';
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

let useCase: ArchiveMessageUseCase;

beforeEach(() => {
  useCase = new ArchiveMessageUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('ArchiveMessageUseCase', () => {
  describe('execute', () => {

    // ── Cas nominaux ─────────────────────────────────────────────────────

    it('devrait archiver le message', async () => {
      mockRepo.archiveMessage.mockResolvedValue();

      await useCase.execute(1, 42);

      expect(mockRepo.archiveMessage).toHaveBeenCalledWith(1, 42);
    });

    // ── Cas d'erreur ─────────────────────────────────────────────────────

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.archiveMessage.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 42)).rejects.toThrow('DB error');
    });

  });
});
