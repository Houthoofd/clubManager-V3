/**
 * Users API Service
 * Service pour gérer les appels API du module utilisateurs
 */

import apiClient, { type ApiResponse } from '../../../shared/api/apiClient';
import type { UserListItemDto, PaginatedUsersResponseDto } from '@clubmanager/types';

export interface GetUsersParams {
  search?: string;
  role_app?: string;
  status_id?: number;
  page?: number;
  limit?: number;
}

/**
 * Récupère la liste paginée des utilisateurs avec filtres optionnels
 */
export const getUsers = async (params: GetUsersParams = {}): Promise<PaginatedUsersResponseDto> => {
  const response = await apiClient.get<ApiResponse<PaginatedUsersResponseDto>>('/users', { params });
  return response.data.data!;
};

/**
 * Récupère un utilisateur par son ID numérique
 */
export const getUserById = async (id: number): Promise<UserListItemDto> => {
  const response = await apiClient.get<ApiResponse<UserListItemDto>>(`/users/${id}`);
  return response.data.data!;
};

/**
 * Met à jour le rôle applicatif d'un utilisateur
 */
export const updateUserRole = async (id: number, role_app: string): Promise<void> => {
  await apiClient.patch(`/users/${id}/role`, { role_app });
};

/**
 * Met à jour le statut d'un utilisateur
 */
export const updateUserStatus = async (id: number, status_id: number): Promise<void> => {
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
