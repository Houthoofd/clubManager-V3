/**
 * UpsertInformationUseCase
 * Crée ou met à jour un paramètre par sa clé (Application Layer)
 */

import type { CreateInformation, Information } from "@clubmanager/types";
import type { IInformationRepository } from "../../domain/repositories/IInformationRepository.js";

export class UpsertInformationUseCase {
  constructor(private repo: IInformationRepository) {}

  async execute(data: CreateInformation): Promise<Information> {
    if (!data.cle || data.cle.trim().length === 0) {
      throw new Error("La clé est requise");
    }
    if (!data.valeur || data.valeur.trim().length === 0) {
      throw new Error("La valeur est requise");
    }
    if (data.cle.trim().length > 100) {
      throw new Error("La clé ne peut pas dépasser 100 caractères");
    }

    return this.repo.upsert({
      cle: data.cle.trim(),
      valeur: data.valeur.trim(),
      description: data.description?.trim() ?? null,
    });
  }
}
