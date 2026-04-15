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
  const response = await apiClient.get<DashboardAnalytics>(
    "/statistics/dashboard",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
        period_type: params?.period_type,
        include_trends: params?.include_trends ?? true,
      },
    },
  );
  return response.data;
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
  const response = await apiClient.get<MemberAnalyticsResponse>(
    "/statistics/members",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
      },
    },
  );
  return response.data;
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
  const response = await apiClient.get<CourseAnalyticsResponse>(
    "/statistics/courses",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
      },
    },
  );
  return response.data;
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
  const response = await apiClient.get<FinancialAnalyticsResponse>(
    "/statistics/finance",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
      },
    },
  );
  return response.data;
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
  const response = await apiClient.get<StoreAnalyticsResponse>(
    "/statistics/store",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
      },
    },
  );
  return response.data;
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
  const response = await apiClient.get<TrendAnalyticsResponse>(
    "/statistics/trends",
    {
      params: {
        date_debut: formatDateParam(params?.date_debut),
        date_fin: formatDateParam(params?.date_fin),
        period_type: params?.period_type || "month",
      },
    },
  );
  return response.data;
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
