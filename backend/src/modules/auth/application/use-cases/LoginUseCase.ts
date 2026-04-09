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

    // 3. Vérifier que ce compte peut se connecter directement
    //    Les comptes enfants (peut_se_connecter = false) ne peuvent pas
    //    se connecter eux-mêmes — ils sont gérés par le tuteur légal.
    if (user.peut_se_connecter === false) {
      const error = new Error(
        "Ce compte ne peut pas se connecter directement. " +
          "Veuillez vous connecter avec le compte du responsable légal.",
      ) as any;
      error.statusCode = 403;
      error.code = "DIRECT_LOGIN_DISABLED";
      throw error;
    }

    // 4. Vérifier que le compte est actif
    if (!user.active) {
      throw new Error("Account is disabled");
    }

    // 5. Vérifier que le compte n'est pas supprimé
    if (user.deleted_at || user.anonymized) {
      throw new Error("Account not found");
    }

    // 6. Comparer le mot de passe
    //    Pour les comptes sans mot de passe (ne devrait pas arriver ici
    //    grâce à la vérification peut_se_connecter ci-dessus, mais par
    //    sécurité on refuse si le hash est vide).
    if (!user.password) {
      throw new Error("Identifiant ou mot de passe invalide");
    }

    const isPasswordValid = await PasswordService.compare(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error("Identifiant ou mot de passe invalide");
    }

    // 7. Vérifier si l'email est vérifié
    if (!user.email_verified) {
      const error = new Error(
        "Veuillez vérifier votre adresse email avant de vous connecter.",
      ) as any;
      error.statusCode = 403;
      error.code = "EMAIL_NOT_VERIFIED";
      throw error;
    }

    // 8. Générer les tokens JWT
    const tokens = JwtService.generateTokenPair({
      userId: user.id,
      email: user.email,
      userIdString: user.userId,
    });

    // 9. Stocker le refresh token en base
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 jours
    await this.authRepository.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      refreshTokenExpiry,
    );

    // 10. Mettre à jour la dernière connexion
    await this.authRepository.updateLastLogin(user.id);

    // 11. Retourner la réponse
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
