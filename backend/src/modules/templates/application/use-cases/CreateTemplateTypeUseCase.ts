/**
 * CreateTemplateTypeUseCase
 * Crée un nouveau type de template de message
 */

import type { ITemplateRepository, TemplateType } from "../../domain/repositories/ITemplateRepository.js";

// ==================== DTO ====================

export interface CreateTemplateTypeDto {
  nom: string;
  description?: string;
}

// ==================== USE CASE ====================

export class CreateTemplateTypeUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(dto: CreateTemplateTypeDto): Promise<TemplateType> {
    // Validation : le nom est obligatoire
    if (!dto.nom || dto.nom.trim().length === 0) {
      throw new Error("Le nom du type de template est requis");
    }

    if (dto.nom.trim().length > 100) {
      throw new Error("Le nom du type de template ne peut pas dépasser 100 caractères");
    }

    return this.repo.createType({
      nom: dto.nom.trim(),
      description: dto.description?.trim(),
    });
  }
}
