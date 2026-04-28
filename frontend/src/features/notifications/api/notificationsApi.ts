/**
 * Notifications API
 * Fonctions d'accès à l'API pour les notifications in-app
 */

import apiClient from '../../../shared/api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: number;
  user_id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  titre: string;
  contenu: string;
  lu: boolean;
  created_at: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const notificationsApi = {
  /**
   * Récupère la liste des notifications de l'utilisateur connecté.
   * @param unreadOnly - Si true, retourne uniquement les non-lues
   */
  getNotifications: async (unreadOnly?: boolean): Promise<NotificationDto[]> => {
    const res = await apiClient.get('/notifications', {
      params: unreadOnly ? { unread: true } : {},
    });
    return res.data.data ?? [];
  },

  /**
   * Récupère le nombre de notifications non-lues.
   */
  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get('/notifications/unread-count');
    return res.data.data?.count ?? 0;
  },

  /**
   * Marque une notification spécifique comme lue.
   * @param id - L'identifiant de la notification
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  /**
   * Marque toutes les notifications de l'utilisateur comme lues.
   */
  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
  },
};
