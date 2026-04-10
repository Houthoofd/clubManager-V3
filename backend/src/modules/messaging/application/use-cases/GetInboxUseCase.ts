/**
 * GetInboxUseCase
 * Récupère les messages reçus (boîte de réception) d'un utilisateur, paginés
 */

import type { IMessagingRepository, PaginatedMessages } from "../../domain/repositories/IMessagingRepository.js";

export class GetInboxUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(userId: number, page = 1, limit = 20, lu?: boolean): Promise<PaginatedMessages> {
    return this.repo.getInbox(userId, Math.max(1, page), Math.min(50, limit), lu);
  }
}
