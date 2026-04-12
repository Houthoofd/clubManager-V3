/**
 * messagingApi.ts
 * Appels API pour le module messaging
 */

import apiClient, { type ApiResponse } from '../../../shared/api/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MessageWithDetails {
  id: number;
  expediteur_id: number;
  expediteur_nom: string;
  expediteur_userId: string;
  destinataire_id: number;
  destinataire_nom: string;
  sujet: string | null;
  contenu: string;
  lu: boolean;
  date_lecture: string | null;
  envoye_par_email: boolean;
  broadcast_id: number | null;
  created_at: string;
}

export interface PaginatedMessages {
  messages: MessageWithDetails[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendMessagePayload {
  destinataire_id?: number;
  cible?: 'tous' | 'admin' | 'professor' | 'member';
  sujet?: string;
  contenu: string;
  envoye_par_email: boolean;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Récupère la boîte de réception
 */
export const getInbox = async (
  page = 1,
  limit = 20,
  lu?: boolean,
): Promise<PaginatedMessages> => {
  const params: Record<string, unknown> = { page, limit };
  if (lu !== undefined) params.lu = lu;
  const res = await apiClient.get<ApiResponse<PaginatedMessages>>(
    '/messages/inbox',
    { params },
  );
  return res.data.data!;
};

/**
 * Récupère les messages envoyés
 */
export const getSent = async (
  page = 1,
  limit = 20,
): Promise<PaginatedMessages> => {
  const res = await apiClient.get<ApiResponse<PaginatedMessages>>(
    '/messages/sent',
    { params: { page, limit } },
  );
  return res.data.data!;
};

/**
 * Récupère un message par son ID (et le marque comme lu)
 */
export const getMessage = async (id: number): Promise<MessageWithDetails> => {
  const res = await apiClient.get<ApiResponse<MessageWithDetails>>(
    `/messages/${id}`,
  );
  return res.data.data!;
};

/**
 * Récupère le nombre de messages non lus
 */
export const getUnreadCount = async (): Promise<number> => {
  const res = await apiClient.get<ApiResponse<{ count: number }>>(
    '/messages/unread-count',
  );
  return res.data.data!.count;
};

/**
 * Envoie un message
 */
export const sendMessage = async (
  payload: SendMessagePayload,
): Promise<void> => {
  await apiClient.post('/messages/send', payload);
};

/**
 * Supprime un message
 */
export const deleteMessage = async (id: number): Promise<void> => {
  await apiClient.delete(`/messages/${id}`);
};
