/**
 * UpdatePricingPlanUseCase
 * Cas d'utilisation : mettre à jour un plan tarifaire existant
 * Vérifie l'existence du plan avant la mise à jour et valide les champs fournis
 */

import type {
  IPricingPlanRepository,
  UpdatePricingPlanInput,
} from "../../../domain/repositories/IPricingPlanRepository.js";

export class UpdatePricingPlanUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(id: number, data: UpdatePricingPlanInput): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Plan introuvable");

    if (data.prix !== undefined && data.prix <= 0) {
      throw new Error("Le prix doit être supérieur à 0");
    }
    if (data.duree_mois !== undefined && data.duree_mois <= 0) {
      throw new Error("La durée en mois doit être supérieure à 0");
    }
    if (data.nom !== undefined && data.nom.trim() === "") {
      throw new Error("Le nom du plan ne peut pas être vide");
    }

    await this.repo.update(id, {
      ...data,
      nom: data.nom !== undefined ? data.nom.trim() : undefined,
    });
  }
}
