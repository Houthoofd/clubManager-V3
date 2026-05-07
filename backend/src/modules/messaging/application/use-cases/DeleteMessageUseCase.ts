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
    // Enregistrer le statut supprimé avant la suppression physique (audit trail)
    await this.repo.recordMessageStatus({
      message_id: messageId,
      user_id: userId,
      statut: 'supprime',
    });
    await this.repo.deleteForUser(messageId, userId);
  }
}
