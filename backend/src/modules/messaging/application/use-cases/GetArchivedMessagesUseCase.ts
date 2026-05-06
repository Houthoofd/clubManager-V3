/**
 * GetArchivedMessagesUseCase
 * Use-case : Retourne les messages archivés paginés d'un utilisateur
 */

import type {
  IMessagingRepository,
  PaginatedMessages,
} from "../../domain/repositories/IMessagingRepository.js";

export class GetArchivedMessagesUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(userId: number, page: number, limit: number): Promise<PaginatedMessages> {
    return this.repo.getArchived(userId, page, limit);
  }
}
