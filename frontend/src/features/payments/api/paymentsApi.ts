/**
 * Payments API Service
 * Service pour gérer les appels API du module paiements
 */

import apiClient, { type ApiResponse } from "../../../shared/api/apiClient";
import type { PricingPlan } from "@clubmanager/types";

// ─── DTOs locaux ──────────────────────────────────────────────────────────────

export interface PaymentListItemDto {
  id: number;
  user_id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  montant: number;
  methode_paiement: string;
  statut: string;
  plan_tarifaire_nom?: string;
  description?: string;
  stripe_payment_intent_id?: string;
  date_paiement: string | null;
  created_at: string;
}

export interface ScheduleListItemDto {
  id: number;
  user_id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  plan_tarifaire_id: number;
  plan_tarifaire_nom: string;
  montant: number;
  date_echeance: string;
  statut: string;
  paiement_id: number | null;
  jours_retard?: number;
  created_at: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Paramètres de requête ─────────────────────────────────────────────────────

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  user_id?: string;
  statut?: string;
  methode?: string;
  date_debut?: string;
  date_fin?: string;
}

export interface GetSchedulesParams {
  user_id?: string;
  statut?: string;
  page?: number;
  limit?: number;
}

// ─── Réponses paginées ────────────────────────────────────────────────────────

interface PaginatedPaymentsResponse {
  payments: PaymentListItemDto[];
  pagination: Pagination;
}

interface PaginatedSchedulesResponse {
  schedules: ScheduleListItemDto[];
  pagination: Pagination;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Retire les clés dont la valeur est vide ou undefined
 */
function filterParams(
  params: Record<string, string | number | boolean | undefined | null>,
): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null,
    ),
  ) as Record<string, string | number | boolean>;
}

// ─── Plans tarifaires ─────────────────────────────────────────────────────────

/**
 * Récupère la liste de tous les plans tarifaires.
 * @param actif  Si défini, filtre par statut actif/inactif.
 */
export const getPlans = async (actif?: boolean): Promise<PricingPlan[]> => {
  const params = actif !== undefined ? { actif } : {};
  const response = await apiClient.get<ApiResponse<PricingPlan[]>>(
    "/payments/plans",
    { params },
  );
  return response.data.data!;
};

/**
 * Récupère un plan tarifaire par son ID.
 */
export const getPlanById = async (id: number): Promise<PricingPlan> => {
  const response = await apiClient.get<ApiResponse<PricingPlan>>(
    `/payments/plans/${id}`,
  );
  return response.data.data!;
};

/**
 * Crée un nouveau plan tarifaire.
 */
export const createPlan = async (data: {
  nom: string;
  description?: string;
  prix: number;
  duree_mois: number;
}): Promise<PricingPlan> => {
  const response = await apiClient.post<ApiResponse<PricingPlan>>(
    "/payments/plans",
    data,
  );
  return response.data.data!;
};

/**
 * Met à jour un plan tarifaire existant.
 */
export const updatePlan = async (
  id: number,
  data: {
    nom?: string;
    description?: string;
    prix?: number;
    duree_mois?: number;
    actif?: boolean;
  },
): Promise<PricingPlan> => {
  const response = await apiClient.put<ApiResponse<PricingPlan>>(
    `/payments/plans/${id}`,
    data,
  );
  return response.data.data!;
};

/**
 * Bascule le statut actif/inactif d'un plan tarifaire.
 */
export const togglePlan = async (id: number): Promise<PricingPlan> => {
  const response = await apiClient.patch<ApiResponse<PricingPlan>>(
    `/payments/plans/${id}/toggle`,
  );
  return response.data.data!;
};

/**
 * Supprime un plan tarifaire.
 */
export const deletePlan = async (id: number): Promise<void> => {
  await apiClient.delete(`/payments/plans/${id}`);
};

// ─── Paiements ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des paiements avec filtres optionnels.
 */
export const getPayments = async (
  params: GetPaymentsParams = {},
): Promise<PaginatedPaymentsResponse> => {
  const response = await apiClient.get<ApiResponse<PaginatedPaymentsResponse>>(
    "/payments",
    {
      params: filterParams(
        params as Record<string, string | number | boolean | undefined | null>,
      ),
    },
  );
  return response.data.data!;
};

/**
 * Récupère un paiement par son ID.
 */
export const getPaymentById = async (
  id: number,
): Promise<PaymentListItemDto> => {
  const response = await apiClient.get<ApiResponse<PaymentListItemDto>>(
    `/payments/${id}`,
  );
  return response.data.data!;
};

/**
 * Récupère tous les paiements d'un utilisateur.
 */
export const getUserPayments = async (
  userId: number,
): Promise<PaymentListItemDto[]> => {
  const response = await apiClient.get<ApiResponse<PaymentListItemDto[]>>(
    `/payments/user/${userId}`,
  );
  return response.data.data!;
};

/**
 * Enregistre un nouveau paiement manuel.
 */
export const createPayment = async (data: {
  user_id: number;
  montant: number;
  methode_paiement: string;
  plan_tarifaire_id?: number;
  description?: string;
  date_paiement?: string;
}): Promise<PaymentListItemDto> => {
  const response = await apiClient.post<ApiResponse<PaymentListItemDto>>(
    "/payments",
    data,
  );
  return response.data.data!;
};

/**
 * Crée un Payment Intent Stripe et retourne le client_secret.
 */
export const createStripeIntent = async (data: {
  user_id: number;
  montant: number;
  plan_tarifaire_id?: number;
  description?: string;
}): Promise<{
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}> => {
  const response = await apiClient.post<
    ApiResponse<{
      client_secret: string;
      payment_intent_id: string;
      amount: number;
    }>
  >("/payments/stripe/intent", data);
  return response.data.data!;
};

// ─── Échéances ────────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des échéances avec filtres optionnels.
 */
export const getSchedules = async (
  params: GetSchedulesParams = {},
): Promise<PaginatedSchedulesResponse> => {
  const response = await apiClient.get<ApiResponse<PaginatedSchedulesResponse>>(
    "/payments/schedules",
    {
      params: filterParams(
        params as Record<string, string | number | boolean | undefined | null>,
      ),
    },
  );
  return response.data.data!;
};

/**
 * Récupère les échéances en retard.
 */
export const getOverdueSchedules = async (): Promise<ScheduleListItemDto[]> => {
  const response = await apiClient.get<ApiResponse<ScheduleListItemDto[]>>(
    "/payments/schedules/overdue",
  );
  return response.data.data!;
};

/**
 * Récupère toutes les échéances d'un utilisateur.
 */
export const getUserSchedules = async (
  userId: number,
): Promise<ScheduleListItemDto[]> => {
  const response = await apiClient.get<ApiResponse<ScheduleListItemDto[]>>(
    `/payments/schedules/user/${userId}`,
  );
  return response.data.data!;
};

/**
 * Marque une échéance comme payée, avec un paiement associé optionnel.
 */
export const markScheduleAsPaid = async (
  id: number,
  paiementId?: number,
): Promise<ScheduleListItemDto> => {
  const body = paiementId !== undefined ? { paiement_id: paiementId } : {};
  const response = await apiClient.patch<ApiResponse<ScheduleListItemDto>>(
    `/payments/schedules/${id}/pay`,
    body,
  );
  return response.data.data!;
};
