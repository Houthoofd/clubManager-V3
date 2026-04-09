/**
 * Family API Service
 * Service pour gérer les appels API du module familles
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type {
  AddFamilyMemberDto,
  FamilyResponseDto,
  AddFamilyMemberResponse,
} from "@clubmanager/types";

/**
 * Récupère la famille de l'utilisateur connecté
 * Retourne null si l'utilisateur n'appartient à aucune famille
 *
 * @returns La famille de l'utilisateur ou null
 */
export const getMyFamily = async (): Promise<FamilyResponseDto | null> => {
  try {
    const response = await apiClient.get<ApiResponse<FamilyResponseDto>>(
      "/families/my-family",
    );

    return response.data.data ?? null;
  } catch (error: any) {
    // L'API renvoie 404 ou un message "Aucune famille" — on normalise en null
    const status = error?.response?.status;
    const message: string = error?.response?.data?.message ?? "";

    if (
      status === 404 ||
      message.toLowerCase().includes("aucune famille") ||
      message.toLowerCase().includes("no family")
    ) {
      return null;
    }

    throw error;
  }
};

/**
 * Ajoute un membre à la famille de l'utilisateur connecté
 * Crée la famille si elle n'existe pas encore
 *
 * @param data - Données du nouveau membre à ajouter
 * @returns Confirmation et données du membre ajouté
 */
export const addFamilyMember = async (
  data: AddFamilyMemberDto,
): Promise<AddFamilyMemberResponse> => {
  const response = await apiClient.post<ApiResponse<AddFamilyMemberResponse>>(
    "/families/members",
    data,
  );

  return response.data.data!;
};

/**
 * Retire un membre de la famille de l'utilisateur connecté
 *
 * @param userId - Identifiant du membre à retirer (format U-YYYY-XXXX)
 * @returns Confirmation de la suppression
 */
export const removeFamilyMember = async (
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete<
    ApiResponse<{ success: boolean; message: string }>
  >(`/families/members/${userId}`);

  return (
    response.data.data ?? {
      success: response.data.success,
      message: response.data.message,
    }
  );
};
