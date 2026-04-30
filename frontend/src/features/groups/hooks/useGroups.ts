/**
 * useGroups Hooks
 *
 * Hooks React Query pour le module groupes.
 * Suit le même pattern que useStore / useNotifications :
 *  - useQuery    → lectures  (liste, détail, membres)
 *  - useMutation → écritures (CRUD groupes + gestion membres)
 *  - invalidateQueries → re-fetch ciblé après chaque mutation
 *
 * Structure des query keys :
 *  groupKeys.all          → invalide TOUT le module en une fois
 *  groupKeys.list(params) → liste paginée filtrée
 *  groupKeys.detail(id)   → détail d'un groupe
 *  groupKeys.members(id)  → membres d'un groupe
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateGroup, UpdateGroup } from "@clubmanager/types";
import * as groupsApi from "../api/groupsApi";
import type { GetGroupsParams } from "../api/groupsApi";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const groupKeys = {
  /** Racine — invalide l'intégralité du module */
  all: ["groups"] as const,

  /** Liste paginée/filtrée — les params font partie de la clé */
  list: (params?: GetGroupsParams) =>
    [...groupKeys.all, "list", params ?? {}] as const,

  /** Détail d'un groupe */
  detail: (id: number) => [...groupKeys.all, "detail", id] as const,

  /** Membres d'un groupe */
  members: (groupId: number) => [...groupKeys.all, "members", groupId] as const,
} as const;

// ─── useGroupsList — liste paginée ────────────────────────────────────────────

/**
 * Hook pour récupérer la liste paginée des groupes.
 * Les params font partie de la queryKey : React Query refetch automatiquement
 * quand search / page / limit changent.
 */
export function useGroupsList(params?: GetGroupsParams) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: () => groupsApi.getGroups(params),
    staleTime: 30_000,
  });
}

// ─── useGroupDetail — détail d'un groupe ─────────────────────────────────────

/**
 * Hook pour récupérer le détail d'un groupe par son ID.
 * La query est désactivée si l'id est null ou ≤ 0.
 */
export function useGroupDetail(id: number | null) {
  return useQuery({
    queryKey: groupKeys.detail(id ?? 0),
    queryFn: () => groupsApi.getGroupById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30_000,
  });
}

// ─── useGroupMembers — membres d'un groupe ────────────────────────────────────

/**
 * Hook pour récupérer les membres d'un groupe.
 * staleTime = 0 : toujours refetché à l'ouverture.
 * gcTime    = 0 : pas de cache résiduel entre deux ouvertures de panneau/modal.
 */
export function useGroupMembers(groupId: number | null) {
  return useQuery({
    queryKey: groupKeys.members(groupId ?? 0),
    queryFn: () => groupsApi.getGroupMembers(groupId!),
    enabled: groupId !== null && groupId > 0,
    staleTime: 0,
    gcTime: 0,
  });
}

// ─── useCreateGroup ───────────────────────────────────────────────────────────

/**
 * Mutation pour créer un nouveau groupe.
 * Invalide la liste après succès.
 */
export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGroup) => groupsApi.createGroup(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...groupKeys.all, "list"] });
      toast.success("Groupe créé avec succès");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useUpdateGroup ───────────────────────────────────────────────────────────

/**
 * Mutation pour mettre à jour un groupe existant.
 * Invalide le détail du groupe concerné ET la liste.
 */
export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGroup }) =>
      groupsApi.updateGroup(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: groupKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...groupKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useDeleteGroup ───────────────────────────────────────────────────────────

/**
 * Mutation pour supprimer un groupe.
 * Invalide la liste et supprime le détail du cache.
 */
export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => groupsApi.deleteGroup(id),
    onSuccess: (_result, id) => {
      qc.removeQueries({ queryKey: groupKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...groupKeys.all, "list"] });
      toast.success("Groupe supprimé avec succès");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useAddGroupMember ────────────────────────────────────────────────────────

/**
 * Mutation pour ajouter un utilisateur à un groupe.
 * Invalide les membres, le détail ET la liste (membre_count change).
 */
export function useAddGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      groupsApi.addGroupMember(groupId, userId),
    onSuccess: (_result, { groupId }) => {
      qc.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      qc.invalidateQueries({ queryKey: [...groupKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useRemoveGroupMember ─────────────────────────────────────────────────────

/**
 * Mutation pour retirer un utilisateur d'un groupe.
 * Invalide les membres, le détail ET la liste (membre_count change).
 */
export function useRemoveGroupMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: number }) =>
      groupsApi.removeGroupMember(groupId, userId),
    onSuccess: (_result, { groupId }) => {
      qc.invalidateQueries({ queryKey: groupKeys.members(groupId) });
      qc.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      qc.invalidateQueries({ queryKey: [...groupKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}
