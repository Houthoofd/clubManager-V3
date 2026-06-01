/**
 * @fileoverview Statistics API Client
 * @module features/statistics/api
 *
 * API functions for fetching analytics and statistics data.
 */

import { apiClient } from "../../../shared/api/apiClient";
import type {
  DashboardAnalytics,
  MemberAnalyticsResponse,
  CourseAnalyticsResponse,
  FinancialAnalyticsResponse,
  StoreAnalyticsResponse,
  TrendAnalyticsResponse,
  PeriodType,
} from "@clubmanager/types";

/**
 * Query parameters for analytics requests
 */
export interface AnalyticsParams {
  date_debut?: Date | string;
  date_fin?: Date | string;
  period_type?: PeriodType;
  include_trends?: boolean;
}

/**
 * Convert Date to ISO string for API requests
 */
const formatDateParam = (date?: Date | string): string | undefined => {
  if (!date) return undefined;
  if (typeof date === "string") return date;
  return date.toISOString();
};

/**
 * Fetch complete dashboard analytics with all modules
 *
 * @param params - Query parameters for date range and period
 * @returns Dashboard analytics data
 */
export const getDashboardAnalytics = async (
  params?: AnalyticsParams,
): Promise<DashboardAnalytics> => {
  const response = await apiClient.get<{
    success: boolean;
    data: DashboardAnalytics;
  }>("/statistics/dashboard", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
      period_type: params?.period_type,
      include_trends: params?.include_trends ?? true,
    },
  });
  return response.data.data;
};

/**
 * Fetch member analytics and statistics
 *
 * @param params - Query parameters for date range
 * @returns Member analytics data
 */
export const getMemberAnalytics = async (
  params?: AnalyticsParams,
): Promise<MemberAnalyticsResponse> => {
  const response = await apiClient.get<{
    success: boolean;
    data: MemberAnalyticsResponse;
  }>("/statistics/members", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
    },
  });
  return response.data.data;
};

/**
 * Fetch course analytics and attendance statistics
 *
 * @param params - Query parameters for date range
 * @returns Course analytics data
 */
export const getCourseAnalytics = async (
  params?: AnalyticsParams,
): Promise<CourseAnalyticsResponse> => {
  const response = await apiClient.get<{
    success: boolean;
    data: CourseAnalyticsResponse;
  }>("/statistics/courses", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
    },
  });
  return response.data.data;
};

/**
 * Fetch financial analytics and payment statistics
 *
 * @param params - Query parameters for date range
 * @returns Financial analytics data
 */
export const getFinancialAnalytics = async (
  params?: AnalyticsParams,
): Promise<FinancialAnalyticsResponse> => {
  const response = await apiClient.get<{
    success: boolean;
    data: FinancialAnalyticsResponse;
  }>("/statistics/finance", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
    },
  });
  return response.data.data;
};

/**
 * Fetch store analytics and sales statistics
 *
 * @param params - Query parameters for date range
 * @returns Store analytics data
 */
export const getStoreAnalytics = async (
  params?: AnalyticsParams,
): Promise<StoreAnalyticsResponse> => {
  const response = await apiClient.get<{
    success: boolean;
    data: StoreAnalyticsResponse;
  }>("/statistics/store", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
    },
  });
  return response.data.data;
};

/**
 * Fetch trend analytics for member growth, attendance, and revenue
 *
 * @param params - Query parameters for date range and period type
 * @returns Trend analytics data
 */
export const getTrendAnalytics = async (
  params?: AnalyticsParams,
): Promise<TrendAnalyticsResponse> => {
  const response = await apiClient.get<{
    success: boolean;
    data: TrendAnalyticsResponse;
  }>("/statistics/trends", {
    params: {
      date_debut: formatDateParam(params?.date_debut),
      date_fin: formatDateParam(params?.date_fin),
      period_type: params?.period_type || "month",
    },
  });
  return response.data.data;
};

/**
 * Refresh/recalculate statistics cache
 * Useful after bulk operations or data imports
 *
 * @returns Success confirmation
 */
export const refreshStatistics = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    "/statistics/refresh",
  );
  return response.data;
};

// ============================================================================
// SNAPSHOT PERSISTENCE
// ============================================================================

export interface StatisticsSnapshotResult {
  inserted: number;
  date_stat: string;
}

export interface StatisticsHistoryRow {
  type: string;
  cle: string;
  valeur: string;
  date_stat: string;
}

/**
 * Trigger a statistics snapshot (admin only)
 */
export const createStatisticsSnapshot =
  async (): Promise<StatisticsSnapshotResult> => {
    const response = await apiClient.post<StatisticsSnapshotResult>(
      "/statistics/snapshot",
    );
    return response.data;
  };

/**
 * Fetch snapshot history (admin only)
 */
export const getStatisticsHistory = async (
  type?: string,
  limit?: number,
): Promise<StatisticsHistoryRow[]> => {
  const response = await apiClient.get<{
    success: boolean;
    data: StatisticsHistoryRow[];
  }>("/statistics/history", {
    params: { type, limit },
  });
  // Le backend wrappe la réponse dans { success, data } — on extrait le tableau
  return (
    (response.data as { success: boolean; data: StatisticsHistoryRow[] })
      .data ?? []
  );
};
