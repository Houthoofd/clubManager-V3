/**
 * CreatePricingPlanUseCase
 * Cas d'utilisation : créer un nouveau plan tarifaire
 * Valide que le nom, le prix et la durée sont fournis et valides avant la création
 */

import type {
  IPricingPlanRepository,
  CreatePricingPlanInput,
} from "../../../domain/repositories/IPricingPlanRepository.js";

export class CreatePricingPlanUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(data: CreatePricingPlanInput): Promise<number> {
    if (!data.nom || data.nom.trim() === "") {
      throw new Error("Le nom du plan est requis");
    }
    if (!data.prix || data.prix <= 0) {
      throw new Error("Le prix doit être supérieur à 0");
    }
    if (!data.duree_mois || data.duree_mois <= 0) {
      throw new Error("La durée en mois doit être supérieure à 0");
    }

    return this.repo.create({
      ...data,
      nom: data.nom.trim(),
    });
  }
}
