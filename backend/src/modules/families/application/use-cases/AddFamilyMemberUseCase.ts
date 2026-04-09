/**
 * AddFamilyMemberUseCase
 * Use case pour l'ajout d'un membre (enfant ou autre) à une famille
 */

import type {
  AddFamilyMemberDto,
  AddFamilyMemberResponse,
} from "@clubmanager/types";
import type { IFamilyRepository } from "../../domain/repositories/IFamilyRepository.js";

export class AddFamilyMemberUseCase {
  constructor(private repository: IFamilyRepository) {}

  /**
   * Exécute le use case d'ajout d'un membre à une famille
   * @param dto - Données du membre à ajouter
   * @param parentId - ID numérique du parent connecté
   * @returns Promise<AddFamilyMemberResponse> - Réponse avec les données du membre ajouté
   */
  async execute(
    dto: AddFamilyMemberDto,
    parentId: number,
  ): Promise<AddFamilyMemberResponse> {
    // 1. Valider les données d'entrée
    this.validateInput(dto);

    // 2. Créer le compte enfant (sans email ni mot de passe)
    const childUser = await this.repository.createChildUser({
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
      date_of_birth: new Date(dto.date_of_birth),
      genre_id: dto.genre_id,
      tuteur_id: parentId,
      est_mineur: true,
      peut_se_connecter: false,
    });

    // 3. Chercher si le parent a déjà une famille
    let famille = await this.repository.findFamilleByUserId(parentId);

    // 4. Si pas de famille → créer une nouvelle famille et ajouter le parent comme responsable
    if (!famille) {
      famille = await this.repository.createFamille();

      await this.repository.addMembre({
        familleId: famille.id,
        userId: parentId,
        role: "parent",
        estResponsable: true,
        estTuteurLegal: true,
      });
    }

    // 5. Ajouter l'enfant à la famille
    const now = new Date();
    await this.repository.addMembre({
      familleId: famille.id,
      userId: childUser.id,
      role: dto.role,
      estResponsable: false,
      estTuteurLegal: false,
    });

    // 6. Retourner la réponse — membre conforme à FamilyMemberResponseDto
    return {
      success: true,
      message: `${childUser.first_name} ${childUser.last_name} a été ajouté(e) à la famille avec succès.`,
      data: {
        famille_id: famille.id,
        membre: {
          id: childUser.id,
          userId: childUser.userId,
          first_name: childUser.first_name,
          last_name: childUser.last_name,
          date_of_birth: childUser.date_of_birth.toISOString().split("T")[0]!, // YYYY-MM-DD
          genre_id: childUser.genre_id,
          role: dto.role,
          est_responsable: false,
          est_tuteur_legal: false,
          est_mineur: true,
          date_ajout: now.toISOString(), // ISO 8601
        },
      },
    };
  }

  /**
   * Valide les données d'entrée du DTO
   * @throws Error si les données sont invalides
   */
  private validateInput(dto: AddFamilyMemberDto): void {
    // Valider first_name
    if (!dto.first_name || dto.first_name.trim().length < 2) {
      throw new Error("First name must be at least 2 characters");
    }

    // Valider last_name
    if (!dto.last_name || dto.last_name.trim().length < 2) {
      throw new Error("Last name must be at least 2 characters");
    }

    // Valider date_of_birth (présence)
    if (!dto.date_of_birth) {
      throw new Error("Date of birth is required");
    }

    // Valider date_of_birth (format valide)
    const birthDate = new Date(dto.date_of_birth);
    if (isNaN(birthDate.getTime())) {
      throw new Error("Invalid date of birth format");
    }

    // Valider date_of_birth (pas dans le futur)
    const today = new Date();
    if (birthDate > today) {
      throw new Error("Date of birth cannot be in the future");
    }

    // Calculer l'âge précis
    const ageMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(ageMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Valider l'âge selon le rôle
    if (dto.role === "enfant") {
      if (age < 0 || age > 17) {
        throw new Error("Un enfant doit avoir entre 0 et 17 ans");
      }
    } else {
      // conjoint, tuteur ou autre rôle adulte
      if (age < 18) {
        throw new Error("Ce type de membre doit être majeur (18 ans minimum)");
      }
    }

    // Valider genre_id
    if (!dto.genre_id || dto.genre_id <= 0) {
      throw new Error("Un genre valide est requis (genre_id > 0)");
    }

    // Valider la présence du rôle
    if (!dto.role) {
      throw new Error("Le rôle du membre est requis");
    }
  }
}
