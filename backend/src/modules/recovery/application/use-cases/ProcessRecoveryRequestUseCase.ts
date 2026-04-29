/**
 * ProcessRecoveryRequestUseCase
 * Cas d'utilisation : traiter une demande de récupération manuelle (approbation ou rejet)
 * Vérifie l'existence de la demande et son statut courant avant de modifier la base de données
 */

import type { IRecoveryRepository } from "../../domain/repositories/IRecoveryRepository.js";
import type { ProcessRecoveryDto } from "../../domain/types.js";

export class ProcessRecoveryRequestUseCase {
  constructor(private repo: IRecoveryRepository) {}

  async execute(dto: ProcessRecoveryDto): Promise<void> {
    // 1. Vérifier que la demande existe
    const request = await this.repo.findById(dto.id);
    if (!request) {
      throw new Error("Demande introuvable");
    }

    // 2. Vérifier que la demande n'a pas déjà été traitée
    if (request.status === "approved" || request.status === "rejected") {
      throw new Error("Cette demande a déjà été traitée");
    }

    // 3. Appliquer le nouveau statut
    await this.repo.updateStatus(dto.id, dto.status);
  }
}
