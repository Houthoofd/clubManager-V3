/**
 * LogoutUseCase
 * Use case pour la déconnexion d'un utilisateur
 */

import type { LogoutDto } from "@clubmanager/types";
import type { IAuthRepository } from "../../domain/repositories/IAuthRepository.js";
import { JwtService } from "@/shared/services/JwtService.js";

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute le use case de déconnexion
   * @param dto - Refresh token à révoquer
   * @returns Promise<{ success: true; message: string }> - Confirmation de déconnexion
   */
  async execute(dto: LogoutDto): Promise<{ success: true; message: string }> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Vérifier et décoder le refresh token (pour validation)
    let decoded;
    try {
      decoded = JwtService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      // Le token peut être expiré, mais on le révoque quand même
      // pour éviter qu'il soit réutilisé
    }

    // 3. Révoquer le refresh token en base
    await this.authRepository.deleteRefreshToken(dto.refreshToken);

    // 4. Optionnel : Si on veut déconnecter de tous les appareils
    // if (decoded && decoded.userId) {
    //   await this.authRepository.deleteAllRefreshTokens(decoded.userId);
    // }

    // 5. Retourner la confirmation
    return {
      success: true,
      message: "Logout successful",
    };
  }

  /**
   * Déconnecte l'utilisateur de tous ses appareils
   * @param userId - ID de l'utilisateur
   * @returns Promise<{ success: true; message: string }> - Confirmation
   */
  async logoutAllDevices(
    userId: number
  ): Promise<{ success: true; message: string }> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Vérifier que l'utilisateur existe
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Révoquer tous les refresh tokens de l'utilisateur
    await this.authRepository.deleteAllRefreshTokens(userId);

    return {
      success: true,
      message: "Logged out from all devices",
    };
  }

  /**
   * Valide les données d'entrée
   */
  private validateInput(dto: LogoutDto): void {
    if (!dto.refreshToken || dto.refreshToken.trim().length === 0) {
      throw new Error("Refresh token is required");
    }
  }
}
