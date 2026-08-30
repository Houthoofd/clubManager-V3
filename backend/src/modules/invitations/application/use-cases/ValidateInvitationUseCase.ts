/**
 * ValidateInvitationUseCase
 * Valide un token d'invitation sans le consommer
 * Retourne { valid, email } ou { valid: false, error }
 */

import crypto from "crypto";
import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";

export interface ValidateInvitationDto {
  token: string;
}

export interface ValidateInvitationResult {
  valid: boolean;
  email?: string;
  error?: string;
}

export class ValidateInvitationUseCase {
  constructor(private repo: IInvitationRepository) {}

  async execute(dto: ValidateInvitationDto): Promise<ValidateInvitationResult> {
    const tokenHash = crypto.createHash("sha256").update(dto.token).digest("hex");
    const invitation = await this.repo.findByTokenHash(tokenHash);

    if (!invitation) {
      return { valid: false, error: "Invitation introuvable." };
    }

    if (invitation.status !== "pending") {
      return {
        valid: false,
        error: "Cette invitation a déjà été utilisée ou révoquée.",
      };
    }

    if (new Date() > invitation.expires_at) {
      return { valid: false, error: "Cette invitation a expiré." };
    }

    return { valid: true, email: invitation.email };
  }
}
