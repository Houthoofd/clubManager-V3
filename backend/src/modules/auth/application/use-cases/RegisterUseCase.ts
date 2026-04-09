/**
 * RegisterUseCase
 * Use case pour l'inscription d'un nouvel utilisateur
 */

import type { RegisterDto } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { PasswordService } from "@/shared/services/PasswordService.js";
import { TokenService } from "@/shared/services/TokenService.js";
import { EmailService } from "../services/EmailService.js";

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    email: string;
    firstName: string;
  };
}

export class RegisterUseCase {
  private emailService: EmailService;

  constructor(private authRepository: IAuthRepository) {
    this.emailService = new EmailService();
  }

  /**
   * Execute le use case d'inscription
   * @param dto - Données d'inscription
   * @returns Promise<AuthResponseDto> - Réponse avec utilisateur et tokens
   */
  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Valider la force du mot de passe
    const passwordValidation = PasswordService.validatePasswordStrength(
      dto.password,
    );
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`,
      );
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await PasswordService.hash(dto.password);

    // 4. Créer l'utilisateur
    const user = await this.authRepository.createUser({
      first_name: dto.first_name,
      last_name: dto.last_name,
      nom_utilisateur: dto.nom_utilisateur,
      email: dto.email,
      password: hashedPassword,
      date_of_birth: new Date(dto.date_of_birth),
      genre_id: dto.genre_id,
      abonnement_id: dto.abonnement_id,
    });

    // 5. Générer et stocker le token de vérification email
    const emailVerificationToken =
      TokenService.generateEmailVerificationToken();
    await this.authRepository.storeEmailVerificationToken(
      user.id,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.email,
    );

    // 6. Construire l'URL de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${emailVerificationToken.token}`;

    // 7. Envoyer l'email de vérification avec l'userId
    const emailResult = await this.emailService.sendVerificationEmail(
      user.email,
      user.first_name,
      verificationUrl,
      user.userId,
    );

    if (!emailResult.success) {
      // On log l'erreur mais on ne bloque pas l'inscription
      // L'utilisateur peut redemander l'email depuis la page de connexion
      console.error(
        "Failed to send verification email after registration:",
        emailResult.error,
      );
      // En dev, logger le lien pour pouvoir tester sans domaine vérifié
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `\n[RegisterUseCase][DEV] 📧 Lien de vérification (email non envoyé)\n` +
            `  UserId:  ${user.userId}\n` +
            `  Email:   ${user.email}\n` +
            `  Lien:    ${verificationUrl}\n`,
        );
      }
    }

    // 8. Retourner la réponse sans tokens — connexion impossible avant vérification email
    return {
      success: true,
      message:
        "Compte créé avec succès. Veuillez vérifier votre adresse email pour activer votre compte.",
      data: {
        userId: user.userId,
        email: user.email,
        firstName: user.first_name,
      },
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(dto: RegisterDto): void {
    // Valider les champs requis
    if (!dto.first_name || dto.first_name.trim().length === 0) {
      throw new Error("First name is required");
    }

    if (!dto.last_name || dto.last_name.trim().length === 0) {
      throw new Error("Last name is required");
    }

    if (!dto.email || dto.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    if (!dto.password || dto.password.trim().length === 0) {
      throw new Error("Password is required");
    }

    if (!dto.date_of_birth) {
      throw new Error("Date of birth is required");
    }

    if (!dto.genre_id) {
      throw new Error("Genre is required");
    }

    // Valider le format de l'email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(dto.email)) {
      throw new Error("Invalid email format");
    }

    // Valider la date de naissance
    const birthDate = new Date(dto.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 5 || age > 120) {
      throw new Error("Invalid date of birth");
    }

    // Valider la longueur des noms
    if (dto.first_name.length > 100) {
      throw new Error("First name is too long (max 100 characters)");
    }

    if (dto.last_name.length > 100) {
      throw new Error("Last name is too long (max 100 characters)");
    }

    if (dto.nom_utilisateur && dto.nom_utilisateur.length > 50) {
      throw new Error("Username is too long (max 50 characters)");
    }
  }
}
