/**
 * GetInvitationsUseCase
 * Retourne la liste paginée de toutes les invitations
 */

import type { IInvitationRepository } from "../../domain/repositories/IInvitationRepository.js";
import type { Invitation } from "../../domain/types.js";

export interface GetInvitationsDto {
  page: number;
  limit: number;
}

export class GetInvitationsUseCase {
  constructor(private repo: IInvitationRepository) {}

  async execute(
    dto: GetInvitationsDto,
  ): Promise<{ data: Invitation[]; total: number }> {
    return this.repo.findAll(dto.page, dto.limit);
  }
}
