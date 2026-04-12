/**
 * DeleteTemplateTypeUseCase
 * Supprime un type de template — refuse si des templates actifs y sont rattachés
 */

import type { ITemplateRepository } from "../../domain/repositories/ITemplateRepository.js";

export class DeleteTemplateTypeUseCase {
  constructor(private repo: ITemplateRepository) {}

  async execute(id: number): Promise<void> {
    // Vérifier que le type existe
    const types = await this.repo.getTypes();
    const type = types.find((t) => t.id === id);

    if (!type) {
      throw new Error("Type de template introuvable");
    }

    // Refuser la suppression si des templates actifs y sont rattachés
    const templates = await this.repo.getAll(id, true);

    if (templates.length > 0) {
      throw new Error(
        `Impossible de supprimer ce type : ${templates.length} template(s) actif(s) y sont rattachés. ` +
          `Désactivez ou supprimez ces templates avant de supprimer le type.`,
      );
    }

    await this.repo.deleteType(id);
  }
}
