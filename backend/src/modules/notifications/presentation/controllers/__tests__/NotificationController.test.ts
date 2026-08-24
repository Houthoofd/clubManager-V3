import { NotificationController } from '../NotificationController';
import type { AuthRequest } from '@/shared/middleware/authMiddleware';
import type { Response } from 'express';

import { GetNotificationsUseCase } from '../../../application/use-cases/GetNotificationsUseCase';
import { GetUnreadCountUseCase } from '../../../application/use-cases/GetUnreadCountUseCase';
import { MarkAsReadUseCase } from '../../../application/use-cases/MarkAsReadUseCase';
import { MarkAllAsReadUseCase } from '../../../application/use-cases/MarkAllAsReadUseCase';
import { DeleteNotificationUseCase } from '../../../application/use-cases/DeleteNotificationUseCase';
import { DeleteAllNotificationsUseCase } from '../../../application/use-cases/DeleteAllNotificationsUseCase';
import { BroadcastNotificationUseCase } from '../../../application/use-cases/BroadcastNotificationUseCase';

jest.mock('../../../application/use-cases/GetNotificationsUseCase');
jest.mock('../../../application/use-cases/GetUnreadCountUseCase');
jest.mock('../../../application/use-cases/MarkAsReadUseCase');
jest.mock('../../../application/use-cases/MarkAllAsReadUseCase');
jest.mock('../../../application/use-cases/DeleteNotificationUseCase');
jest.mock('../../../application/use-cases/DeleteAllNotificationsUseCase');
jest.mock('../../../application/use-cases/BroadcastNotificationUseCase');
jest.mock('../../../infrastructure/repositories/MySQLNotificationRepository');

