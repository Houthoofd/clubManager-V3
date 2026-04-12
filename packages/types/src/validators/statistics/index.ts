/**
 * @fileoverview Statistics Domain Validators Index
 * @module @clubmanager/types/validators/statistics
 *
 * Central export point for all Statistics domain validators.
 * Exports schemas and types for statistics and general club information.
 */

// ============================================================================
// STATISTIC VALIDATORS
// ============================================================================

export {
  // Schemas
  statisticBaseSchema,
  createStatisticSchema,
  createStatisticWithJsonSchema,
  updateStatisticSchema,
  listStatisticsSchema,
  statisticsByTypeSchema,
  statisticsByDateRangeSchema,
  statisticIdSchema,
  statisticIdStringSchema,
  statisticIdParamSchema,
  bulkCreateStatisticsSchema,
  bulkDeleteStatisticsSchema,
  statisticResponseSchema,
  statisticsListResponseSchema,
  statisticsSummarySchema,
  aggregatedStatisticsSchema,
  // Types
  type Statistic,
  type CreateStatistic,
  type CreateStatisticWithJson,
  type UpdateStatistic,
  type ListStatisticsQuery,
  type StatisticsByTypeQuery,
  type StatisticsByDateRangeQuery,
  type StatisticIdParam,
  type BulkCreateStatistics,
  type BulkDeleteStatistics,
  type StatisticResponse,
  type StatisticsListResponse,
  type StatisticsSummary,
  type AggregatedStatistics,
} from "./statistic.validators.js";

// ============================================================================
// INFORMATION VALIDATORS
// ============================================================================

export {
  // Schemas
  informationBaseSchema,
  createInformationSchema,
  updateInformationSchema,
  listInformationsSchema,
  getInformationByKeySchema,
  informationKeyExistsSchema,
  informationIdSchema,
  informationIdStringSchema,
  informationIdParamSchema,
  informationKeyParamSchema,
  bulkUpsertInformationsSchema,
  bulkDeleteInformationsSchema,
  informationResponseSchema,
  informationsListResponseSchema,
  informationStatsSchema,
  groupedInformationsSchema,
  // Types
  type Information,
  type CreateInformation,
  type UpdateInformation,
  type ListInformationsQuery,
  type GetInformationByKey,
  type InformationKeyExists,
  type InformationIdParam,
  type InformationKeyParam,
  type BulkUpsertInformations,
  type BulkDeleteInformations,
  type InformationResponse,
  type InformationsListResponse,
  type InformationStats,
  type GroupedInformations,
} from "./information.validators.js";

// ============================================================================
// ANALYTICS VALIDATORS
// ============================================================================

export {
  // Schemas
  analyticsDateRangeSchema,
  periodTypeSchema,
  memberStatisticsSchema,
  membersByGradeSchema,
  membersByGenderSchema,
  membersByAgeGroupSchema,
  memberAnalyticsResponseSchema,
  courseAttendanceStatisticsSchema,
  coursesByTypeSchema,
  popularCourseSchema,
  attendanceByDaySchema,
  courseAnalyticsResponseSchema,
  financialStatisticsSchema,
  revenueByPaymentMethodSchema,
  revenueByPlanSchema,
  latePaymentSchema,
  financialAnalyticsResponseSchema,
  storeStatisticsSchema,
  popularProductSchema,
  salesByCategorySchema,
  lowStockAlertSchema,
  storeAnalyticsResponseSchema,
  trendDataPointSchema,
  memberGrowthTrendSchema,
  attendanceTrendSchema,
  revenueTrendSchema,
  trendAnalyticsResponseSchema,
  dashboardAnalyticsSchema,
  analyticsQuerySchema,
  analyticsModuleQuerySchema,
  // Types
  type AnalyticsDateRange,
  type PeriodType,
  type MemberStatistics,
  type MembersByGrade,
  type MembersByGender,
  type MembersByAgeGroup,
  type MemberAnalyticsResponse,
  type CourseAttendanceStatistics,
  type CoursesByType,
  type PopularCourse,
  type AttendanceByDay,
  type CourseAnalyticsResponse,
  type FinancialStatistics,
  type RevenueByPaymentMethod,
  type RevenueByPlan,
  type LatePayment,
  type FinancialAnalyticsResponse,
  type StoreStatistics,
  type PopularProduct,
  type SalesByCategory,
  type LowStockAlert,
  type StoreAnalyticsResponse,
  type TrendDataPoint,
  type MemberGrowthTrend,
  type AttendanceTrend,
  type RevenueTrend,
  type TrendAnalyticsResponse,
  type DashboardAnalytics,
  type AnalyticsQuery,
  type AnalyticsModuleQuery,
} from "./analytics.validators.js";
