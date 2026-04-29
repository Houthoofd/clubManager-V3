/**
 * MarkAsReadUseCase
 * Cas d'utilisation : marquer une notification spécifique comme lue
 * L'ownership check est délégué au repository (WHERE id = ? AND user_id = ?)
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';

export class MarkAsReadUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(id: number, userId: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error("L'identifiant de la notification est invalide");
    }
    if (!userId || userId <= 0) {
      throw new Error("L'identifiant de l'utilisateur est invalide");
    }

    await this.repo.markAsRead(id, userId);
  }
}
