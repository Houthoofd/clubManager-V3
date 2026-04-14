/**
 * @fileoverview GetTrendAnalytics Use Case
 * @module statistics/application/usecases/GetTrendAnalytics
 *
 * Use case for retrieving trend analytics over time.
 * Provides statistics on member growth, attendance, and revenue trends.
 */

import type {
  AnalyticsDateRange,
  PeriodType,
  TrendAnalyticsResponse,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Input for GetTrendAnalytics use case
 */
export interface GetTrendAnalyticsInput {
  /**
   * Date range for trend analysis
   */
  dateRange: AnalyticsDateRange;

  /**
   * Period granularity for trend analysis (day, week, month, etc.)
   * Defaults to 'month' if not specified
   */
  periodType?: PeriodType;
}

/**
 * GetTrendAnalytics Use Case
 *
 * Retrieves trend analytics over a specified time period,
 * including member growth trends, attendance trends, and revenue trends.
 * The period granularity can be adjusted (daily, weekly, monthly, etc.).
 *
 * @example
 * ```typescript
 * const useCase = new GetTrendAnalytics(statisticsRepository);
 * const analytics = await useCase.execute({
 *   dateRange: {
 *     date_debut: new Date('2024-01-01'),
 *     date_fin: new Date('2024-12-31')
 *   },
 *   periodType: 'month'
 * });
 * ```
 */
export class GetTrendAnalytics {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Execute the use case
   *
   * @param input - Input parameters for trend analytics
   * @returns Trend analytics for members, attendance, and revenue
   * @throws Error if analytics retrieval fails
   */
  async execute(input: GetTrendAnalyticsInput): Promise<TrendAnalyticsResponse> {
    const { dateRange, periodType = 'month' } = input;

    try {
      return await this.statisticsRepository.getTrendAnalytics(dateRange, periodType);
    } catch (error) {
      throw new Error(
        `Failed to retrieve trend analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
