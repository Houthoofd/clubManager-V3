/**
 * GetInformationByKeyUseCase
 * Récupère un paramètre par sa clé unique (Application Layer)
 */

import type { Information } from "@clubmanager/types";
import type { IInformationRepository } from "../../domain/repositories/IInformationRepository.js";

export class GetInformationByKeyUseCase {
  constructor(private repo: IInformationRepository) {}

  async execute(cle: string): Promise<Information> {
    if (!cle || cle.trim().length === 0) {
      throw new Error("La clé est requise");
    }

    const information = await this.repo.findByKey(cle.trim());

    if (!information) {
      throw new Error(`Paramètre '${cle}' introuvable`);
    }

    return information;
  }
}
