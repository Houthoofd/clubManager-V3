/**
 * @fileoverview Statistics Controller
 * @module statistics/presentation/controllers/StatisticsController
 *
 * HTTP controller for statistics and analytics endpoints.
 * Handles requests for member, course, financial, store, and trend analytics.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AnalyticsDateRange, PeriodType } from '@clubmanager/types';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';
import { GetDashboardAnalytics } from '../../application/usecases/GetDashboardAnalytics.js';
import { GetCourseAnalytics } from '../../application/usecases/GetCourseAnalytics.js';
import { GetFinancialAnalytics } from '../../application/usecases/GetFinancialAnalytics.js';
import { GetStoreAnalytics } from '../../application/usecases/GetStoreAnalytics.js';
import { GetTrendAnalytics } from '../../application/usecases/GetTrendAnalytics.js';

/**
 * Statistics Controller
 *
 * Handles HTTP requests for analytics and statistics endpoints.
 * Validates input, calls appropriate use cases, and formats responses.
 */
export class StatisticsController {
  constructor(private readonly statisticsRepository: IStatisticsRepository) {}

  /**
   * Get dashboard analytics
   * GET /api/statistics/dashboard
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   * - period_type: 'day' | 'week' | 'month' | 'quarter' | 'year' (optional, default: 'month')
   * - include_trends: boolean (optional, default: true)
   */
  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin, period_type, include_trends } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      // Parse period type
      const periodType = (period_type as PeriodType) || 'month';

      // Parse include trends
      const includeTrends = include_trends !== 'false';

      // Execute use case
      const useCase = new GetDashboardAnalytics(this.statisticsRepository);
      const analytics = await useCase.execute({
        dateRange,
        periodType,
        includeTrends,
      });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get member analytics
   * GET /api/statistics/members
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   */
  getMemberAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      // Get analytics directly from repository
      const analytics = await this.statisticsRepository.getMemberAnalytics(dateRange);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get course analytics
   * GET /api/statistics/courses
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   */
  getCourseAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      // Execute use case
      const useCase = new GetCourseAnalytics(this.statisticsRepository);
      const analytics = await useCase.execute({ dateRange });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get financial analytics
   * GET /api/statistics/financial
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   */
  getFinancialAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      // Execute use case
      const useCase = new GetFinancialAnalytics(this.statisticsRepository);
      const analytics = await useCase.execute({ dateRange });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get store analytics
   * GET /api/statistics/store
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   */
  getStoreAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      // Execute use case
      const useCase = new GetStoreAnalytics(this.statisticsRepository);
      const analytics = await useCase.execute({ dateRange });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get trend analytics
   * GET /api/statistics/trends
   *
   * Query params:
   * - date_debut: ISO date string (required)
   * - date_fin: ISO date string (required)
   * - period_type: 'day' | 'week' | 'month' | 'quarter' | 'year' (optional, default: 'month')
   */
  getTrendAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date_debut, date_fin, period_type } = req.query;

      // Parse date range (required for trends)
      if (!date_debut || !date_fin) {
        res.status(400).json({
          success: false,
          error: 'Date range is required for trend analytics (date_debut and date_fin)',
        });
        return;
      }

      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      if (!dateRange) {
        res.status(400).json({
          success: false,
          error: 'Invalid date range provided',
        });
        return;
      }

      // Parse period type
      const periodType = (period_type as PeriodType) || 'month';

      // Execute use case
      const useCase = new GetTrendAnalytics(this.statisticsRepository);
      const analytics = await useCase.execute({
        dateRange,
        periodType,
      });

      res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get specific metric
   * GET /api/statistics/metrics/:metric
   *
   * Params:
   * - metric: 'total-members' | 'active-members' | 'total-revenue' | etc.
   *
   * Query params:
   * - date_debut: ISO date string (optional)
   * - date_fin: ISO date string (optional)
   */
  getMetric = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { metric } = req.params;
      const { date_debut, date_fin } = req.query;

      // Parse date range if provided
      const dateRange = this.parseDateRange(date_debut as string, date_fin as string);

      let value: number;

      // Route to appropriate repository method
      switch (metric) {
        case 'total-members':
          value = await this.statisticsRepository.getTotalMembers();
          break;

        case 'active-members':
          value = await this.statisticsRepository.getTotalMembers(true);
          break;

        case 'new-members':
          if (!dateRange) {
            res.status(400).json({
              success: false,
              error: 'Date range is required for new members metric',
            });
            return;
          }
          value = await this.statisticsRepository.getNewMembersCount(dateRange);
          break;

        case 'total-courses':
          value = await this.statisticsRepository.getTotalCourses(dateRange);
          break;

        case 'attendance-rate':
          value = await this.statisticsRepository.getAttendanceRate(dateRange);
          break;

        case 'total-revenue':
          value = await this.statisticsRepository.getTotalRevenue(dateRange);
          break;

        case 'late-payments-count':
          value = await this.statisticsRepository.getLatePaymentsCount();
          break;

        case 'late-payments-amount':
          value = await this.statisticsRepository.getLatePaymentsAmount();
          break;

        case 'total-orders':
          value = await this.statisticsRepository.getTotalOrders(dateRange);
          break;

        case 'store-revenue':
          value = await this.statisticsRepository.getStoreRevenue(dateRange);
          break;

        default:
          res.status(404).json({
            success: false,
            error: `Unknown metric: ${metric}`,
          });
          return;
      }

      res.status(200).json({
        success: true,
        data: {
          metric,
          value,
          date_range: dateRange,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Health check endpoint
   * GET /api/statistics/health
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isHealthy = await this.statisticsRepository.healthCheck();

      if (isHealthy) {
        res.status(200).json({
          success: true,
          message: 'Statistics service is healthy',
          timestamp: new Date(),
        });
      } else {
        res.status(503).json({
          success: false,
          error: 'Statistics service is unhealthy',
          timestamp: new Date(),
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Parse date range from query parameters
   *
   * @param dateDebut - Start date string
   * @param dateFin - End date string
   * @returns Parsed date range or undefined
   */
  private parseDateRange(
    dateDebut?: string,
    dateFin?: string
  ): AnalyticsDateRange | undefined {
    if (!dateDebut || !dateFin) {
      return undefined;
    }

    try {
      const date_debut = new Date(dateDebut);
      const date_fin = new Date(dateFin);

      // Validate dates
      if (isNaN(date_debut.getTime()) || isNaN(date_fin.getTime())) {
        return undefined;
      }

      // Ensure date_fin is after date_debut
      if (date_fin < date_debut) {
        return undefined;
      }

      return { date_debut, date_fin };
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Validate period type
   *
   * @param periodType - Period type string
   * @returns True if valid
   */
  private isValidPeriodType(periodType: string): periodType is PeriodType {
    return ['day', 'week', 'month', 'quarter', 'year'].includes(periodType);
  }
}
