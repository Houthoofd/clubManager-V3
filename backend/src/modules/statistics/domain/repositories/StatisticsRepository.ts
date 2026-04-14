/**
 * @fileoverview Statistics Repository Interface
 * @module statistics/domain/repositories/StatisticsRepository
 *
 * Domain repository interface for statistics and analytics data.
 * Defines contracts for retrieving computed statistics across all modules.
 */

import type {
  AnalyticsDateRange,
  PeriodType,
  MemberAnalyticsResponse,
  CourseAnalyticsResponse,
  FinancialAnalyticsResponse,
  StoreAnalyticsResponse,
  TrendAnalyticsResponse,
  DashboardAnalytics,
} from '@clubmanager/types';

/**
 * Statistics Repository Interface
 *
 * Provides methods for retrieving analytics and computed statistics
 * across different modules (members, courses, finance, store).
 */
export interface IStatisticsRepository {
  // ============================================================================
  // MEMBER STATISTICS
  // ============================================================================

  /**
   * Get comprehensive member analytics
   *
   * @param dateRange - Optional date range for filtering
   * @returns Member analytics including overview, by grade, by gender, by age
   */
  getMemberAnalytics(dateRange?: AnalyticsDateRange): Promise<MemberAnalyticsResponse>;

  /**
   * Get total member count
   *
   * @param activeOnly - Count only active members
   * @returns Total number of members
   */
  getTotalMembers(activeOnly?: boolean): Promise<number>;

  /**
   * Get new members count for a given period
   *
   * @param dateRange - Date range to count new members
   * @returns Number of new members
   */
  getNewMembersCount(dateRange: AnalyticsDateRange): Promise<number>;

  /**
   * Get member growth rate
   *
   * @param dateRange - Date range for calculating growth
   * @returns Growth rate as percentage
   */
  getMemberGrowthRate(dateRange: AnalyticsDateRange): Promise<number>;

  // ============================================================================
  // COURSE STATISTICS
  // ============================================================================

  /**
   * Get comprehensive course analytics
   *
   * @param dateRange - Optional date range for filtering
   * @returns Course analytics including attendance, by type, popular courses
   */
  getCourseAnalytics(dateRange?: AnalyticsDateRange): Promise<CourseAnalyticsResponse>;

  /**
   * Get total courses count
   *
   * @param dateRange - Optional date range for filtering
   * @returns Total number of courses
   */
  getTotalCourses(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get overall attendance rate
   *
   * @param dateRange - Optional date range for filtering
   * @returns Attendance rate as percentage
   */
  getAttendanceRate(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get average participants per course
   *
   * @param dateRange - Optional date range for filtering
   * @returns Average number of participants
   */
  getAverageParticipantsPerCourse(dateRange?: AnalyticsDateRange): Promise<number>;

  // ============================================================================
  // FINANCIAL STATISTICS
  // ============================================================================

  /**
   * Get comprehensive financial analytics
   *
   * @param dateRange - Optional date range for filtering
   * @returns Financial analytics including revenue, payments, late payments
   */
  getFinancialAnalytics(dateRange?: AnalyticsDateRange): Promise<FinancialAnalyticsResponse>;

  /**
   * Get total revenue
   *
   * @param dateRange - Optional date range for filtering
   * @returns Total revenue amount
   */
  getTotalRevenue(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get payment success rate
   *
   * @param dateRange - Optional date range for filtering
   * @returns Payment success rate as percentage
   */
  getPaymentSuccessRate(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get late payments count
   *
   * @returns Number of late payments
   */
  getLatePaymentsCount(): Promise<number>;

  /**
   * Get total amount of late payments
   *
   * @returns Total amount of late payments
   */
  getLatePaymentsAmount(): Promise<number>;

  // ============================================================================
  // STORE STATISTICS
  // ============================================================================

  /**
   * Get comprehensive store analytics
   *
   * @param dateRange - Optional date range for filtering
   * @returns Store analytics including sales, popular products, categories
   */
  getStoreAnalytics(dateRange?: AnalyticsDateRange): Promise<StoreAnalyticsResponse>;

  /**
   * Get total orders count
   *
   * @param dateRange - Optional date range for filtering
   * @returns Total number of orders
   */
  getTotalOrders(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get total store revenue
   *
   * @param dateRange - Optional date range for filtering
   * @returns Total store revenue
   */
  getStoreRevenue(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get average cart value
   *
   * @param dateRange - Optional date range for filtering
   * @returns Average cart value
   */
  getAverageCartValue(dateRange?: AnalyticsDateRange): Promise<number>;

  /**
   * Get conversion rate
   *
   * @param dateRange - Optional date range for filtering
   * @returns Conversion rate as percentage
   */
  getConversionRate(dateRange?: AnalyticsDateRange): Promise<number>;

  // ============================================================================
  // TREND STATISTICS
  // ============================================================================

  /**
   * Get trend analytics over time
   *
   * @param dateRange - Date range for trend analysis
   * @param periodType - Period granularity (day, week, month, etc.)
   * @returns Trend analytics for members, attendance, revenue
   */
  getTrendAnalytics(
    dateRange: AnalyticsDateRange,
    periodType: PeriodType
  ): Promise<TrendAnalyticsResponse>;

  /**
   * Get member growth trend
   *
   * @param dateRange - Date range for trend analysis
   * @param periodType - Period granularity
   * @returns Member growth trend data
   */
  getMemberGrowthTrend(dateRange: AnalyticsDateRange, periodType: PeriodType): Promise<any>;

  /**
   * Get attendance trend
   *
   * @param dateRange - Date range for trend analysis
   * @param periodType - Period granularity
   * @returns Attendance trend data
   */
  getAttendanceTrend(dateRange: AnalyticsDateRange, periodType: PeriodType): Promise<any>;

  /**
   * Get revenue trend
   *
   * @param dateRange - Date range for trend analysis
   * @param periodType - Period granularity
   * @returns Revenue trend data
   */
  getRevenueTrend(dateRange: AnalyticsDateRange, periodType: PeriodType): Promise<any>;

  // ============================================================================
  // DASHBOARD STATISTICS
  // ============================================================================

  /**
   * Get complete dashboard analytics
   *
   * @param dateRange - Optional date range for filtering
   * @param periodType - Period granularity for trends
   * @returns Complete dashboard analytics combining all modules
   */
  getDashboardAnalytics(
    dateRange?: AnalyticsDateRange,
    periodType?: PeriodType
  ): Promise<DashboardAnalytics>;

  // ============================================================================
  // HEALTH & UTILITY
  // ============================================================================

  /**
   * Check if repository is healthy and can connect to database
   *
   * @returns True if repository is healthy
   */
  healthCheck(): Promise<boolean>;
}
