/**
 * NotificationController
 * Controller pour gérer les endpoints des notifications
 * Chaque utilisateur n'accède qu'à ses propres notifications (ownership via req.user.userId)
 */

import type { Response } from 'express';
import type { AuthRequest } from '@/shared/middleware/authMiddleware.js';
import { MySQLNotificationRepository } from '../../infrastructure/repositories/MySQLNotificationRepository.js';
import { GetNotificationsUseCase } from '../../application/use-cases/GetNotificationsUseCase.js';
import { GetUnreadCountUseCase } from '../../application/use-cases/GetUnreadCountUseCase.js';
import { MarkAsReadUseCase } from '../../application/use-cases/MarkAsReadUseCase.js';
import { MarkAllAsReadUseCase } from '../../application/use-cases/MarkAllAsReadUseCase.js';

// ==================== MODULE-LEVEL INSTANTIATION ====================

const repo = new MySQLNotificationRepository();
const getNotificationsUC = new GetNotificationsUseCase(repo);
const getUnreadCountUC = new GetUnreadCountUseCase(repo);
const markAsReadUC = new MarkAsReadUseCase(repo);
const markAllAsReadUC = new MarkAllAsReadUseCase(repo);

// ==================== CONTROLLER ====================

export class NotificationController {
  /**
   * GET /api/notifications
   * Retourne les notifications de l'utilisateur authentifié
   * Query param : ?unread=true pour ne récupérer que les non-lues
   */
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const onlyUnread = req.query.unread === 'true';

      const notifications = await getNotificationsUC.execute(userId, onlyUnread);

      res.json({
        success: true,
        message: 'Notifications récupérées',
        data: notifications,
      });
    } catch (error: any) {
      console.error('[NotificationController.getNotifications]', error);
      res.status(500).json({
        success: false,
        message: error.message ?? 'Erreur interne du serveur',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Retourne le nombre de notifications non lues de l'utilisateur authentifié
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const count = await getUnreadCountUC.execute(userId);

      res.json({
        success: true,
        message: 'Nombre de notifications non lues récupéré',
        data: { count },
      });
    } catch (error: any) {
      console.error('[NotificationController.getUnreadCount]', error);
      res.status(500).json({
        success: false,
        message: error.message ?? 'Erreur interne du serveur',
        error: 'INTERNAL_ERROR',
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Marque une notification spécifique comme lue
   * L'ownership est garanti par le repository (WHERE id = ? AND user_id = ?)
   */
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id);
      const userId = req.user!.userId;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: "L'identifiant de la notification est invalide",
        });
        return;
      }

      await markAsReadUC.execute(id, userId);

      res.json({
        success: true,
        message: 'Notification marquée comme lue',
      });
    } catch (error: any) {
      console.error('[NotificationController.markAsRead]', error);
      const status = error.message?.includes('invalide') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message ?? 'Erreur interne du serveur',
      });
    }
  }

  /**
   * POST /api/notifications/read-all
   * Marque toutes les notifications non lues de l'utilisateur authentifié comme lues
   */
  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      await markAllAsReadUC.execute(userId);

      res.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error: any) {
      console.error('[NotificationController.markAllAsRead]', error);
      res.status(500).json({
        success: false,
        message: error.message ?? 'Erreur interne du serveur',
        error: 'INTERNAL_ERROR',
      });
    }
  }
}
