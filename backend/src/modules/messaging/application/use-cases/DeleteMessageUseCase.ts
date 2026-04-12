/**
 * DeleteMessageUseCase
 * Supprime un message pour l'utilisateur destinataire
 */

import type { IMessagingRepository } from "../../domain/repositories/IMessagingRepository.js";

export class DeleteMessageUseCase {
  constructor(private repo: IMessagingRepository) {}

  async execute(messageId: number, userId: number): Promise<void> {
    const msg = await this.repo.getById(messageId, userId);
    if (!msg) throw new Error("Message introuvable ou accès refusé");
    await this.repo.deleteForUser(messageId, userId);
  }
}
