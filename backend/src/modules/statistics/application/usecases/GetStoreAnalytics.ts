/**
 * @fileoverview GetStoreAnalytics Use Case
 * @module statistics/application/usecases/GetStoreAnalytics
 *
 * Use case for retrieving store and sales analytics.
 * Provides statistics on orders, revenue, popular products, and inventory alerts.
 */

import type {
  AnalyticsDateRange,
  StoreAnalyticsResponse,
} from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';

/**
 * Input for GetStoreAnalytics use case
 */
export interface GetStoreAnalyticsInput {
  /**
   * Optional date range for filtering statistics
   */
  dateRange?: AnalyticsDateRange;
}

/**
 * GetStoreAnalytics Use Case
 *
 * Retrieves comprehensive store and sales analytics,
 * including order statistics, revenue, popular products,
 * sales by category, and low stock alerts.
 *
 * @example
 * ```typescript
 * const useCase = new GetStoreAnalytics(statisticsRepository);
 * const analytics = await useCase.execute({
 *   dateRange: {
 *     date_debut: new Date('2024-01-01'),
 *     date_fin: new Date('2024-12-31')
 *   }
 * });
 * ```
 */
export class GetStoreAnalytics {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Execute the use case
   *
   * @param input - Input parameters for store analytics
   * @returns Store analytics including sales, products, and inventory
   * @throws Error if analytics retrieval fails
   */
  async execute(input: GetStoreAnalyticsInput = {}): Promise<StoreAnalyticsResponse> {
    const { dateRange } = input;

    try {
      return await this.statisticsRepository.getStoreAnalytics(dateRange);
    } catch (error) {
      throw new Error(
        `Failed to retrieve store analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
