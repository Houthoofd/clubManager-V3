/**
 * Invitation API Service
 * Service pour gérer les appels API du module invitations
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Invitation {
  id: number;
  email: string;
  invited_by: number;
  invited_by_name?: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface ValidateTokenResponse {
  valid: boolean;
  email?: string;
  error?: string;
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

/**
 * Envoie une invitation par email (admin)
 */
export const sendInvitation = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<ApiResponse>("/invitations", { email });
  return {
    success: true,
    message: response.data.message ?? "Invitation envoyée",
  };
};

/**
 * Valide un token d'invitation (public)
 * Gère silencieusement les erreurs HTTP pour retourner un résultat typé
 */
export const validateInvitationToken = async (
  token: string,
): Promise<ValidateTokenResponse> => {
  try {
    const response = await apiClient.get<ApiResponse<ValidateTokenResponse>>(
      "/invitations/validate",
      { params: { token } },
    );
    return response.data.data ?? { valid: false, error: "Réponse invalide" };
  } catch (error: any) {
    return {
      valid: false,
      error:
        error.response?.data?.message ?? "Token invalide ou expiré",
    };
  }
};

/**
 * Récupère la liste paginée des invitations (admin)
 */
export const getInvitations = async (
  page?: number,
  limit?: number,
): Promise<{
  data: Invitation[];
  total: number;
  page: number;
  limit: number;
}> => {
  const response = await apiClient.get<
    ApiResponse<{
      data: Invitation[];
      total: number;
      page: number;
      limit: number;
    }>
  >("/invitations", { params: { page, limit } });
  return response.data.data!;
};

/**
 * Révoque une invitation (admin)
 */
export const revokeInvitation = async (
  id: number,
): Promise<{ success: boolean }> => {
  await apiClient.delete(`/invitations/${id}`);
  return { success: true };
};
