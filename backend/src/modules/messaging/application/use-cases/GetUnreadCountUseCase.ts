/**
 * GetUnreadCountUseCase
 * Retourne le nombre de messages non lus pour un utilisateur
 */

import type { IMessagingRepository } from "../../domain/repositories/IMessagingRepository.js";

export class GetUnreadCountUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(userId: number): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }
}
