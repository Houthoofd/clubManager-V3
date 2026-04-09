/**
 * ResetPasswordUseCase
 * Use case pour réinitialiser le mot de passe d'un utilisateur
 */

import type { ResetPasswordInput } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { PasswordService } from "@/shared/services/PasswordService.js";
import { EmailService } from "../services/EmailService.js";

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export class ResetPasswordUseCase {
  private emailService: EmailService;

  constructor(private authRepository: IAuthRepository) {
    this.emailService = new EmailService();
  }

  /**
   * Execute le use case de réinitialisation de mot de passe
   * @param input - Données contenant le token et le nouveau mot de passe
   * @returns Promise<ResetPasswordResponse> - Réponse de succès
   */
  async execute(input: ResetPasswordInput): Promise<ResetPasswordResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(input);

    // 2. Valider le token et récupérer l'ID utilisateur
    const userId = await this.authRepository.validatePasswordResetToken(
      input.token
    );

    if (!userId) {
      throw new Error(
        "Invalid or expired password reset token. Please request a new password reset."
      );
    }

    // 3. Récupérer l'utilisateur
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // 4. Vérifier que le compte est actif
    if (!user.active || user.deleted_at || user.anonymized) {
      throw new Error("Account is disabled or deleted");
    }

    // 5. Valider la force du nouveau mot de passe
    const passwordValidation = PasswordService.validatePasswordStrength(
      input.newPassword
    );

    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`
      );
    }

    // 6. Hasher le nouveau mot de passe
    const hashedPassword = await PasswordService.hash(input.newPassword);

    // 7. Mettre à jour le mot de passe en base de données
    await this.authRepository.updatePassword(user.id, hashedPassword);

    // 8. Marquer le token comme utilisé (supprimer/invalider)
    await this.authRepository.deletePasswordResetToken(input.token);

    // 9. Supprimer tous les autres tokens de reset pour cet utilisateur
    await this.authRepository.deleteAllPasswordResetTokens(user.id);

    // 10. Invalider tous les refresh tokens (logout de tous les appareils)
    await this.authRepository.deleteAllRefreshTokens(user.id);

    // 11. Envoyer un email de confirmation de changement de mot de passe
    const emailResult = await this.emailService.sendPasswordChangedEmail(
      user.email,
      user.first_name
    );

    if (!emailResult.success) {
      // On log l'erreur mais on ne bloque pas le processus
      // car le mot de passe a déjà été changé avec succès
      console.error(
        "Failed to send password changed confirmation email:",
        emailResult.error
      );
    }

    // 12. Log pour audit
    console.log(`Password reset completed for user: ${user.email}`, {
      userId: user.id,
    });

    // 13. Retourner la réponse de succès
    return {
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(input: ResetPasswordInput): void {
    // Valider le token
    if (!input.token || input.token.trim().length === 0) {
      throw new Error("Reset token is required");
    }

    if (input.token.length > 500) {
      throw new Error("Invalid reset token");
    }

    // Valider le nouveau mot de passe
    if (!input.newPassword || input.newPassword.trim().length === 0) {
      throw new Error("New password is required");
    }

    if (input.newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (input.newPassword.length > 72) {
      throw new Error("Password cannot exceed 72 characters");
    }

    // Valider la confirmation du mot de passe
    if (!input.confirmPassword || input.confirmPassword.trim().length === 0) {
      throw new Error("Password confirmation is required");
    }

    if (input.newPassword !== input.confirmPassword) {
      throw new Error("Passwords do not match");
    }
  }
}
