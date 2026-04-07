/**
 * RegisterUseCase
 * Use case pour l'inscription d'un nouvel utilisateur
 */

import type { RegisterDto, AuthResponseDto } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { PasswordService } from "@/shared/services/PasswordService.js";
import { JwtService } from "@/shared/services/JwtService.js";
import { TokenService } from "@/shared/services/TokenService.js";

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute le use case d'inscription
   * @param dto - Données d'inscription
   * @returns Promise<AuthResponseDto> - Réponse avec utilisateur et tokens
   */
  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Vérifier si l'email existe déjà
    const emailExists = await this.authRepository.emailExists(dto.email);
    if (emailExists) {
      throw new Error("Email already registered");
    }

    // 3. Valider la force du mot de passe
    const passwordValidation = PasswordService.validatePasswordStrength(
      dto.password
    );
    if (!passwordValidation.isValid) {
      throw new Error(
        `Password validation failed: ${passwordValidation.errors.join(", ")}`
      );
    }

    // 4. Hasher le mot de passe
    const hashedPassword = await PasswordService.hash(dto.password);

    // 5. Créer l'utilisateur
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

    // 6. Générer les tokens JWT
    const tokens = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      userIdString: user.userId,
    });

    // 7. Stocker le refresh token en base
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 jours
    await this.authRepository.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      refreshTokenExpiry
    );

    // 8. Générer et stocker le token de vérification email
    const emailVerificationToken =
      TokenService.generateEmailVerificationToken();
    await this.authRepository.storeEmailVerificationToken(
      user.id,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt
    );

    // TODO: Envoyer l'email de vérification (Sprint 3)
    // await EmailService.sendVerificationEmail(user.email, emailVerificationToken.token);

    // 9. Retourner la réponse
    return {
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: {
          id: user.id,
          userId: user.userId,
          first_name: user.first_name,
          last_name: user.last_name,
          nom_utilisateur: user.nom_utilisateur,
          email: user.email,
          email_verified: user.email_verified,
          status_id: user.status_id,
          grade_id: user.grade_id,
          abonnement_id: user.abonnement_id,
        },
        tokens,
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
