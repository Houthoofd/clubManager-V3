/**
 * ArchiveMessageUseCase
 * Use-case : Archive un message pour le destinataire
 */

import type { IMessagingRepository } from "../../domain/repositories/IMessagingRepository.js";

export class ArchiveMessageUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(messageId: number, userId: number): Promise<void> {
    await this.repo.archiveMessage(messageId, userId);
  }
}
