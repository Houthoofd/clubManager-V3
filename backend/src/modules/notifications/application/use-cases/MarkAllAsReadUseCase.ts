/**
 * MarkAllAsReadUseCase
 * Cas d'utilisation : marquer toutes les notifications d'un utilisateur comme lues
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';

export class MarkAllAsReadUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(userId: number): Promise<void> {
    await this.repo.markAllAsRead(userId);
  }
}
