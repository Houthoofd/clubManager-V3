/**
 * DeleteNotificationUseCase
 * Cas d'utilisation : supprimer une notification specifique
 * L'ownership check est delegue au repository (WHERE id = ? AND user_id = ?)
 */

import type { INotificationRepository } from '../../domain/repositories/INotificationRepository.js';

export class DeleteNotificationUseCase {
  constructor(private repo: INotificationRepository) {}

  async execute(id: number, userId: number): Promise<boolean> {
    return this.repo.deleteById(id, userId);
  }
}
