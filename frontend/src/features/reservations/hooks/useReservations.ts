/**
 * useReservations Hooks
 *
 * Hooks React Query pour le module réservations.
 * Suit le même pattern que useGroups :
 *  - useQuery    → lectures  (liste, /my)
 *  - useMutation → écritures (create, cancel)
 *  - invalidateQueries → re-fetch ciblé après chaque mutation
 *
 * Structure des query keys :
 *  reservationKeys.all          → invalide TOUT le module en une fois
 *  reservationKeys.list(params) → liste paginée filtrée (admin/prof)
 *  reservationKeys.my(params)   → liste de l'utilisateur connecté
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reservationsApi from "../api/reservationsApi";
import type {
  GetReservationsParams,
  CreateReservationPayload,
} from "../api/reservationsApi";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const reservationKeys = {
  /** Racine — invalide l'intégralité du module */
  all: ["reservations"] as const,

  /** Liste paginée/filtrée — les params font partie de la clé */
  list: (params?: GetReservationsParams) =>
    [...reservationKeys.all, "list", params ?? {}] as const,

  /** Réservations de l'utilisateur connecté */
  my: (params?: Omit<GetReservationsParams, "user_id">) =>
    [...reservationKeys.all, "my", params ?? {}] as const,
} as const;

// ─── useReservationsList — liste admin/prof ───────────────────────────────────

/**
 * Hook pour récupérer la liste paginée de toutes les réservations.
 * Passer `undefined` pour désactiver la query (enabled: false).
 */
export function useReservationsList(params?: GetReservationsParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => reservationsApi.getReservations(params),
    enabled: params !== undefined,
    staleTime: 30_000,
  });
}

// ─── useMyReservations — réservations de l'utilisateur connecté ───────────────

/**
 * Hook pour récupérer les réservations de l'utilisateur authentifié.
 * Passer `undefined` pour désactiver la query (enabled: false).
 */
export function useMyReservations(
  params?: Omit<GetReservationsParams, "user_id">,
) {
  return useQuery({
    queryKey: reservationKeys.my(params),
    queryFn: () => reservationsApi.getMyReservations(params),
    enabled: params !== undefined,
    staleTime: 30_000,
  });
}

// ─── useCreateReservation ─────────────────────────────────────────────────────

/**
 * Mutation pour créer une réservation.
 * Invalide la liste complète et /my après succès.
 */
export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      reservationsApi.createReservation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...reservationKeys.all, "list"] });
      qc.invalidateQueries({ queryKey: [...reservationKeys.all, "my"] });
    },
  });
}

// ─── useCancelReservation ─────────────────────────────────────────────────────

/**
 * Mutation pour annuler une réservation.
 * Invalide la liste complète et /my après succès.
 */
export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reservationsApi.cancelReservation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...reservationKeys.all, "list"] });
      qc.invalidateQueries({ queryKey: [...reservationKeys.all, "my"] });
    },
  });
}
