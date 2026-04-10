/**
 * usersApi.ts
 * Appels API pour le module utilisateurs
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type { UserListItemDto } from "@clubmanager/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { UserListItemDto };

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status_id?: number;
  role_app?: string;
  active?: boolean;
}

export interface PaginatedUsers {
  users: UserListItemDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NotifyBulkPayload {
  user_ids: number[];
  sujet?: string;
  contenu: string;
  envoye_par_email: boolean;
}

export interface NotifyBulkResult {
  sent: number;
  errors: number;
  total: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des utilisateurs avec filtres optionnels
 */
export const getUsers = async (
  params?: GetUsersParams,
): Promise<PaginatedUsers> => {
  const res = await apiClient.get<ApiResponse<PaginatedUsers>>("/users", {
    params,
  });
  return res.data.data!;
};

/**
 * Récupère un utilisateur par son ID numérique
 */
export const getUserById = async (id: number): Promise<UserListItemDto> => {
  const response = await apiClient.get<ApiResponse<UserListItemDto>>(
    `/users/${id}`,
  );
  return response.data.data!;
};

/**
 * Met à jour le rôle applicatif d'un utilisateur
 */
export const updateUserRole = async (
  id: number,
  role_app: string,
): Promise<void> => {
  await apiClient.patch(`/users/${id}/role`, { role_app });
};

/**
 * Met à jour le statut d'un utilisateur
 */
export const updateUserStatus = async (
  id: number,
  status_id: number,
): Promise<void> => {
  await apiClient.patch(`/users/${id}/status`, { status_id });
};

/**
 * Supprime (soft delete) un utilisateur avec une raison obligatoire
 */
export const deleteUser = async (id: number, reason: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`, { data: { reason } });
};

/**
 * Restaure un utilisateur précédemment supprimé
 */
export const restoreUser = async (id: number): Promise<void> => {
  await apiClient.post(`/users/${id}/restore`);
};

/**
 * Envoie un message de notification à une sélection d'utilisateurs
 */
export const notifyBulkUsers = async (
  payload: NotifyBulkPayload,
): Promise<NotifyBulkResult> => {
  const response = await apiClient.post<ApiResponse<NotifyBulkResult>>(
    "/users/notify-bulk",
    payload,
  );
  return response.data.data!;
};
