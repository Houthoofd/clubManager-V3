/**
 * DeleteMessageUseCase.test.ts
 * Tests unitaires — messaging / DeleteMessageUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { DeleteMessageUseCase } from '../DeleteMessageUseCase';
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

let useCase: DeleteMessageUseCase;

beforeEach(() => {
  useCase = new DeleteMessageUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('DeleteMessageUseCase', () => {
  describe('execute', () => {

    const fakeMessage = { id: 1, expediteur_id: 2, contenu: 'Hello' } as any;

    it('devrait supprimer le message', async () => {
      mockRepo.getById.mockResolvedValue(fakeMessage);
      mockRepo.recordMessageStatus.mockResolvedValue();
      mockRepo.deleteForUser.mockResolvedValue();

      await useCase.execute(1, 42);

      expect(mockRepo.getById).toHaveBeenCalledWith(1, 42);
      expect(mockRepo.recordMessageStatus).toHaveBeenCalledWith({
        message_id: 1,
        user_id: 42,
        statut: 'supprime',
      });
      expect(mockRepo.deleteForUser).toHaveBeenCalledWith(1, 42);
    });

    it('devrait lancer une erreur si le message est introuvable', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(useCase.execute(1, 42)).rejects.toThrow('Message introuvable ou accès refusé');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getById.mockResolvedValue(fakeMessage);
      mockRepo.deleteForUser.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 42)).rejects.toThrow('DB error');
    });

  });
});
