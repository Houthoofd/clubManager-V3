/**
 * CreateRecoveryRequestUseCase
 * Cas d'usage pour soumettre une demande de récupération de compte (accès public)
 * Valide l'email et la raison avant d'insérer en base de données
 */

import type { IRecoveryRepository } from "../../domain/repositories/IRecoveryRepository.js";

export interface CreateRecoveryRequestDto {
  email: string;
  reason: string;
  ip_address: string;
}

export class CreateRecoveryRequestUseCase {
  constructor(private repo: IRecoveryRepository) {}

  async execute(dto: CreateRecoveryRequestDto): Promise<void> {
    if (!dto.email || !dto.email.includes("@")) {
      throw new Error("Adresse email invalide");
    }
    if (!dto.reason || dto.reason.trim().length < 10) {
      throw new Error("La raison doit contenir au moins 10 caractères");
    }
    await this.repo.create(dto);
  }
}
