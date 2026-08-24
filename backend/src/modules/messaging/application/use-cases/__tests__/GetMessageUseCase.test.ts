/**
 * GetMessageUseCase.test.ts
 * Tests unitaires — messaging / GetMessageUseCase
 * ─────────────────────────────────────────────────────────────────────────────
 * Généré par : scripts/generate-tests.mjs
 * Sprint     : Tests 1 — Use-Cases Backend
 * Module     : messaging
 */

import { GetMessageUseCase } from '../GetMessageUseCase';
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

let useCase: GetMessageUseCase;

beforeEach(() => {
  useCase = new GetMessageUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});


// ─── Tests ────────────────────────────────────────────────────

describe('GetMessageUseCase', () => {
  describe('execute', () => {

    it('devrait retourner le message et le marquer comme lu si destinataire et non lu', async () => {
      const mockMsg = { id: 1, destinataire_id: 42, lu: false } as any;
      mockRepo.getById.mockResolvedValue(mockMsg);
      mockRepo.markAsRead.mockResolvedValue();

      const result = await useCase.execute(1, 42);

      expect(mockRepo.getById).toHaveBeenCalledWith(1, 42);
      expect(mockRepo.markAsRead).toHaveBeenCalledWith(1, 42);
      expect(result.lu).toBe(true);
      expect(result.date_lecture).toBeInstanceOf(Date);
    });

    it('devrait retourner le message sans le marquer comme lu s\'il est déjà lu', async () => {
      const dateLecture = new Date('2026-01-01');
      const mockMsg = { id: 1, destinataire_id: 42, lu: true, date_lecture: dateLecture } as any;
      mockRepo.getById.mockResolvedValue(mockMsg);

      const result = await useCase.execute(1, 42);

      expect(mockRepo.markAsRead).not.toHaveBeenCalled();
      expect(result.lu).toBe(true);
      expect(result.date_lecture).toBe(dateLecture);
    });

    it('devrait retourner le message sans le marquer comme lu si l\'utilisateur n\'est pas destinataire', async () => {
      const mockMsg = { id: 1, destinataire_id: 99, expediteur_id: 42, lu: false } as any;
      mockRepo.getById.mockResolvedValue(mockMsg);

      const result = await useCase.execute(1, 42);

      expect(mockRepo.markAsRead).not.toHaveBeenCalled();
      expect(result.lu).toBe(false);
    });

    it('devrait lancer une erreur si le message est introuvable', async () => {
      mockRepo.getById.mockResolvedValue(null);

      await expect(useCase.execute(1, 42)).rejects.toThrow('Message introuvable ou accès refusé');
    });

    it('devrait lancer une erreur si le repository échoue', async () => {
      mockRepo.getById.mockRejectedValue(new Error('DB error'));

      await expect(useCase.execute(1, 42)).rejects.toThrow('DB error');
    });

  });
});
