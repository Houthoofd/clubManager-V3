/**
 * ConsumeInvitationUseCase
 * Consomme un token d'invitation valide en le marquant comme utilisé
 * Destiné à être appelé lors de l'inscription d'un utilisateur invité
 */

import crypto from "crypto";
import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";

export interface ConsumeInvitationDto {
  token: string;
}

export class ConsumeInvitationUseCase {
  constructor(private repo: IInvitationRepository) {}

  async execute(dto: ConsumeInvitationDto): Promise<void> {
    const tokenHash = crypto.createHash("sha256").update(dto.token).digest("hex");
    const invitation = await this.repo.findByTokenHash(tokenHash);

    if (!invitation) {
      throw new Error("Invitation introuvable.");
    }

    if (invitation.status !== "pending") {
      throw new Error("Cette invitation a déjà été utilisée ou révoquée.");
    }

    if (new Date() > invitation.expires_at) {
      throw new Error("Cette invitation a expiré.");
    }

    await this.repo.markAsUsed(invitation.id);
  }
}
