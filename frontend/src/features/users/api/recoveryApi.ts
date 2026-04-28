/**
 * recoveryApi.ts
 * Appels API pour la gestion des demandes de récupération de compte
 */

import apiClient from "../../../shared/api/apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecoveryRequest {
  id: number;
  email: string;
  reason: string | null;
  ip_address: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface PaginatedRecoveryRequests {
  requests: RecoveryRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des demandes de récupération de compte
 */
export const getRecoveryRequests = async (
  status?: string,
  page = 1,
  limit = 20,
): Promise<PaginatedRecoveryRequests> => {
  const res = await apiClient.get("/recovery", {
    params: {
      ...(status ? { status } : {}),
      page,
      limit,
    },
  });
  return res.data.data!;
};

/**
 * Approuve ou rejette une demande de récupération de compte
 */
export const processRecoveryRequest = async (
  id: number,
  status: "approved" | "rejected",
): Promise<void> => {
  await apiClient.patch(`/recovery/${id}`, { status });
};
