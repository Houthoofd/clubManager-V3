/**
 * GetTemplateByIdUseCase
 * Retourne un template par son ID — lève une erreur s'il est introuvable
 */

import type { ITemplateRepository, Template } from "../../domain/repositories/ITemplateRepository.js";

export class GetTemplateByIdUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number): Promise<Template> {
    const template = await this.repo.getById(id);

    if (!template) {
      throw new Error("Template introuvable");
    }

    return template;
  }
}
