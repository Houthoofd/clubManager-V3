/**
 * Notification Domain Types
 * Local type definitions for the notifications module
 */

export type NotificationKind = 'info' | 'warning' | 'error' | 'success';

export interface NotificationDto {
  id: number;
  user_id: number;
  type: NotificationKind;
  titre: string;
  contenu: string;
  lu: boolean;
  created_at: string; // ISO string
}

export interface CreateNotificationDto {
  user_id: number;
  type: NotificationKind;
  titre: string;
  contenu: string;
}
