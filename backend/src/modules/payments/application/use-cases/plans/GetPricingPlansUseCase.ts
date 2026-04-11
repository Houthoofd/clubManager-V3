/**
 * GetPricingPlansUseCase
 * Cas d'utilisation : récupérer tous les plans tarifaires
 * Permet de filtrer par statut actif/inactif via le paramètre optionnel
 */

import type {
  IPricingPlanRepository,
  PricingPlanRow,
} from "../../../domain/repositories/IPricingPlanRepository.js";

export class GetPricingPlansUseCase {
  constructor(private repo: IPricingPlanRepository) {}

  async execute(actif?: boolean): Promise<PricingPlanRow[]> {
    return this.repo.findAll(actif);
  }
}
