/**
 * GetTemplatesUseCase
 * Retourne la liste des templates avec filtres optionnels
 */

import type { ITemplateRepository, Template } from "../../domain/repositories/ITemplateRepository.js";

// ==================== DTO ====================

export interface GetTemplatesDto {
  type_id?: number;
  actif?: boolean;
}

// ==================== USE CASE ====================

export class GetTemplatesUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(dto: GetTemplatesDto = {}): Promise<Template[]> {
    return this.repo.getAll(dto.type_id, dto.actif);
  }
}
