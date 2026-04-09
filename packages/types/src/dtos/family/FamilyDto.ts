/**
 * DTOs Family pour l'API
 * Utilisés pour les requêtes/réponses API du module familles
 */

import type { FamilyMemberRole } from "../../domain/family/Family.types.js";

/**
 * DTO pour ajouter un membre à une famille
 * Utilisé lors de l'ajout d'un nouveau membre (enfant, conjoint, etc.)
 */
export interface AddFamilyMemberDto {
  first_name: string;
  last_name: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  genre_id: number;
  role: FamilyMemberRole;
}

/**
 * DTO pour la réponse d'un membre de famille
 * Inclut les données de l'utilisateur lié et son rôle dans la famille
 */
export interface FamilyMemberResponseDto {
  id: number;
  userId: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // Format: YYYY-MM-DD
  genre_id: number;
  grade?: {
    id: number;
    nom: string;
    couleur?: string;
  };
  role: FamilyMemberRole;
  est_responsable: boolean;
  est_tuteur_legal: boolean;
  est_mineur: boolean;
  date_ajout: string; // Format: ISO 8601
}

/**
 * DTO pour la réponse d'une famille complète
 * Inclut la liste de tous les membres de la famille
 */
export interface FamilyResponseDto {
  famille_id: number;
  nom?: string;
  membres: FamilyMemberResponseDto[];
}

/**
 * DTO pour retirer un membre d'une famille
 * Identifie le membre à supprimer via son userId
 */
export interface RemoveFamilyMemberDto {
  membre_userId: string;
}

/**
 * DTO pour la réponse après ajout d'un membre à une famille
 * Confirme le succès de l'opération et retourne les données du membre ajouté
 */
export interface AddFamilyMemberResponse {
  success: boolean;
  message: string;
  data: {
    famille_id: number;
    membre: FamilyMemberResponseDto;
  };
}
