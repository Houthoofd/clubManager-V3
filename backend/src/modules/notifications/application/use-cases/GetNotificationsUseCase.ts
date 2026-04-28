/**
 * GetNotificationsUseCase
 * Cas d'utilisation : récupérer les notifications d'un utilisateur
 * Supporte un filtre optionnel pour n'obtenir que les non-lues
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';
import type { NotificationDto } from '../../domain/types.js';

export class GetNotificationsUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(userId: number, onlyUnread?: boolean): Promise<NotificationDto[]> {
    return this.repo.findByUserId(userId, onlyUnread);
  }
}
