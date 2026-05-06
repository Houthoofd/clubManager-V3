/**
 * Settings API Service
 * Service pour gérer les appels API du module paramètres (informations du club)
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type {
  InformationsListResponse,
  InformationResponse,
  CreateInformation,
} from "@clubmanager/types";

/**
 * Récupère tous les paramètres du club
 */
export const getSettings = async (): Promise<InformationsListResponse> => {
  const response = await apiClient.get<ApiResponse<InformationsListResponse>>(
    "/settings",
    {
      params: { page_size: 100 },
    },
  );
  return response.data.data!;
};

/**
 * Crée ou met à jour un paramètre par sa clé
 */
export const upsertSetting = async (
  cle: string,
  valeur: string,
  description?: string,
): Promise<InformationResponse> => {
  const response = await apiClient.put<ApiResponse<InformationResponse>>(
    `/settings/key/${cle}`,
    { valeur, description },
  );
  return response.data.data!;
};

/**
 * Crée ou met à jour plusieurs paramètres en une seule requête
 */
export const bulkUpsertSettings = async (
  informations: CreateInformation[],
): Promise<InformationResponse[]> => {
  const response = await apiClient.post<ApiResponse<InformationResponse[]>>(
    "/settings/bulk",
    { informations },
  );
  return response.data.data!;
};

/**
 * Supprime un paramètre par son ID
 */
export const deleteSetting = async (id: number): Promise<void> => {
  await apiClient.delete(`/settings/${id}`);
};

// ─── Security / Audit ─────────────────────────────────────────────────────────

export interface LoginAttemptDto {
  id: number;
  email: string;
  ip_address: string;
  success: boolean;
  user_agent: string | null;
  failure_reason: string | null;
  created_at: string;
}

export interface LoginAttemptsResult {
  attempts: LoginAttemptDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const securityApi = {
  getLoginAttempts: async (params?: {
    page?: number;
    limit?: number;
    email?: string;
    ip?: string;
    onlyFailed?: boolean;
  }): Promise<LoginAttemptsResult> => {
    const res = await apiClient.get("/auth/audit/login-attempts", { params });
    return res.data.data;
  },
};
