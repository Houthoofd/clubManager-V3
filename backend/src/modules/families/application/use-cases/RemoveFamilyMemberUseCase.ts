/**
 * RemoveFamilyMemberUseCase
 * Use case pour retirer un membre d'une famille
 */

import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

export interface RemoveFamilyMemberInput {
  requesterId: number;
  membreUserIdString: string;
}

export interface RemoveFamilyMemberResponse {
  success: boolean;
  message: string;
}

export class RemoveFamilyMemberUseCase {
  constructor(private repository: IFamilyRepository) {}

  /**
   * Exécute le use case de retrait d'un membre de la famille
   * @param input - ID du requêteur (numérique) et userId string du membre à retirer
   * @returns Promise<RemoveFamilyMemberResponse> - Confirmation du retrait
   */
  async execute(
    input: RemoveFamilyMemberInput,
  ): Promise<RemoveFamilyMemberResponse> {
    const { requesterId, membreUserIdString } = input;

    // 1. Chercher la famille du requêteur
    const famille = await this.repository.findFamilleByUserId(requesterId);

    if (!famille) {
      throw new Error("Vous n'appartenez à aucune famille");
    }

    // 2. Récupérer tous les membres de la famille
    const membres = await this.repository.getMembresByFamilleId(famille.id);

    // 3. Vérifier que le requêteur est bien membre et est responsable
    const requester = membres.find((m) => m.user_id === requesterId);

    if (!requester) {
      throw new Error("Vous n'êtes pas membre de cette famille");
    }

    if (!requester.est_responsable) {
      throw new Error(
        "Vous devez être responsable de la famille pour retirer un membre",
      );
    }

    // 4. Trouver le membre à retirer (par userId string U-YYYY-XXXX ou par id numérique)
    const membreToRemove = membres.find(
      (m) =>
        m.user.userId === membreUserIdString ||
        String(m.user_id) === membreUserIdString,
    );

    if (!membreToRemove) {
      throw new Error("Ce membre n'appartient pas à votre famille");
    }

    // 5. Empêcher qu'un responsable se retire lui-même s'il est le seul responsable
    if (membreToRemove.user_id === requesterId) {
      const autresResponsables = membres.filter(
        (m) => m.est_responsable && m.user_id !== requesterId,
      );

      if (autresResponsables.length === 0) {
        throw new Error(
          "Vous ne pouvez pas quitter la famille car vous êtes le seul responsable. " +
            "Désignez un autre responsable avant de quitter.",
        );
      }
    }

    // 6. Retirer le membre de la famille
    await this.repository.removeMembre(famille.id, membreToRemove.user_id);

    return {
      success: true,
      message: `${membreToRemove.user.first_name} ${membreToRemove.user.last_name} a été retiré(e) de la famille.`,
    };
  }
}