describe('NotificationController', () => {
  let controller: NotificationController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new NotificationController();
    req = {
      user: { userId: 1, role_app: 'user' } as any,
      params: {},
      query: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return notifications successfully', async () => {
      jest.spyOn(GetNotificationsUseCase.prototype, 'execute').mockResolvedValue([]);
      req.query = { unread: 'true' };
      
      await controller.getNotifications(req as AuthRequest, res as Response);
      
      expect(GetNotificationsUseCase.prototype.execute).toHaveBeenCalledWith(1, true);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notifications récupérées',
        data: [],
      });
    });

    it('should handle internal errors', async () => {
      jest.spyOn(GetNotificationsUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      
      await controller.getNotifications(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });

    it('should handle internal errors without message', async () => {
      jest.spyOn(GetNotificationsUseCase.prototype, 'execute').mockRejectedValue({});
      
      await controller.getNotifications(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count successfully', async () => {
      jest.spyOn(GetUnreadCountUseCase.prototype, 'execute').mockResolvedValue(5);
      
      await controller.getUnreadCount(req as AuthRequest, res as Response);
      
      expect(GetUnreadCountUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Nombre de notifications non lues récupéré',
        data: { count: 5 },
      });
    });

    it('should handle internal errors', async () => {
      jest.spyOn(GetUnreadCountUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      
      await controller.getUnreadCount(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });

    it('should handle internal errors without message', async () => {
      jest.spyOn(GetUnreadCountUseCase.prototype, 'execute').mockRejectedValue({});
      
      await controller.getUnreadCount(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('markAsRead', () => {
    it('should mark as read successfully', async () => {
      jest.spyOn(MarkAsReadUseCase.prototype, 'execute').mockResolvedValue(undefined);
      req.params = { id: '2' };
      
      await controller.markAsRead(req as AuthRequest, res as Response);
      
      expect(MarkAsReadUseCase.prototype.execute).toHaveBeenCalledWith(2, 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification marquée comme lue',
      });
    });

    it('should handle invalid id', async () => {
      req.params = { id: 'abc' };
      
      await controller.markAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "L'identifiant de la notification est invalide",
      });
    });

    it('should handle errors from use case', async () => {
      jest.spyOn(MarkAsReadUseCase.prototype, 'execute').mockRejectedValue(new Error('invalide error'));
      req.params = { id: '2' };
      
      await controller.markAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'invalide error',
      }));
    });

    it('should handle general errors from use case', async () => {
      jest.spyOn(MarkAsReadUseCase.prototype, 'execute').mockRejectedValue(new Error('Other error'));
      req.params = { id: '2' };
      
      await controller.markAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Other error',
      }));
    });

    it('should handle errors without message', async () => {
      jest.spyOn(MarkAsReadUseCase.prototype, 'execute').mockRejectedValue({});
      req.params = { id: '2' };
      
      await controller.markAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all as read successfully', async () => {
      jest.spyOn(MarkAllAsReadUseCase.prototype, 'execute').mockResolvedValue(undefined);
      
      await controller.markAllAsRead(req as AuthRequest, res as Response);
      
      expect(MarkAllAsReadUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    });

    it('should handle internal errors', async () => {
      jest.spyOn(MarkAllAsReadUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      
      await controller.markAllAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });

    it('should handle internal errors without message', async () => {
      jest.spyOn(MarkAllAsReadUseCase.prototype, 'execute').mockRejectedValue({});
      
      await controller.markAllAsRead(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('deleteOne', () => {
    it('should delete successfully', async () => {
      jest.spyOn(DeleteNotificationUseCase.prototype, 'execute').mockResolvedValue(true);
      req.params = { id: '2' };
      
      await controller.deleteOne(req as AuthRequest, res as Response);
      
      expect(DeleteNotificationUseCase.prototype.execute).toHaveBeenCalledWith(2, 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Notification supprimee',
      });
    });

    it('should handle invalid id', async () => {
      req.params = { id: 'abc' };
      
      await controller.deleteOne(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: "L'identifiant de la notification est invalide",
      }));
    });

    it('should handle not found', async () => {
      jest.spyOn(DeleteNotificationUseCase.prototype, 'execute').mockResolvedValue(false);
      req.params = { id: '2' };
      
      await controller.deleteOne(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Notification introuvable ou non autorisee',
      }));
    });

    it('should handle internal errors', async () => {
      jest.spyOn(DeleteNotificationUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      req.params = { id: '2' };
      
      await controller.deleteOne(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });

    it('should handle internal errors without message', async () => {
      jest.spyOn(DeleteNotificationUseCase.prototype, 'execute').mockRejectedValue({});
      req.params = { id: '2' };
      
      await controller.deleteOne(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('deleteAll', () => {
    it('should delete all notifications', async () => {
      jest.spyOn(DeleteAllNotificationsUseCase.prototype, 'execute').mockResolvedValue(5);
      
      await controller.deleteAll(req as AuthRequest, res as Response);
      
      expect(DeleteAllNotificationsUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '5 notifications supprimees',
        data: { deleted: 5 },
      });
    });

    it('should handle 1 notification deleted grammatically correct', async () => {
      jest.spyOn(DeleteAllNotificationsUseCase.prototype, 'execute').mockResolvedValue(1);
      
      await controller.deleteAll(req as AuthRequest, res as Response);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '1 notification supprimee',
        data: { deleted: 1 },
      });
    });

    it('should handle internal errors', async () => {
      jest.spyOn(DeleteAllNotificationsUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      
      await controller.deleteAll(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });

    it('should handle internal errors without message', async () => {
      jest.spyOn(DeleteAllNotificationsUseCase.prototype, 'execute').mockRejectedValue({});
      
      await controller.deleteAll(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne du serveur',
      }));
    });
  });

  describe('broadcast', () => {
    it('should prevent non-admin from broadcasting', async () => {
      req.user = { userId: 1, role_app: 'user' } as any;
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Accès réservé aux administrateurs',
      });
    });

    it('should require missing fields', async () => {
      req.user = { userId: 1, role_app: 'admin' } as any;
      req.body = { type: 'info' };
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'titre, contenu, type et cible sont requis',
      });
    });

    it('should validate type and cible', async () => {
      req.user = { userId: 1, role_app: 'admin' } as any;
      req.body = { titre: 'T', contenu: 'C', type: 'invalid_type', cible: 'tous' };
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'type ou cible invalide',
      });
    });

    it('should broadcast successfully for admins', async () => {
      req.user = { userId: 1, role_app: 'admin' } as any;
      req.body = { titre: 'T', contenu: 'C', type: 'info', cible: 'tous' };
      jest.spyOn(BroadcastNotificationUseCase.prototype, 'execute').mockResolvedValue({ sent: 5, skipped: 0 });
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(BroadcastNotificationUseCase.prototype.execute).toHaveBeenCalledWith({
        titre: 'T', contenu: 'C', type: 'info', cible: 'tous',
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Broadcast envoyé à 5 utilisateur(s)',
        data: { sent: 5, skipped: 0 },
      });
    });

    it('should handle internal errors without message', async () => {
      req.user = { userId: 1, role_app: 'admin' } as any;
      req.body = { titre: 'T', contenu: 'C', type: 'info', cible: 'tous' };
      jest.spyOn(BroadcastNotificationUseCase.prototype, 'execute').mockRejectedValue({});
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur interne',
      }));
    });

    it('should handle internal errors', async () => {
      req.user = { userId: 1, role_app: 'admin' } as any;
      req.body = { titre: 'T', contenu: 'C', type: 'info', cible: 'tous' };
      jest.spyOn(BroadcastNotificationUseCase.prototype, 'execute').mockRejectedValue(new Error('Internal'));
      
      await controller.broadcast(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Internal',
      }));
    });
  });
});
