import { MessagingController } from '../MessagingController';
import { SendMessageUseCase } from '../../../application/use-cases/SendMessageUseCase';
import { GetInboxUseCase } from '../../../application/use-cases/GetInboxUseCase';
import { GetSentUseCase } from '../../../application/use-cases/GetSentUseCase';
import { GetMessageUseCase } from '../../../application/use-cases/GetMessageUseCase';
import { GetUnreadCountUseCase } from '../../../application/use-cases/GetUnreadCountUseCase';
import { DeleteMessageUseCase } from '../../../application/use-cases/DeleteMessageUseCase';
import { ArchiveMessageUseCase } from '../../../application/use-cases/ArchiveMessageUseCase';
import { GetArchivedMessagesUseCase } from '../../../application/use-cases/GetArchivedMessagesUseCase';
import { pool } from '@/core/database/connection';
import type { Request, Response } from 'express';

// Mock the core connection
jest.mock('@/core/database/connection', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Mock the UseCases
jest.mock('../../../application/use-cases/SendMessageUseCase');
jest.mock('../../../application/use-cases/GetInboxUseCase');
jest.mock('../../../application/use-cases/GetSentUseCase');
jest.mock('../../../application/use-cases/GetMessageUseCase');
jest.mock('../../../application/use-cases/GetUnreadCountUseCase');
jest.mock('../../../application/use-cases/DeleteMessageUseCase');
jest.mock('../../../application/use-cases/ArchiveMessageUseCase');
jest.mock('../../../application/use-cases/GetArchivedMessagesUseCase');

describe('MessagingController', () => {
  let controller: MessagingController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new MessagingController();
    req = {
      user: { userId: 42, role_app: 'member' } as any,
      query: {},
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getInbox', () => {
    it('devrait retourner les messages', async () => {
      req.query = { page: '2', limit: '10', lu: 'true' };
      const mockResult = { data: [], total: 0, page: 2, limit: 10 };
      (GetInboxUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getInbox(req as any, res as any);

      expect(GetInboxUseCase.prototype.execute).toHaveBeenCalledWith(42, 2, 10, true);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Boite de reception recuperee',
        data: mockResult,
      });
    });

    it('devrait retourner les messages sans lu', async () => {
      req.query = {};
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      (GetInboxUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getInbox(req as any, res as any);

      expect(GetInboxUseCase.prototype.execute).toHaveBeenCalledWith(42, 1, 20, undefined);
    });

    it('devrait gérer les erreurs internes', async () => {
      (GetInboxUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      await controller.getInbox(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur DB',
        error: 'INTERNAL_ERROR',
      });
    });
  });

  describe('getSent', () => {
    it('devrait retourner les messages envoyés', async () => {
      req.query = { page: '2', limit: '10' };
      const mockResult = { data: [], total: 0, page: 2, limit: 10 };
      (GetSentUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getSent(req as any, res as any);

      expect(GetSentUseCase.prototype.execute).toHaveBeenCalledWith(42, 2, 10);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Boite d'envoi recuperee",
        data: mockResult,
      });
    });

    it('devrait gérer les erreurs internes', async () => {
      (GetSentUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      await controller.getSent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMessage', () => {
    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: 'abc' };
      await controller.getMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID de message invalide",
        error: "INVALID_ID",
      });
    });

    it('devrait retourner le message', async () => {
      req.params = { id: '1' };
      const mockMsg = { id: 1, contenu: 'Test' };
      (GetMessageUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockMsg);

      await controller.getMessage(req as any, res as any);

      expect(GetMessageUseCase.prototype.execute).toHaveBeenCalledWith(1, 42);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Message recupere",
        data: mockMsg,
      });
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      (GetMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Message introuvable ou acces refuse'));

      await controller.getMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message introuvable ou acces refuse',
        error: 'NOT_FOUND',
      });
    });

    it('devrait gérer les autres erreurs', async () => {
      req.params = { id: '1' };
      (GetMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.getMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUnreadCount', () => {
    it('devrait retourner le nombre', async () => {
      (GetUnreadCountUseCase.prototype.execute as jest.Mock).mockResolvedValue(5);

      await controller.getUnreadCount(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Compteur de messages non lus recupere",
        data: { unread: 5 },
      });
    });

    it('devrait gérer les erreurs internes', async () => {
      (GetUnreadCountUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.getUnreadCount(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('send', () => {
    it('devrait retourner 400 si pas de destinataire ni cible', async () => {
      req.body = { contenu: 'Test' };
      await controller.send(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "MISSING_RECIPIENT" }));
    });

    it('devrait retourner 400 si pas de contenu', async () => {
      req.body = { destinataire_id: 1, contenu: '   ' };
      await controller.send(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "MISSING_CONTENT" }));
    });

    it('devrait retourner 404 si destinataire introuvable', async () => {
      req.body = { destinataire_id: 2, contenu: 'Test' };
      (pool.query as jest.Mock).mockResolvedValue([[]]);

      await controller.send(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "RECIPIENT_NOT_FOUND" }));
    });

    it('devrait envoyer le message', async () => {
      req.body = { destinataire_id: 2, contenu: 'Test', envoye_par_email: true };
      (pool.query as jest.Mock).mockResolvedValue([[{ email: 'test@test.com', nom: 'John Doe' }]]);
      (SendMessageUseCase.prototype.execute as jest.Mock).mockResolvedValue({ messageIds: [1] });

      await controller.send(req as any, res as any);

      expect(SendMessageUseCase.prototype.execute).toHaveBeenCalledWith({
        expediteur_id: 42,
        expediteur_role: 'member',
        destinataire_id: 2,
        destinataire_email: 'test@test.com',
        destinataire_nom: 'John Doe',
        cible: undefined,
        sujet: undefined,
        contenu: 'Test',
        envoye_par_email: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('devrait gerer les erreurs metier', async () => {
      req.body = { cible: 'tous', contenu: 'Test' };
      (SendMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Le message est trop long'));

      await controller.send(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "BAD_REQUEST" }));
    });

    it('devrait gerer les erreurs internes du UseCase send', async () => {
      req.body = { cible: 'tous', contenu: 'Test' };
      (SendMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.send(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "INTERNAL_ERROR" }));
    });
  });

  describe('delete', () => {
    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: 'abc' };
      await controller.delete(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: "INVALID_ID" }));
    });

    it('devrait supprimer le message', async () => {
      req.params = { id: '1' };
      (DeleteMessageUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.delete(req as any, res as any);

      expect(DeleteMessageUseCase.prototype.execute).toHaveBeenCalledWith(1, 42);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Message supprime",
      });
    });

    it('devrait gérer 404', async () => {
      req.params = { id: '1' };
      (DeleteMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Message introuvable ou acces refuse'));

      await controller.delete(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait gérer 500', async () => {
      req.params = { id: '1' };
      (DeleteMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.delete(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('archiveMessage', () => {
    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: '-1' };
      await controller.archiveMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait archiver', async () => {
      req.params = { id: '1' };
      (ArchiveMessageUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.archiveMessage(req as any, res as any);

      expect(ArchiveMessageUseCase.prototype.execute).toHaveBeenCalledWith(1, 42);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Message archive",
      });
    });

    it('devrait gérer 404', async () => {
      req.params = { id: '1' };
      (ArchiveMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Message introuvable ou acces refuse'));

      await controller.archiveMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait gérer 500', async () => {
      req.params = { id: '1' };
      (ArchiveMessageUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.archiveMessage(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getArchived', () => {
    it('devrait retourner les messages', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      (GetArchivedMessagesUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getArchived(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockResult }));
    });

    it('devrait gérer 500', async () => {
      (GetArchivedMessagesUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.getArchived(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
