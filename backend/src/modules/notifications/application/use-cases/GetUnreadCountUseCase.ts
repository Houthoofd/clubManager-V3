/**
 * GetUnreadCountUseCase
 * Cas d'utilisation : récupérer le nombre de notifications non lues d'un utilisateur
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';

export class GetUnreadCountUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(userId: number): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }
}
