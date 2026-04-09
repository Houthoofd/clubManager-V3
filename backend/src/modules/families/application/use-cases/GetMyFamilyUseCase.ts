/**
 * GetMyFamilyUseCase
 * Use case pour récupérer la famille de l'utilisateur connecté
 */

import type { FamilyMemberResponseDto } from "@clubmanager/types";
import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

/**
 * Réponse du use case GetMyFamily
 */
export interface GetMyFamilyResponse {
  success: boolean;
  message: string;
  data: {
    famille_id: number;
    nom: string | null;
    membres: FamilyMemberResponseDto[];
  } | null;
}

export class GetMyFamilyUseCase {
  constructor(private repository: IFamilyRepository) {}

  /**
   * Exécute le use case de récupération de la famille de l'utilisateur
   * @param userId - ID numérique de l'utilisateur connecté
   * @returns Promise<GetMyFamilyResponse> - Réponse avec les données de la famille ou null
   */
  async execute(userId: number): Promise<GetMyFamilyResponse> {
    // 1. Chercher la famille de l'utilisateur
    const famille = await this.repository.findFamilleByUserId(userId);

    // 2. Si pas de famille → retourner une réponse vide
    if (!famille) {
      return {
        success: true,
        message: "Aucune famille trouvée",
        data: null,
      };
    }

    // 3. Récupérer tous les membres de la famille
    const membres = await this.repository.getMembresByFamilleId(famille.id);

    // 4. Mapper en FamilyMemberResponseDto[]
    // FamilyMemberWithUser imbrique les infos utilisateur dans m.user.*
    // date_of_birth → string YYYY-MM-DD, date_ajout → string ISO 8601
    const membresDto: FamilyMemberResponseDto[] = membres.map((m) => ({
      id: m.user.id,
      userId: m.user.userId,
      first_name: m.user.first_name,
      last_name: m.user.last_name,
      date_of_birth:
        m.user.date_of_birth instanceof Date
          ? m.user.date_of_birth.toISOString().split("T")[0]!
          : new Date(m.user.date_of_birth).toISOString().split("T")[0]!,
      genre_id: m.user.genre_id,
      // grade est optionnel dans FamilyMemberResponseDto ;
      // FamilyMemberWithUser n'expose que grade_id dans user, pas les détails
      est_mineur: m.user.est_mineur,
      role: m.role,
      est_responsable: m.est_responsable,
      est_tuteur_legal: m.est_tuteur_legal,
      date_ajout:
        m.date_ajout instanceof Date
          ? m.date_ajout.toISOString()
          : new Date(m.date_ajout).toISOString(),
    }));

    // 5. Retourner la réponse avec la famille et ses membres
    return {
      success: true,
      message: "Famille récupérée avec succès",
      data: {
        famille_id: famille.id,
        nom: famille.nom ?? null,
        membres: membresDto,
      },
    };
  }
}
