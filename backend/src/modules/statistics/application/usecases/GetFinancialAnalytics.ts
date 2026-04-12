/**
 * @fileoverview GetFinancialAnalytics Use Case
 * @module statistics/application/usecases/GetFinancialAnalytics
 *
 * Use case for retrieving financial and payment analytics.
 * Provides statistics on revenue, payments, late payments, and payment methods.
 */

import type {
  AnalyticsDateRange,
  FinancialAnalyticsResponse,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Input for GetFinancialAnalytics use case
 */
export interface GetFinancialAnalyticsInput {
  /**
   * Optional date range for filtering statistics
   */
  dateRange?: AnalyticsDateRange;
}

/**
 * GetFinancialAnalytics Use Case
 *
 * Retrieves comprehensive financial analytics,
 * including revenue totals, payment statistics by method,
 * subscription plan revenue, and late payment details.
 *
 * @example
 * ```typescript
 * const useCase = new GetFinancialAnalytics(statisticsRepository);
 * const analytics = await useCase.execute({
 *   dateRange: {
 *     date_debut: new Date('2024-01-01'),
 *     date_fin: new Date('2024-12-31')
 *   }
 * });
 * ```
 */
export class GetFinancialAnalytics {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Execute the use case
   *
   * @param input - Input parameters for financial analytics
   * @returns Financial analytics including revenue, payments, and late payments
   * @throws Error if analytics retrieval fails
   */
  async execute(input: GetFinancialAnalyticsInput = {}): Promise<FinancialAnalyticsResponse> {
    const { dateRange } = input;

    try {
      return await this.statisticsRepository.getFinancialAnalytics(dateRange);
    } catch (error) {
      throw new Error(
        `Failed to retrieve financial analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
