/**
 * RequestPasswordResetUseCase
 * Use case pour demander la réinitialisation du mot de passe
 */

import type { RequestPasswordResetInput } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { TokenService } from "@/shared/services/TokenService.js";
import { EmailService } from "../services/EmailService.js";

export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
}

export class RequestPasswordResetUseCase {
  private emailService: EmailService;

  constructor(private authRepository: IAuthRepository) {
    this.emailService = new EmailService();
  }

  /**
   * Execute le use case de demande de réinitialisation de mot de passe
   * @param input - Données contenant l'email
   * @param ipAddress - Adresse IP de la requête (optionnel, pour rate limiting)
   * @param userAgent - User agent de la requête (optionnel, pour audit)
   * @returns Promise<RequestPasswordResetResponse> - Réponse de succès
   */
  async execute(
    input: RequestPasswordResetInput,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RequestPasswordResetResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(input);

    // TODO: Implémenter rate limiting avec TokenService
    // Pour l'instant, on continue sans rate limiting
    // await this.checkRateLimit(input.email, ipAddress);

    // 2. Trouver l'utilisateur par email
    const user = await this.authRepository.findUserByEmail(input.email);

    // Pour des raisons de sécurité, on retourne toujours success
    // même si l'utilisateur n'existe pas, pour ne pas révéler
    // si un email existe dans la base de données (anti-énumération)
    if (!user) {
      console.log(
        `Password reset requested for non-existent email: ${input.email}`,
        { ipAddress, userAgent },
      );
      return {
        success: true,
        message:
          "Si un compte existe avec cet email, un lien de réinitialisation vous sera envoyé.",
      };
    }

    // 3. Vérifier que le compte est actif
    if (!user.active || user.deleted_at || user.anonymized) {
      console.log(
        `Password reset requested for inactive/deleted account: ${input.email}`,
        { ipAddress, userAgent },
      );
      // On retourne success sans envoyer d'email (ne pas révéler l'état du compte)
      return {
        success: true,
        message:
          "Si un compte existe avec cet email, un lien de réinitialisation vous sera envoyé.",
      };
    }

    // 4. Générer un token de réinitialisation
    const resetToken = TokenService.generatePasswordResetToken();

    // 5. Stocker le token en base de données
    await this.authRepository.storePasswordResetToken(
      user.id,
      resetToken.token,
      resetToken.expiresAt,
    );

    // 6. Construire l'URL de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken.token}`;

    // 7. Envoyer l'email de réinitialisation
    const emailResult = await this.emailService.sendPasswordResetEmail(
      user.email,
      user.first_name,
      resetUrl,
    );

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      throw new Error(
        "Failed to send password reset email. Please try again later.",
      );
    }

    // 8. Log pour audit
    console.log(`Password reset email sent to: ${user.email}`, {
      userId: user.id,
      ipAddress,
      userAgent,
    });

    // 9. Retourner la réponse de succès
    return {
      success: true,
      message:
        "If an account exists with this email, a password reset link will be sent.",
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(input: RequestPasswordResetInput): void {
    if (!input.email || input.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    // Valider le format de l'email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(input.email)) {
      throw new Error("Invalid email format");
    }

    if (input.email.length > 255) {
      throw new Error("Email is too long (max 255 characters)");
    }
  }

  /**
   * Vérifie le rate limiting pour éviter les abus
   * TODO: Implémenter avec TokenService ou un service de rate limiting
   */
  private async checkRateLimit(
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    // TODO: Implémenter la logique de rate limiting
    // Par exemple, limiter à 3 tentatives par heure par email
    // ou 10 tentatives par heure par IP
  }
}
