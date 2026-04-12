/**
 * @fileoverview GetDashboardAnalytics Use Case
 * @module statistics/application/usecases/GetDashboardAnalytics
 *
 * Use case for retrieving complete dashboard analytics.
 * Combines statistics from all modules (members, courses, finance, store, trends).
 */

import type {
  AnalyticsDateRange,
  PeriodType,
  DashboardAnalytics,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Input for GetDashboardAnalytics use case
 */
export interface GetDashboardAnalyticsInput {
  /**
   * Optional date range for filtering statistics
   */
  dateRange?: AnalyticsDateRange;

  /**
   * Period granularity for trend analysis (day, week, month, etc.)
   * Defaults to 'month' if not specified
   */
  periodType?: PeriodType;

  /**
   * Include trend analytics in the response
   * Defaults to true
   */
  includeTrends?: boolean;
}

/**
 * GetDashboardAnalytics Use Case
 *
 * Retrieves comprehensive analytics for the dashboard view,
 * including member statistics, course attendance, financial data,
 * store sales, and trend analysis.
 *
 * @example
 * ```typescript
 * const useCase = new GetDashboardAnalytics(statisticsRepository);
 * const analytics = await useCase.execute({
 *   dateRange: {
 *     date_debut: new Date('2024-01-01'),
 *     date_fin: new Date('2024-12-31')
 *   },
 *   periodType: 'month',
 *   includeTrends: true
 * });
 * ```
 */
export class GetDashboardAnalytics {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Execute the use case
   *
   * @param input - Input parameters for dashboard analytics
   * @returns Complete dashboard analytics
   * @throws Error if analytics retrieval fails
   */
  async execute(input: GetDashboardAnalyticsInput = {}): Promise<DashboardAnalytics> {
    const { dateRange, periodType = 'month', includeTrends = true } = input;

    try {
      // Retrieve dashboard analytics from repository
      const analytics = await this.statisticsRepository.getDashboardAnalytics(
        dateRange,
        periodType
      );

      // If trends are not requested, remove them from response
      if (!includeTrends) {
        return {
          ...analytics,
          trends: {
            date_range: dateRange || {
              date_debut: new Date(),
              date_fin: new Date(),
            },
          },
        };
      }

      return analytics;
    } catch (error) {
      throw new Error(
        `Failed to retrieve dashboard analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
