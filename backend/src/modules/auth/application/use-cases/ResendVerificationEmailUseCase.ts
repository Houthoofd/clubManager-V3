/**
 * ResendVerificationEmailUseCase
 * Use case pour renvoyer l'email de vérification
 */

import type { ResendVerificationEmailInput } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { TokenService } from "@/shared/services/TokenService.js";
import { EmailService } from "../services/EmailService.js";

export interface ResendVerificationEmailResponse {
  success: boolean;
  message: string;
}

export class ResendVerificationEmailUseCase {
  private emailService: EmailService;

  constructor(private authRepository: IAuthRepository) {
    this.emailService = new EmailService();
  }

  /**
   * Execute le use case de renvoi d'email de vérification
   * @param input - Données contenant l'email
   * @returns Promise<ResendVerificationEmailResponse> - Réponse de succès
   */
  async execute(
    input: ResendVerificationEmailInput,
  ): Promise<ResendVerificationEmailResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(input);

    // 2. Trouver l'utilisateur par email
    const user = await this.authRepository.findUserByEmail(input.email);

    if (!user) {
      // Pour des raisons de sécurité, on retourne toujours success
      // pour ne pas révéler si un email existe dans la base
      return {
        success: true,
        message:
          "If an account exists with this email, a verification email will be sent.",
      };
    }

    // 3. Vérifier si l'email est déjà vérifié
    if (user.email_verified) {
      throw new Error("Email is already verified. You can log in.");
    }

    // 4. Générer un nouveau token de vérification
    const emailVerificationToken =
      TokenService.generateEmailVerificationToken();

    // 5. Stocker le token en base de données
    await this.authRepository.storeEmailVerificationToken(
      user.id,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.email,
    );

    // 6. Construire l'URL de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${emailVerificationToken.token}`;

    // 7. Envoyer l'email de vérification
    const emailResult = await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationUrl,
      user.userId,
    );

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      throw new Error(
        "Failed to send verification email. Please try again later.",
      );
    }

    // 8. Retourner la réponse de succès
    return {
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(input: ResendVerificationEmailInput): void {
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
}
