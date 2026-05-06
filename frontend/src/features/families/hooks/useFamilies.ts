/**
 * useFamilies Hooks
 *
 * Hooks React Query pour le module familles (admin).
 * Pattern identique à useGroups — liste, détail, membres, mutations.
 *
 * Structure des query keys :
 *  familyKeys.all              → invalide TOUT le module en une fois
 *  familyKeys.list(params)     → liste paginée filtrée
 *  familyKeys.detail(id)       → détail d'une famille
 *  familyKeys.members(familyId)→ membres d'une famille
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as familyAdminApi from "../api/familyApi";
import type { GetFamiliesParams } from "../api/familyApi";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const familyKeys = {
  /** Racine — invalide l'intégralité du module */
  all: ["families-admin"] as const,

  /** Liste paginée/filtrée */
  list: (params?: GetFamiliesParams) =>
    [...familyKeys.all, "list", params ?? {}] as const,

  /** Détail d'une famille */
  detail: (id: number) => [...familyKeys.all, "detail", id] as const,

  /** Membres d'une famille */
  members: (familyId: number) =>
    [...familyKeys.all, "members", familyId] as const,
} as const;

// ─── useFamiliesList ──────────────────────────────────────────────────────────

export function useFamiliesList(params?: GetFamiliesParams) {
  return useQuery({
    queryKey: familyKeys.list(params),
    queryFn: () => familyAdminApi.getFamilies(params),
    staleTime: 30_000,
  });
}

// ─── useFamilyDetail ─────────────────────────────────────────────────────────

export function useFamilyDetail(id: number | null) {
  return useQuery({
    queryKey: familyKeys.detail(id ?? 0),
    queryFn: () => familyAdminApi.getFamilyById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30_000,
  });
}

// ─── useFamilyMembers ─────────────────────────────────────────────────────────

export function useFamilyMembers(familyId: number | null) {
  return useQuery({
    queryKey: familyKeys.members(familyId ?? 0),
    queryFn: () => familyAdminApi.adminGetFamilyMembers(familyId!),
    enabled: familyId !== null && familyId > 0,
    staleTime: 0,
    gcTime: 0,
  });
}

// ─── useUpdateFamily ──────────────────────────────────────────────────────────

export function useUpdateFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nom }: { id: number; nom: string | null }) =>
      familyAdminApi.updateFamily(id, nom),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: familyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...familyKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useDeleteFamily ──────────────────────────────────────────────────────────

export function useDeleteFamily() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => familyAdminApi.deleteFamily(id),
    onSuccess: (_result, id) => {
      qc.removeQueries({ queryKey: familyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...familyKeys.all, "list"] });
      toast.success("Famille supprimée avec succès");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useAdminAddFamilyMember ──────────────────────────────────────────────────

export function useAdminAddFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      familyId,
      userId,
      role,
      estResponsable,
      estTuteurLegal,
    }: {
      familyId: number;
      userId: number;
      role?: string;
      estResponsable?: boolean;
      estTuteurLegal?: boolean;
    }) =>
      familyAdminApi.adminAddFamilyMember(familyId, {
        user_id: userId,
        role: role as any,
        est_responsable: estResponsable,
        est_tuteur_legal: estTuteurLegal,
      }),
    onSuccess: (_result, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
      qc.invalidateQueries({ queryKey: familyKeys.detail(familyId) });
      qc.invalidateQueries({ queryKey: [...familyKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useAdminRemoveFamilyMember ───────────────────────────────────────────────

export function useAdminRemoveFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      familyId,
      userId,
    }: {
      familyId: number;
      userId: number;
    }) => familyAdminApi.adminRemoveFamilyMember(familyId, userId),
    onSuccess: (_result, { familyId }) => {
      qc.invalidateQueries({ queryKey: familyKeys.members(familyId) });
      qc.invalidateQueries({ queryKey: familyKeys.detail(familyId) });
      qc.invalidateQueries({ queryKey: [...familyKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}
