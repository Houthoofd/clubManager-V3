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

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface FamilyWithCount {
  id: number;
  nom: string | null;
  membre_count: number;
  created_at: string;
  updated_at: string;
}

export interface GetFamiliesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedFamiliesResult {
  families: FamilyWithCount[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FamilyMemberAdminDto {
  id: number;
  famille_id: number;
  user_id: number;
  role: string;
  est_responsable: boolean;
  est_tuteur_legal: boolean;
  date_ajout: string;
  user: {
    id: number;
    userId: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    genre_id: number;
    grade_id?: number;
    est_mineur: boolean;
    peut_se_connecter: boolean;
  };
}

export interface AdminAddMemberParams {
  user_id: number;
  role?: "parent" | "tuteur" | "enfant" | "conjoint" | "autre";
  est_responsable?: boolean;
  est_tuteur_legal?: boolean;
}

// ─── Admin API Functions ──────────────────────────────────────────────────────

/**
 * [ADMIN] Récupère la liste paginée de toutes les familles.
 */
export const getFamilies = async (
  params?: GetFamiliesParams,
): Promise<PaginatedFamiliesResult> => {
  const response = await apiClient.get<ApiResponse<PaginatedFamiliesResult>>(
    "/families",
    { params },
  );
  return response.data.data!;
};

/**
 * [ADMIN] Récupère une famille par son ID.
 */
export const getFamilyById = async (id: number): Promise<FamilyWithCount> => {
  const response = await apiClient.get<ApiResponse<FamilyWithCount>>(
    `/families/${id}`,
  );
  return response.data.data!;
};

/**
 * [ADMIN] Renomme une famille.
 */
export const updateFamily = async (
  id: number,
  nom: string | null,
): Promise<FamilyWithCount> => {
  const response = await apiClient.put<ApiResponse<FamilyWithCount>>(
    `/families/${id}`,
    { nom },
  );
  return response.data.data!;
};

/**
 * [ADMIN] Supprime une famille (et ses membres via CASCADE).
 */
export const deleteFamily = async (id: number): Promise<void> => {
  await apiClient.delete(`/families/${id}`);
};

/**
 * [ADMIN] Récupère les membres d'une famille.
 */
export const adminGetFamilyMembers = async (
  familyId: number,
): Promise<FamilyMemberAdminDto[]> => {
  const response = await apiClient.get<ApiResponse<FamilyMemberAdminDto[]>>(
    `/families/${familyId}/members`,
  );
  return response.data.data!;
};

/**
 * [ADMIN] Ajoute un utilisateur existant à une famille.
 */
export const adminAddFamilyMember = async (
  familyId: number,
  params: AdminAddMemberParams,
): Promise<void> => {
  await apiClient.post(`/families/${familyId}/members`, params);
};

/**
 * [ADMIN] Retire un utilisateur d'une famille.
 */
export const adminRemoveFamilyMember = async (
  familyId: number,
  userId: number,
): Promise<void> => {
  await apiClient.delete(`/families/${familyId}/members/${userId}`);
};
