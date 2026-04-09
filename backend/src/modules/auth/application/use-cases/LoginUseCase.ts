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

    // 2. Trouver l'utilisateur par userId
    const user = await this.authRepository.findUserByUserId(dto.userId);
    if (!user) {
      throw new Error("Identifiant ou mot de passe invalide");
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
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error("Identifiant ou mot de passe invalide");
    }

    // 6. Vérifier si l'email est vérifié
    if (!user.email_verified) {
      const error = new Error(
        "Veuillez vérifier votre adresse email avant de vous connecter.",
      ) as any;
      error.statusCode = 403;
      error.code = "EMAIL_NOT_VERIFIED";
      throw error;
    }

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
      refreshTokenExpiry,
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
    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new Error("L'identifiant est requis");
    }

    if (!dto.password || dto.password.trim().length === 0) {
      throw new Error("Le mot de passe est requis");
    }

    // Valider le format de l'identifiant (ex: U-2024-0001)
    const userIdRegex = /^U-\d{4}-\d{4}$/;
    if (!userIdRegex.test(dto.userId)) {
      throw new Error("Format d'identifiant invalide (attendu: U-YYYY-XXXX)");
    }
  }
}
