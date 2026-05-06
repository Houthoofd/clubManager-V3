/**
 * ConfirmEmailChangeUseCase
 * GAP-15 — Confirmation du changement d'email via token
 *
 * Flow :
 * 1. Valide le token (existence, expiration, type = change_email)
 * 2. Récupère le nouvel email stocké dans le token
 * 3. Met à jour l'email de l'utilisateur en DB
 */

import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";

export class ConfirmEmailChangeUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(token: string): Promise<{ userId: number; newEmail: string }> {
    // 1. Valider le token
    const result = await this.authRepository.validateEmailChangeToken(token);
    if (!result) {
      throw new Error("TOKEN_INVALID_OR_EXPIRED");
    }

    const { userId, newEmail } = result;

    // 2. Mettre à jour l'email
    await this.authRepository.updateEmail(userId, newEmail);

    return { userId, newEmail };
  }
}
