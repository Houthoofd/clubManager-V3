/**
 * @fileoverview Statistics Hooks
 * @module features/statistics/hooks
 *
 * React Query hooks for fetching and managing statistics data.
 */

import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import type {
  DashboardAnalytics,
  MemberAnalyticsResponse,
  CourseAnalyticsResponse,
  FinancialAnalyticsResponse,
  StoreAnalyticsResponse,
  TrendAnalyticsResponse,
} from '@clubmanager/types';
import {
  getDashboardAnalytics,
  getMemberAnalytics,
  getCourseAnalytics,
  getFinancialAnalytics,
  getStoreAnalytics,
  getTrendAnalytics,
  type AnalyticsParams,
} from '../api/statistics.api';
import { useStatisticsParams } from '../stores/filtersStore';

/**
 * Query keys for statistics data
 * Organized hierarchically for efficient cache invalidation
 */
export const statisticsKeys = {
  all: ['statistics'] as const,
  dashboard: (params?: AnalyticsParams) => [...statisticsKeys.all, 'dashboard', params] as const,
  members: (params?: AnalyticsParams) => [...statisticsKeys.all, 'members', params] as const,
  courses: (params?: AnalyticsParams) => [...statisticsKeys.all, 'courses', params] as const,
  finance: (params?: AnalyticsParams) => [...statisticsKeys.all, 'finance', params] as const,
  store: (params?: AnalyticsParams) => [...statisticsKeys.all, 'store', params] as const,
  trends: (params?: AnalyticsParams) => [...statisticsKeys.all, 'trends', params] as const,
};

/**
 * Default query options for statistics
 */
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: 2,
  refetchOnWindowFocus: false,
};

/**
 * Hook to fetch complete dashboard analytics
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with dashboard analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDashboardAnalytics();
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Alert>{error.message}</Alert>;
 * if (!data) return null;
 *
 * return <DashboardView data={data} />;
 * ```
 */
export const useDashboardAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<DashboardAnalytics, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.dashboard(queryParams),
    queryFn: () => getDashboardAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to fetch member analytics and statistics
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with member analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useMemberAnalytics();
 * ```
 */
export const useMemberAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<MemberAnalyticsResponse, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.members(queryParams),
    queryFn: () => getMemberAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to fetch course analytics and attendance statistics
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with course analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useCourseAnalytics();
 * ```
 */
export const useCourseAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<CourseAnalyticsResponse, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.courses(queryParams),
    queryFn: () => getCourseAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to fetch financial analytics and payment statistics
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with financial analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useFinancialAnalytics();
 * ```
 */
export const useFinancialAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<FinancialAnalyticsResponse, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.finance(queryParams),
    queryFn: () => getFinancialAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to fetch store analytics and sales statistics
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with store analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useStoreAnalytics();
 * ```
 */
export const useStoreAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<StoreAnalyticsResponse, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.store(queryParams),
    queryFn: () => getStoreAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to fetch trend analytics for growth and evolution over time
 *
 * @param params - Optional analytics parameters (overrides store filters)
 * @param enabled - Whether the query should run
 * @returns Query result with trend analytics data
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useTrendAnalytics();
 * ```
 */
export const useTrendAnalytics = (
  params?: AnalyticsParams,
  enabled: boolean = true
): UseQueryResult<TrendAnalyticsResponse, Error> => {
  const storeParams = useStatisticsParams();
  const queryParams = params || storeParams;

  return useQuery({
    queryKey: statisticsKeys.trends(queryParams),
    queryFn: () => getTrendAnalytics(queryParams),
    enabled,
    ...defaultQueryOptions,
  });
};

/**
 * Hook to invalidate all statistics queries
 * Useful after data updates or manual refresh
 *
 * @returns Function to invalidate all statistics queries
 *
 * @example
 * ```tsx
 * const invalidateStats = useInvalidateStatistics();
 *
 * const handleRefresh = async () => {
 *   await invalidateStats();
 * };
 * ```
 */
export const useInvalidateStatistics = () => {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({
      queryKey: statisticsKeys.all,
    });
  };
};

/**
 * Hook to prefetch statistics data
 * Useful for optimistic loading on page navigation
 *
 * @returns Object with prefetch functions for each statistics type
 *
 * @example
 * ```tsx
 * const { prefetchDashboard } = usePrefetchStatistics();
 *
 * const handleMouseEnter = () => {
 *   prefetchDashboard();
 * };
 * ```
 */
export const usePrefetchStatistics = () => {
  const queryClient = useQueryClient();
  const storeParams = useStatisticsParams();

  return {
    prefetchDashboard: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.dashboard(queryParams),
        queryFn: () => getDashboardAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },

    prefetchMembers: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.members(queryParams),
        queryFn: () => getMemberAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },

    prefetchCourses: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.courses(queryParams),
        queryFn: () => getCourseAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },

    prefetchFinance: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.finance(queryParams),
        queryFn: () => getFinancialAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },

    prefetchStore: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.store(queryParams),
        queryFn: () => getStoreAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },

    prefetchTrends: async (params?: AnalyticsParams) => {
      const queryParams = params || storeParams;
      await queryClient.prefetchQuery({
        queryKey: statisticsKeys.trends(queryParams),
        queryFn: () => getTrendAnalytics(queryParams),
        ...defaultQueryOptions,
      });
    },
  };
};
