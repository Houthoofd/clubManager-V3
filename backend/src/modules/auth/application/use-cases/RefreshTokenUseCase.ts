/**
 * RefreshTokenUseCase
 * Use case pour le renouvellement des tokens JWT
 */

import type { RefreshTokenDto, AuthResponseDto } from "@clubmanager/types";
import { UserRole } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { JwtService } from "@/shared/services/JwtService.js";

export class RefreshTokenUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute le use case de refresh token
   * @param dto - Refresh token à renouveler
   * @returns Promise<AuthResponseDto> - Nouveaux tokens
   */
  async execute(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Vérifier et décoder le refresh token (JWT)
    let decoded;
    try {
      decoded = JwtService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }

    // 3. Vérifier que le token existe en base et n'est pas révoqué
    const userId = await this.authRepository.validateRefreshToken(
      dto.refreshToken,
    );

    if (!userId) {
      throw new Error("Refresh token not found or revoked");
    }

    // 4. Vérifier que l'userId du token correspond
    if (userId !== decoded.userId) {
      throw new Error("Token user mismatch");
    }

    // 5. Récupérer l'utilisateur
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // 6. Vérifier que le compte est actif
    if (!user.active) {
      throw new Error("Account is disabled");
    }

    // 7. Vérifier que le compte n'est pas supprimé
    if (user.deleted_at || user.anonymized) {
      throw new Error("Account not found");
    }

    // 8. Révoquer l'ancien refresh token (rotation strategy)
    await this.authRepository.deleteRefreshToken(dto.refreshToken);

    // 9. Générer de nouveaux tokens
    const newTokens = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      userIdString: user.userId,
      role_app: user.role_app ?? UserRole.MEMBER,
    });

    // 10. Stocker le nouveau refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 jours
    await this.authRepository.storeRefreshToken(
      user.id,
      newTokens.refreshToken,
      refreshTokenExpiry,
    );

    // 11. Mettre à jour la dernière connexion
    await this.authRepository.updateLastLogin(user.id);

    // 12. Retourner la réponse
    return {
      success: true,
      message: "Token refreshed successfully",
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
          role_app: user.role_app ?? UserRole.MEMBER,
        },
        tokens: newTokens,
      },
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(dto: RefreshTokenDto): void {
    if (!dto.refreshToken || dto.refreshToken.trim().length === 0) {
      throw new Error("Refresh token is required");
    }
  }
}
