/**
 * RevokeInvitationUseCase
 * Révoque une invitation pending par son ID
 * Interdit de révoquer une invitation déjà utilisée ou révoquée
 */

import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";

export interface RevokeInvitationDto {
  id: number;
}

export class RevokeInvitationUseCase {
  constructor(private repo: IInvitationRepository) {}

  async execute(dto: RevokeInvitationDto): Promise<void> {
    const invitation = await this.repo.findById(dto.id);

    if (!invitation) {
      throw new Error("Invitation introuvable.");
    }

    if (invitation.status !== "pending") {
      throw new Error(
        "Impossible de révoquer une invitation déjà utilisée ou révoquée.",
      );
    }

    await this.repo.revoke(dto.id);
  }
}
