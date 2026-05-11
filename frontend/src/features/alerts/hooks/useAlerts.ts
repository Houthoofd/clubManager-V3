/**
 * useAlerts Hooks
 * Hooks React Query pour le module d'alertes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alertsApi';
import type {
  AlertTypeFilters,
  AdminAlertFilters,
  MyAlertFilters,
  CreateAlertTypePayload,
  UpdateAlertTypePayload,
  CreateUserAlertPayload,
  ResolveAlertPayload,
  AddAlertActionPayload,
} from '../api/alertsApi';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const alertKeys = {
  all: ['alerts'] as const,
  types: () => [...alertKeys.all, 'types'] as const,
  typesList: (filters?: AlertTypeFilters) => [...alertKeys.types(), 'list', filters] as const,
  adminAlerts: () => [...alertKeys.all, 'admin'] as const,
  adminAlertsList: (filters?: AdminAlertFilters) =>
    [...alertKeys.adminAlerts(), 'list', filters] as const,
  myAlerts: () => [...alertKeys.all, 'me'] as const,
  myAlertsList: (filters?: MyAlertFilters) => [...alertKeys.myAlerts(), 'list', filters] as const,
  actions: (alertId: number) => [...alertKeys.all, 'actions', alertId] as const,
};

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function useAlertTypes(filters?: AlertTypeFilters) {
  return useQuery({
    queryKey: alertKeys.typesList(filters),
    queryFn: () => alertsApi.getAlertTypes(filters),
    staleTime: 30_000,
  });
}

export function useAdminAlerts(filters?: AdminAlertFilters) {
  return useQuery({
    queryKey: alertKeys.adminAlertsList(filters),
    queryFn: () => alertsApi.getAdminAlerts(filters),
    staleTime: 15_000,
  });
}

export function useMyAlerts(filters?: MyAlertFilters) {
  return useQuery({
    queryKey: alertKeys.myAlertsList(filters),
    queryFn: () => alertsApi.getMyAlerts(filters),
    staleTime: 15_000,
  });
}

export function useAlertActions(id: number | null) {
  return useQuery({
    queryKey: alertKeys.actions(id ?? 0),
    queryFn: () => alertsApi.getAlertActions(id!),
    enabled: id !== null,
    staleTime: 10_000,
  });
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateAlertType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAlertTypePayload) => alertsApi.createAlertType(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.types() });
    },
  });
}

export function useUpdateAlertType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAlertTypePayload }) =>
      alertsApi.updateAlertType(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.types() });
    },
  });
}

export function useDeleteAlertType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.deleteAlertType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.types() });
    },
  });
}

export function useCreateUserAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserAlertPayload) => alertsApi.createUserAlert(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.adminAlerts() });
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload?: ResolveAlertPayload }) =>
      alertsApi.resolveAlert(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.adminAlerts() });
    },
  });
}

export function useIgnoreAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => alertsApi.ignoreAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: alertKeys.adminAlerts() });
    },
  });
}

export function useAddAlertAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AddAlertActionPayload }) =>
      alertsApi.addAlertAction(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: alertKeys.actions(variables.id) });
    },
  });
}
