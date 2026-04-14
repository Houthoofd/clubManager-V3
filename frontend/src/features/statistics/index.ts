/**
 * @fileoverview Statistics Module Index
 * @module features/statistics
 *
 * Central export point for the Statistics feature module.
 * Exports all pages, components, hooks, and utilities.
 */

// ============================================================================
// PAGES
// ============================================================================

export { DashboardPage } from "./pages/DashboardPage";
export { MembersStatsPage } from "./pages/MembersStatsPage";
export { CoursesStatsPage } from "./pages/CoursesStatsPage";
export { FinanceStatsPage } from "./pages/FinanceStatsPage";
export { StoreStatsPage } from "./pages/StoreStatsPage";

// ============================================================================
// COMPONENTS
// ============================================================================

export { StatCard } from "./components/StatCard";
export { PeriodSelector } from "./components/PeriodSelector";
export { MemberStats } from "./components/MemberStats";
export { CourseStats } from "./components/CourseStats";
export { FinanceStats } from "./components/FinanceStats";
export { StoreStats } from "./components/StoreStats";
export { TrendChart } from "./components/TrendChart";

// ============================================================================
// HOOKS
// ============================================================================

export {
  useDashboardAnalytics,
  useMemberAnalytics,
  useCourseAnalytics,
  useFinancialAnalytics,
  useStoreAnalytics,
  useTrendAnalytics,
  useInvalidateStatistics,
  usePrefetchStatistics,
  statisticsKeys,
} from "./hooks/useStatistics";

// ============================================================================
// API
// ============================================================================

export {
  getDashboardAnalytics,
  getMemberAnalytics,
  getCourseAnalytics,
  getFinancialAnalytics,
  getStoreAnalytics,
  getTrendAnalytics,
} from "./api/statistics.api";

export type { AnalyticsParams } from "./api/statistics.api";

// ============================================================================
// STORES
// ============================================================================

export {
  useStatisticsParams,
  useStatisticsFiltersStore,
} from "./stores/filtersStore";

export type {
  PresetPeriod,
  StatisticsFiltersState,
} from "./stores/filtersStore";

// ============================================================================
// UTILITIES
// ============================================================================

export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateRange,
} from "./utils/formatting";
