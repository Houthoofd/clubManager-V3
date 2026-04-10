/**
 * GetSentUseCase
 * Cas d'utilisation : récupérer les messages envoyés (boîte d'envoi)
 */

import type { IMessagingRepository, PaginatedMessages } from "../../domain/repositories/IMessagingRepository.js";

export class GetSentUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(userId: number, page = 1, limit = 20): Promise<PaginatedMessages> {
    return this.repo.getSent(userId, Math.max(1, page), Math.min(50, limit));
  }
}
