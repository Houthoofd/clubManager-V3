/**
 * Recovery Domain Types
 * Types métier du module de demandes de récupération manuelle
 */

export type RecoveryStatus = 'pending' | 'approved' | 'rejected';

export interface RecoveryRequest {
  id: number;
  email: string;
  reason: string | null;
  ip_address: string;
  status: RecoveryStatus;
  created_at: string; // ISO string
}

export interface ProcessRecoveryDto {
  id: number;
  status: 'approved' | 'rejected';
  admin_note?: string; // optional note from admin (not persisted, used for response message only)
}

export interface GetRecoveryRequestsQuery {
  status?: RecoveryStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedRecoveryResponse {
  requests: RecoveryRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
