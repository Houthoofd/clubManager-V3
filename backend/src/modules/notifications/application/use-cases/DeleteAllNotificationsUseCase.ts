/**
 * DeleteAllNotificationsUseCase
 * Cas d'utilisation : supprimer toutes les notifications d'un utilisateur
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';

export class DeleteAllNotificationsUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(userId: number): Promise<number> {
    return this.repo.deleteAll(userId);
  }
}
