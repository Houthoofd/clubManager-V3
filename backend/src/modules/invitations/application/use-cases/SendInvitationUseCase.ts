/**
 * SendInvitationUseCase
 * Génère un token d'invitation sécurisé et l'enregistre en base de données
 * Vérifie qu'aucune invitation pending non expirée n'existe déjà pour cet email
 */

import crypto from "crypto";
import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";
import type { Invitation } from "../../domain/types.js";

export interface SendInvitationDto {
  email: string;
  invited_by: number;
}

export interface SendInvitationResult {
  /** Token en clair à transmettre à l'invité (non stocké en DB) */
  token: string;
  invitation: Invitation;
}

export class SendInvitationUseCase {
  constructor(private repo: IInvitationRepository) {}

  async execute(dto: SendInvitationDto): Promise<SendInvitationResult> {
    // Vérifie qu'aucune invitation pending non expirée n'existe pour cet email
    const existing = await this.repo.findByEmail(dto.email);
    if (existing) {
      throw new Error("Une invitation est déjà en attente pour cet email.");
    }

    // Génère un token aléatoire de 64 caractères hex
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Expire dans 7 jours
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await this.repo.create({
      email: dto.email,
      invited_by: dto.invited_by,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    return { token, invitation };
  }
}
