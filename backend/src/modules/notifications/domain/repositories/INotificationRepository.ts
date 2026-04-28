/**
 * INotificationRepository
 * Interface du repository notifications (Domain Layer)
 * Contrat pour les opérations sur les notifications en base de données
 */

import type { NotificationDto, CreateNotificationDto } from '../types.js';

export interface INotificationRepository {
  /** Retourne les notifications d'un utilisateur, avec filtre optionnel sur non-lues */
  findByUserId(userId: number, onlyUnread?: boolean): Promise<NotificationDto[]>;

  /** Retourne le nombre de notifications non lues d'un utilisateur */
  getUnreadCount(userId: number): Promise<number>;

  /** Marque une notification spécifique comme lue (vérifie l'appartenance via userId) */
  markAsRead(id: number, userId: number): Promise<void>;

  /** Marque toutes les notifications non lues d'un utilisateur comme lues */
  markAllAsRead(userId: number): Promise<void>;

  /** Crée une nouvelle notification et retourne l'objet créé */
  create(data: CreateNotificationDto): Promise<NotificationDto>;

  /** Supprime les notifications plus anciennes que N jours, retourne le nombre supprimé */
  deleteOld(olderThanDays: number): Promise<number>;
}
