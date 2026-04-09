/**
 * VerifyEmailUseCase
 * Use case pour la vérification de l'email d'un utilisateur
 */

import type { VerifyEmailInput } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export class VerifyEmailUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute le use case de vérification d'email
   * @param input - Données contenant le token de vérification
   * @returns Promise<VerifyEmailResponse> - Réponse de vérification
   */
  async execute(input: VerifyEmailInput): Promise<VerifyEmailResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(input);

    // 2. Valider le token et récupérer l'ID utilisateur
    const userId = await this.authRepository.validateEmailVerificationToken(
      input.token
    );

    if (!userId) {
      throw new Error(
        "Invalid or expired verification token. Please request a new verification email."
      );
    }

    // 3. Marquer l'email comme vérifié
    await this.authRepository.markEmailAsVerified(userId);

    // 4. Le token est déjà marqué comme utilisé par validateEmailVerificationToken
    // Pas besoin de le supprimer/marquer à nouveau

    // 5. Retourner la réponse de succès
    return {
      success: true,
      message: "Email verified successfully. You can now log in.",
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(input: VerifyEmailInput): void {
    if (!input.token || input.token.trim().length === 0) {
      throw new Error("Verification token is required");
    }

    if (input.token.length > 500) {
      throw new Error("Invalid verification token");
    }
  }
}
