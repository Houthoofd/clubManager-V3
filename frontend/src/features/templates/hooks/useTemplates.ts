/**
 * useTemplates Hooks
 *
 * Hooks React Query pour le module modèles de messages.
 * Suit le même pattern que useGroups :
 *  - useQuery    → lectures (types, liste, détail)
 *  - useMutation → écritures (CRUD + toggle + preview + send)
 *  - invalidateQueries → re-fetch ciblé après chaque mutation
 *
 * Structure des query keys :
 *  templateKeys.all          → invalide TOUT le module en une fois
 *  templateKeys.types()      → liste des types
 *  templateKeys.list(params) → liste des templates filtrée
 *  templateKeys.detail(id)   → détail d'un template
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as templatesApi from "../api/templatesApi";
import type { GetTemplatesParams } from "../api/templatesApi";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const templateKeys = {
  /** Racine — invalide l'intégralité du module */
  all: ["templates"] as const,

  /** Liste des types de modèles */
  types: () => [...templateKeys.all, "types"] as const,

  /** Liste des templates filtrée — les params font partie de la clé */
  list: (params?: GetTemplatesParams) =>
    [...templateKeys.all, "list", params ?? {}] as const,

  /** Détail d'un template */
  detail: (id: number) => [...templateKeys.all, "detail", id] as const,
} as const;

// ─── useTemplateTypes ─────────────────────────────────────────────────────────

/**
 * Hook pour récupérer tous les types de modèles.
 */
export function useTemplateTypes() {
  return useQuery({
    queryKey: templateKeys.types(),
    queryFn: () => templatesApi.getTemplateTypes(),
    staleTime: 60_000,
  });
}

// ─── useTemplatesList ─────────────────────────────────────────────────────────

/**
 * Hook pour récupérer la liste des templates avec filtres optionnels.
 */
export function useTemplatesList(params?: GetTemplatesParams) {
  return useQuery({
    queryKey: templateKeys.list(params),
    queryFn: () => templatesApi.getTemplates(params),
    staleTime: 30_000,
  });
}

// ─── useTemplateDetail ────────────────────────────────────────────────────────

/**
 * Hook pour récupérer le détail d'un template par son ID.
 * La query est désactivée si l'id est null ou ≤ 0.
 */
export function useTemplateDetail(id: number | null) {
  return useQuery({
    queryKey: templateKeys.detail(id ?? 0),
    queryFn: () => templatesApi.getTemplateById(id!),
    enabled: id !== null && id > 0,
    staleTime: 30_000,
  });
}

// ─── useCreateTemplateType ────────────────────────────────────────────────────

/**
 * Mutation pour créer un nouveau type de modèle.
 * Invalide la liste des types après succès.
 */
export function useCreateTemplateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nom: string; description?: string }) =>
      templatesApi.createTemplateType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.types() });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useUpdateTemplateType ────────────────────────────────────────────────────

/**
 * Mutation pour mettre à jour un type de modèle.
 * Invalide la liste des types après succès.
 */
export function useUpdateTemplateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { nom?: string; description?: string; actif?: boolean };
    }) => templatesApi.updateTemplateType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.types() });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useDeleteTemplateType ────────────────────────────────────────────────────

/**
 * Mutation pour supprimer un type de modèle (admin uniquement).
 * Invalide la liste des types et la liste des templates après succès.
 */
export function useDeleteTemplateType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templatesApi.deleteTemplateType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: templateKeys.types() });
      qc.invalidateQueries({ queryKey: [...templateKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useCreateTemplate ────────────────────────────────────────────────────────

/**
 * Mutation pour créer un nouveau template.
 * Invalide la liste des templates après succès.
 */
export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      type_id: number;
      titre: string;
      contenu: string;
      actif?: boolean;
    }) => templatesApi.createTemplate(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...templateKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useUpdateTemplate ────────────────────────────────────────────────────────

/**
 * Mutation pour mettre à jour un template existant.
 * Invalide le détail et la liste des templates après succès.
 */
export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        type_id: number;
        titre: string;
        contenu: string;
        actif: boolean;
      }>;
    }) => templatesApi.updateTemplate(id, data),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: templateKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...templateKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useDeleteTemplate ────────────────────────────────────────────────────────

/**
 * Mutation pour supprimer un template.
 * Invalide la liste et supprime le détail du cache.
 */
export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => templatesApi.deleteTemplate(id),
    onSuccess: (_result, id) => {
      qc.removeQueries({ queryKey: templateKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...templateKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useToggleTemplate ────────────────────────────────────────────────────────

/**
 * Mutation pour activer/désactiver un template.
 * Invalide le détail et la liste des templates après succès.
 */
export function useToggleTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, actif }: { id: number; actif: boolean }) =>
      templatesApi.toggleTemplate(id, actif),
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: templateKeys.detail(id) });
      qc.invalidateQueries({ queryKey: [...templateKeys.all, "list"] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── usePreviewTemplate ───────────────────────────────────────────────────────

/**
 * Mutation pour générer un aperçu rendu du template.
 * Pas d'invalidation — retourne simplement le rendu.
 */
export function usePreviewTemplate() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data?: {
        manual_vars?: Record<string, string>;
        recipient_example?: Record<string, string>;
      };
    }) => templatesApi.previewTemplate(id, data),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}

// ─── useSendFromTemplate ──────────────────────────────────────────────────────

/**
 * Mutation pour envoyer un message depuis un template.
 */
export function useSendFromTemplate() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        destinataire_id: number;
        cible?: string;
        manual_vars?: Record<string, string>;
        envoye_par_email?: boolean;
      };
    }) => templatesApi.sendFromTemplate(id, data),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message ?? error.message),
  });
}
