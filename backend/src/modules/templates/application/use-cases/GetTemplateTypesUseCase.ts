/**
 * GetTemplateTypesUseCase
 * Retourne tous les types de templates (avec compteur de templates associés)
 */

import type { ITemplateRepository, TemplateType } from "../../domain/repositories/ITemplateRepository.js";

export class GetTemplateTypesUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(): Promise<TemplateType[]> {
    return this.repo.getTypes();
  }
}
