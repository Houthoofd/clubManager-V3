/**
 * @fileoverview Statistics Routes
 * @module statistics/presentation/routes/statistics.routes
 *
 * Express routes for statistics and analytics endpoints.
 * Defines HTTP endpoints for retrieving various analytics data.
 */

import { Router } from 'express';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';
import { StatisticsController } from '../controllers/StatisticsController.js';

/**
 * Create statistics router
 *
 * @param statisticsRepository - Statistics repository instance
 * @returns Express router with statistics routes
 */
export const createStatisticsRouter = (
  statisticsRepository: IStatisticsRepository
): Router => {
  const router = Router();
  const controller = new StatisticsController(statisticsRepository);

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Health check endpoint
   * GET /health
   *
   * Returns the health status of the statistics service
   */
  router.get('/health', controller.healthCheck);

  // ============================================================================
  // DASHBOARD ANALYTICS
  // ============================================================================

  /**
   * Get complete dashboard analytics
   * GET /dashboard
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   * - period_type: 'day' | 'week' | 'month' | 'quarter' | 'year' (optional, default: 'month')
   * - include_trends: boolean (optional, default: true)
   *
   * Returns:
   * - Complete dashboard analytics combining all modules
   */
  router.get('/dashboard', controller.getDashboard);

  // ============================================================================
  // MODULE-SPECIFIC ANALYTICS
  // ============================================================================

  /**
   * Get member analytics
   * GET /members
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   *
   * Returns:
   * - Member statistics including overview, by grade, by gender, by age group
   */
  router.get('/members', controller.getMemberAnalytics);

  /**
   * Get course analytics
   * GET /courses
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   *
   * Returns:
   * - Course statistics including attendance, by type, popular courses, by day
   */
  router.get('/courses', controller.getCourseAnalytics);

  /**
   * Get financial analytics
   * GET /financial
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   *
   * Returns:
   * - Financial statistics including revenue, payments, late payments
   */
  router.get('/financial', controller.getFinancialAnalytics);

  /**
   * Get store analytics
   * GET /store
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   *
   * Returns:
   * - Store statistics including sales, popular products, categories, low stock
   */
  router.get('/store', controller.getStoreAnalytics);

  /**
   * Get trend analytics
   * GET /trends
   *
   * Query parameters:
   * - date_debut: ISO date string (required) - Start date for trend analysis
   * - date_fin: ISO date string (required) - End date for trend analysis
   * - period_type: 'day' | 'week' | 'month' | 'quarter' | 'year' (optional, default: 'month')
   *
   * Returns:
   * - Trend analytics for members, attendance, and revenue over time
   */
  router.get('/trends', controller.getTrendAnalytics);

  // ============================================================================
  // SPECIFIC METRICS
  // ============================================================================

  /**
   * Get specific metric value
   * GET /metrics/:metric
   *
   * Supported metrics:
   * - total-members: Total number of members
   * - active-members: Number of active members
   * - new-members: Number of new members (requires date range)
   * - total-courses: Total number of courses
   * - attendance-rate: Overall attendance rate
   * - total-revenue: Total revenue from payments
   * - late-payments-count: Number of late payments
   * - late-payments-amount: Total amount of late payments
   * - total-orders: Total number of orders
   * - store-revenue: Total revenue from store
   *
   * Query parameters:
   * - date_debut: ISO date string (optional) - Start date for filtering
   * - date_fin: ISO date string (optional) - End date for filtering
   *
   * Returns:
   * - Single metric value with metadata
   */
  router.get('/metrics/:metric', controller.getMetric);

  return router;
};

/**
 * Default export for convenience
 */
export default createStatisticsRouter;
