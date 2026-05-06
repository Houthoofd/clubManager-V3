/**
 * INotificationRepository
 * Interface du repository notifications (Domain Layer)
 * Contrat pour les operations sur les notifications en base de donnees
 */

import type { NotificationDto, CreateNotificationDto } from '../types.js';

export interface INotificationRepository {
  /** Retourne les notifications d'un utilisateur, avec filtre optionnel sur non-lues */
  findByUserId(userId: number, onlyUnread?: boolean): Promise<NotificationDto[]>;

  /** Retourne le nombre de notifications non lues d'un utilisateur */
  getUnreadCount(userId: number): Promise<number>;

  /** Marque une notification specifique comme lue (verifie l'appartenance via userId) */
  markAsRead(id: number, userId: number): Promise<void>;

  /** Marque toutes les notifications non lues d'un utilisateur comme lues */
  markAllAsRead(userId: number): Promise<void>;

  /** Cree une nouvelle notification et retourne l'objet cree */
  create(data: CreateNotificationDto): Promise<NotificationDto>;

  /** Supprime les notifications plus anciennes que N jours, retourne le nombre supprime */
  deleteOld(olderThanDays: number): Promise<number>;

  /** Supprime une notification specifique d'un utilisateur, retourne true si supprimee */
  deleteById(id: number, userId: number): Promise<boolean>;

  /** Supprime toutes les notifications d'un utilisateur, retourne le nombre supprime */
  deleteAll(userId: number): Promise<number>;
}
