/**
 * LoginUseCase
 * Use case pour l'authentification d'un utilisateur
 */

import type { LoginDto, AuthResponseDto } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { PasswordService } from "@/shared/services/PasswordService.js";
import { JwtService } from "@/shared/services/JwtService.js";

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute le use case de connexion
   * @param dto - Données de connexion (email + password)
   * @returns Promise<AuthResponseDto> - Réponse avec utilisateur et tokens
   */
  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Trouver l'utilisateur par email
    const user = await this.authRepository.findUserByEmail(dto.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // 3. Vérifier que le compte est actif
    if (!user.active) {
      throw new Error("Account is disabled");
    }

    // 4. Vérifier que le compte n'est pas supprimé
    if (user.deleted_at || user.anonymized) {
      throw new Error("Account not found");
    }

    // 5. Comparer le mot de passe
    const isPasswordValid = await PasswordService.compare(
      dto.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 6. Vérifier si l'email est vérifié (optionnel, selon la configuration)
    // if (!user.email_verified) {
    //   throw new Error("Please verify your email before logging in");
    // }

    // 7. Générer les tokens JWT
    const tokens = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      userIdString: user.userId,
    });

    // 8. Stocker le refresh token en base
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 jours
    await this.authRepository.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      refreshTokenExpiry
    );

    // 9. Mettre à jour la dernière connexion
    await this.authRepository.updateLastLogin(user.id);

    // 10. Retourner la réponse
    return {
      success: true,
      message: "Login successful",
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
  private validateInput(dto: LoginDto): void {
    if (!dto.email || dto.email.trim().length === 0) {
      throw new Error("Email is required");
    }

    if (!dto.password || dto.password.trim().length === 0) {
      throw new Error("Password is required");
    }

    // Valider le format de l'email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(dto.email)) {
      throw new Error("Invalid email format");
    }
  }
}
