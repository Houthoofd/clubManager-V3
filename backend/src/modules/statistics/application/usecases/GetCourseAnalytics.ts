/**
 * @fileoverview GetCourseAnalytics Use Case
 * @module statistics/application/usecases/GetCourseAnalytics
 *
 * Use case for retrieving course and attendance analytics.
 * Provides statistics on course participation, popular courses, and attendance patterns.
 */

import type {
  AnalyticsDateRange,
  CourseAnalyticsResponse,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Input for GetCourseAnalytics use case
 */
export interface GetCourseAnalyticsInput {
  /**
   * Optional date range for filtering statistics
   */
  dateRange?: AnalyticsDateRange;
}

/**
 * GetCourseAnalytics Use Case
 *
 * Retrieves comprehensive course and attendance analytics,
 * including overall attendance rates, statistics by course type,
 * popular courses, and attendance patterns by day of week.
 *
 * @example
 * ```typescript
 * const useCase = new GetCourseAnalytics(statisticsRepository);
 * const analytics = await useCase.execute({
 *   dateRange: {
 *     date_debut: new Date('2024-01-01'),
 *     date_fin: new Date('2024-12-31')
 *   }
 * });
 * ```
 */
export class GetCourseAnalytics {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Execute the use case
   *
   * @param input - Input parameters for course analytics
   * @returns Course analytics including attendance, popular courses, and patterns
   * @throws Error if analytics retrieval fails
   */
  async execute(input: GetCourseAnalyticsInput = {}): Promise<CourseAnalyticsResponse> {
    const { dateRange } = input;

    try {
      return await this.statisticsRepository.getCourseAnalytics(dateRange);
    } catch (error) {
      throw new Error(
        `Failed to retrieve course analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
