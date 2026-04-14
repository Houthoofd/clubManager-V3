/**
 * @fileoverview Statistics Module Entry Point
 * @module statistics
 *
 * Main entry point for the statistics module.
 * Handles dependency injection and exports the module router.
 */

import { MySQLStatisticsRepository } from './infrastructure/repositories/MySQLStatisticsRepository.js';
import { createStatisticsRouter } from './presentation/routes/statistics.routes.js';

// ============================================================================
// REPOSITORY INSTANTIATION
// ============================================================================

/**
 * Create and configure the statistics repository
 *
 * @returns Configured statistics repository instance
 */
const createStatisticsRepository = () => {
  return new MySQLStatisticsRepository();
};

/**
 * Statistics repository singleton instance
 */
export const statisticsRepository = createStatisticsRepository();

// ============================================================================
// ROUTER CREATION
// ============================================================================

/**
 * Statistics module router
 *
 * Configured with all statistics endpoints and dependency-injected repository
 */
export const statisticsRouter = createStatisticsRouter(statisticsRepository);

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Export repository interface for type checking
 */
export type { IStatisticsRepository } from './domain/repositories/StatisticsRepository.js';

/**
 * Export use cases for direct usage if needed
 */
export { GetDashboardAnalytics } from './application/usecases/GetDashboardAnalytics.js';
export { GetCourseAnalytics } from './application/usecases/GetCourseAnalytics.js';
export { GetFinancialAnalytics } from './application/usecases/GetFinancialAnalytics.js';
export { GetStoreAnalytics } from './application/usecases/GetStoreAnalytics.js';
export { GetTrendAnalytics } from './application/usecases/GetTrendAnalytics.js';

/**
 * Export controller for testing purposes
 */
export { StatisticsController } from './presentation/controllers/StatisticsController.js';

/**
 * Export repository implementation for testing
 */
export { MySQLStatisticsRepository } from './infrastructure/repositories/MySQLStatisticsRepository.js';

/**
 * Default export: router
 */
export default statisticsRouter;
