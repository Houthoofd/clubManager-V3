/**
 * Alerts API
 * Fonctions d'accès à l'API pour le module d'alertes
 */

import apiClient from '../../../shared/api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertPriorite = 'basse' | 'normale' | 'haute' | 'critique';
export type AlertStatut = 'active' | 'resolue' | 'ignoree';
export type AlertActionType =
  | 'message_envoye'
  | 'information_mise_a_jour'
  | 'paiement_recu'
  | 'statut_change'
  | 'autre';

export interface AlertTypeDto {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  priorite: AlertPriorite;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertUserDto {
  id: number;
  user_id: number;
  alerte_type_id: number;
  alerte_type?: AlertTypeDto;
  statut: AlertStatut;
  donnees_contexte: Record<string, unknown> | null;
  date_detection: string;
  date_resolution: string | null;
  notes: string | null;
  resolu_par: number | null;
}

export interface AlertActionDto {
  id: number;
  alerte_user_id: number;
  user_id: number | null;
  action_type: AlertActionType;
  description: string | null;
  created_at: string;
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreateAlertTypePayload {
  code: string;
  nom: string;
  description?: string;
  priorite: AlertPriorite;
  actif?: boolean;
}

export interface UpdateAlertTypePayload {
  code?: string;
  nom?: string;
  description?: string;
  priorite?: AlertPriorite;
  actif?: boolean;
}

export interface CreateUserAlertPayload {
  user_id: number;
  alerte_type_id: number;
  notes?: string;
  donnees_contexte?: Record<string, unknown>;
}

export interface ResolveAlertPayload {
  notes?: string;
}

export interface AddAlertActionPayload {
  action_type: AlertActionType;
  description?: string;
}

export interface AlertTypeFilters {
  activeOnly?: boolean;
}

export interface AdminAlertFilters {
  statut?: AlertStatut;
  priorite?: AlertPriorite;
  userId?: number;
}

export interface MyAlertFilters {
  statut?: AlertStatut;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const alertsApi = {
  // ── Alert Types (Admin) ──────────────────────────────────────────────────

  getAlertTypes: async (filters?: AlertTypeFilters): Promise<AlertTypeDto[]> => {
    const res = await apiClient.get('/alerts/types', {
      params: filters?.activeOnly !== undefined ? { activeOnly: filters.activeOnly } : {},
    });
    return res.data.data ?? [];
  },

  createAlertType: async (payload: CreateAlertTypePayload): Promise<AlertTypeDto> => {
    const res = await apiClient.post('/alerts/types', payload);
    return res.data.data;
  },

  updateAlertType: async (id: number, payload: UpdateAlertTypePayload): Promise<AlertTypeDto> => {
    const res = await apiClient.put(`/alerts/types/${id}`, payload);
    return res.data.data;
  },

  deleteAlertType: async (id: number): Promise<{ success: boolean }> => {
    const res = await apiClient.delete(`/alerts/types/${id}`);
    return res.data;
  },

  // ── User Alerts (Admin) ──────────────────────────────────────────────────

  getAdminAlerts: async (filters?: AdminAlertFilters): Promise<AlertUserDto[]> => {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.statut) params.statut = filters.statut;
    if (filters?.priorite) params.priorite = filters.priorite;
    if (filters?.userId) params.userId = filters.userId;
    const res = await apiClient.get('/alerts/admin', { params });
    return res.data.data ?? [];
  },

  createUserAlert: async (payload: CreateUserAlertPayload): Promise<AlertUserDto> => {
    const res = await apiClient.post('/alerts/admin', payload);
    return res.data.data;
  },

  resolveAlert: async (id: number, payload?: ResolveAlertPayload): Promise<AlertUserDto> => {
    const res = await apiClient.patch(`/alerts/admin/${id}/resolve`, payload ?? {});
    return res.data.data;
  },

  ignoreAlert: async (id: number): Promise<AlertUserDto> => {
    const res = await apiClient.patch(`/alerts/admin/${id}/ignore`, {});
    return res.data.data;
  },

  getAlertActions: async (id: number): Promise<AlertActionDto[]> => {
    const res = await apiClient.get(`/alerts/admin/${id}/actions`);
    return res.data.data ?? [];
  },

  addAlertAction: async (id: number, payload: AddAlertActionPayload): Promise<AlertActionDto> => {
    const res = await apiClient.post(`/alerts/admin/${id}/actions`, payload);
    return res.data.data;
  },

  // ── My Alerts (Member) ───────────────────────────────────────────────────

  getMyAlerts: async (filters?: MyAlertFilters): Promise<AlertUserDto[]> => {
    const params: Record<string, string | undefined> = {};
    if (filters?.statut) params.statut = filters.statut;
    const res = await apiClient.get('/alerts/me', { params });
    return res.data.data ?? [];
  },
};
