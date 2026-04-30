/**
 * Groups API Service
 * Service pour gérer les appels API du module groupes
 *
 * Endpoints couverts (groupRoutes.ts) :
 *  GET    /groups                     — liste paginée (ADMIN + PROFESSOR)
 *  GET    /groups/:id                 — détail d'un groupe (ADMIN + PROFESSOR)
 *  POST   /groups                     — créer un groupe (ADMIN)
 *  PUT    /groups/:id                 — mettre à jour un groupe (ADMIN)
 *  DELETE /groups/:id                 — supprimer un groupe (ADMIN)
 *  GET    /groups/:id/members         — membres du groupe (ADMIN + PROFESSOR)
 *  POST   /groups/:id/members         — ajouter un membre (ADMIN)
 *  DELETE /groups/:id/members/:userId — retirer un membre (ADMIN)
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type { Group, CreateGroup, UpdateGroup } from "@clubmanager/types";

// ─── Local Response-Shape Types ───────────────────────────────────────────────
//
// The backend GroupController wraps GetGroupsUseCase output inside the standard
// { success, message, data } envelope. The pagination keys come directly from
// the domain layer (groups / total / page / limit / totalPages) and differ from
// the Zod-derived GroupsListResponse in @clubmanager/types, so we keep the real
// wire shape here.

/**
 * Optional filters / pagination params for GET /groups
 */
export interface GetGroupsParams {
  /** Free-text search on group name */
  search?: string;
  /** 1-based page number (default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  limit?: number;
}

/**
 * Group record enriched by the backend JOIN query.
 * Dates arrive as ISO-8601 strings over HTTP, not Date objects.
 * `membre_count` is added by the repository layer.
 */
export interface GroupWithCount extends Omit<
  Group,
  "created_at" | "updated_at"
> {
  created_at: string;
  updated_at: string | null;
  membre_count: number;
}

/**
 * Flat paginated result returned by GET /groups
 * (matches GetGroupsUseCase output — NOT the Zod schema shape)
 */
export interface PaginatedGroupsResult {
  groups: GroupWithCount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Rich member record returned by GET /groups/:id/members.
 * The backend joins groupes_utilisateurs with users.
 */
export interface GroupMemberDto {
  user_id: number;
  prenom: string;
  nom: string;
  email: string;
  role_app: string;
  joined_at: string;
}

// ─── Groups CRUD ──────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des groupes.
 * Rôles autorisés : ADMIN, PROFESSOR
 */
export const getGroups = async (
  params?: GetGroupsParams,
): Promise<PaginatedGroupsResult> => {
  const response = await apiClient.get<ApiResponse<PaginatedGroupsResult>>(
    "/groups",
    { params },
  );
  return response.data.data!;
};

/**
 * Récupère un groupe par son identifiant.
 * Rôles autorisés : ADMIN, PROFESSOR
 */
export const getGroupById = async (id: number): Promise<Group> => {
  const response = await apiClient.get<ApiResponse<Group>>(`/groups/${id}`);
  return response.data.data!;
};

/**
 * Crée un nouveau groupe.
 * Rôle requis : ADMIN
 */
export const createGroup = async (dto: CreateGroup): Promise<Group> => {
  const response = await apiClient.post<ApiResponse<Group>>("/groups", dto);
  return response.data.data!;
};

/**
 * Met à jour partiellement un groupe existant.
 * Rôle requis : ADMIN
 */
export const updateGroup = async (
  id: number,
  data: UpdateGroup,
): Promise<Group> => {
  const response = await apiClient.put<ApiResponse<Group>>(
    `/groups/${id}`,
    data,
  );
  return response.data.data!;
};

/**
 * Supprime un groupe (et ses membres via CASCADE côté BDD).
 * Rôle requis : ADMIN
 */
export const deleteGroup = async (id: number): Promise<void> => {
  await apiClient.delete(`/groups/${id}`);
};

// ─── Group Members ────────────────────────────────────────────────────────────

/**
 * Récupère les membres d'un groupe avec les données utilisateur jointes.
 * Rôles autorisés : ADMIN, PROFESSOR
 */
export const getGroupMembers = async (
  groupId: number,
): Promise<GroupMemberDto[]> => {
  const response = await apiClient.get<ApiResponse<GroupMemberDto[]>>(
    `/groups/${groupId}/members`,
  );
  return response.data.data!;
};

/**
 * Ajoute un utilisateur à un groupe.
 * Rôle requis : ADMIN
 */
export const addGroupMember = async (
  groupId: number,
  userId: number,
): Promise<void> => {
  await apiClient.post(`/groups/${groupId}/members`, { user_id: userId });
};

/**
 * Retire un utilisateur d'un groupe.
 * Rôle requis : ADMIN
 */
export const removeGroupMember = async (
  groupId: number,
  userId: number,
): Promise<void> => {
  await apiClient.delete(`/groups/${groupId}/members/${userId}`);
};
