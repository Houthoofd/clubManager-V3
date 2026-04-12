/**
 * @fileoverview Unit Tests for GetDashboardAnalytics Use Case
 * @module statistics/__tests__/unit/GetDashboardAnalytics.test
 */

import { GetDashboardAnalytics } from '../../application/usecases/GetDashboardAnalytics.js';
import type { IStatisticsRepository } from '../../domain/repositories/StatisticsRepository.js';
import type {
  DashboardAnalytics,
  AnalyticsDateRange,
  MemberAnalyticsResponse,
  CourseAnalyticsResponse,
  FinancialAnalyticsResponse,
  StoreAnalyticsResponse,
  TrendAnalyticsResponse,
} from '@clubmanager/types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockDateRange: AnalyticsDateRange = {
  date_debut: new Date('2024-01-01'),
  date_fin: new Date('2024-12-31'),
};

const mockMemberAnalytics: MemberAnalyticsResponse = {
  overview: {
    total_membres: 150,
    membres_actifs: 140,
    membres_inactifs: 10,
    nouveaux_membres_mois: 12,
    nouveaux_membres_semaine: 3,
    taux_croissance: 8.5,
    date_calcul: new Date(),
  },
  by_grade: [],
  by_gender: [],
  by_age_group: [],
};

const mockCourseAnalytics: CourseAnalyticsResponse = {
  overview: {
    total_cours: 120,
    total_inscriptions: 1850,
    total_presences: 1665,
    taux_presence: 90.0,
    moyenne_participants_par_cours: 15.4,
    date_calcul: new Date(),
  },
  by_type: [],
  popular_courses: [],
  by_day_of_week: [],
};

const mockFinancialAnalytics: FinancialAnalyticsResponse = {
  overview: {
    total_revenus: 25000.0,
    total_paiements_valides: 145,
    total_paiements_en_attente: 8,
    total_paiements_echoues: 2,
    montant_en_attente: 800.0,
    montant_echeances_retard: 450.0,
    nombre_echeances_retard: 5,
    taux_paiement: 96.0,
    date_calcul: new Date(),
  },
  by_payment_method: [],
  by_subscription_plan: [],
  late_payments: [],
};

const mockStoreAnalytics: StoreAnalyticsResponse = {
  overview: {
    total_commandes: 85,
    commandes_payees: 78,
    commandes_en_attente: 5,
    commandes_annulees: 2,
    total_revenus: 12500.0,
    panier_moyen: 160.25,
    total_articles_vendus: 245,
    taux_conversion: 0,
    date_calcul: new Date(),
  },
  popular_products: [],
  by_category: [],
  low_stock: [],
};

const mockTrendAnalytics: TrendAnalyticsResponse = {
  member_growth: {
    type: 'member_growth',
    period_type: 'month',
    data: [],
    total_variation: 15.3,
    moyenne: 10.5,
  },
  attendance: {
    type: 'attendance',
    period_type: 'month',
    data: [],
    total_variation: 5.2,
    moyenne: 85.0,
  },
  revenue: {
    type: 'revenue',
    period_type: 'month',
    data: [],
    total_variation: 12.8,
    moyenne: 2000.0,
    total: 24000.0,
  },
  date_range: mockDateRange,
};

const mockDashboardAnalytics: DashboardAnalytics = {
  members: mockMemberAnalytics,
  courses: mockCourseAnalytics,
  finance: mockFinancialAnalytics,
  store: mockStoreAnalytics,
  trends: mockTrendAnalytics,
  generated_at: new Date(),
};

// ============================================================================
// MOCK REPOSITORY
// ============================================================================

const createMockRepository = (): jest.Mocked<IStatisticsRepository> => ({
  // Dashboard
  getDashboardAnalytics: jest.fn().mockResolvedValue(mockDashboardAnalytics),

  // Members
  getMemberAnalytics: jest.fn().mockResolvedValue(mockMemberAnalytics),
  getTotalMembers: jest.fn().mockResolvedValue(150),
  getNewMembersCount: jest.fn().mockResolvedValue(12),
  getMemberGrowthRate: jest.fn().mockResolvedValue(8.5),

  // Courses
  getCourseAnalytics: jest.fn().mockResolvedValue(mockCourseAnalytics),
  getTotalCourses: jest.fn().mockResolvedValue(120),
  getAttendanceRate: jest.fn().mockResolvedValue(90.0),
  getAverageParticipantsPerCourse: jest.fn().mockResolvedValue(15.4),

  // Financial
  getFinancialAnalytics: jest.fn().mockResolvedValue(mockFinancialAnalytics),
  getTotalRevenue: jest.fn().mockResolvedValue(25000.0),
  getPaymentSuccessRate: jest.fn().mockResolvedValue(96.0),
  getLatePaymentsCount: jest.fn().mockResolvedValue(5),
  getLatePaymentsAmount: jest.fn().mockResolvedValue(450.0),

  // Store
  getStoreAnalytics: jest.fn().mockResolvedValue(mockStoreAnalytics),
  getTotalOrders: jest.fn().mockResolvedValue(85),
  getStoreRevenue: jest.fn().mockResolvedValue(12500.0),
  getAverageCartValue: jest.fn().mockResolvedValue(160.25),
  getConversionRate: jest.fn().mockResolvedValue(0),

  // Trends
  getTrendAnalytics: jest.fn().mockResolvedValue(mockTrendAnalytics),
  getMemberGrowthTrend: jest.fn(),
  getAttendanceTrend: jest.fn(),
  getRevenueTrend: jest.fn(),

  // Health
  healthCheck: jest.fn().mockResolvedValue(true),
});

// ============================================================================
// TESTS
// ============================================================================

describe('GetDashboardAnalytics Use Case', () => {
  let useCase: GetDashboardAnalytics;
  let mockRepository: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new GetDashboardAnalytics(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================================================
  // SUCCESS CASES
  // ==========================================================================

  describe('Success Cases', () => {
    it('should retrieve dashboard analytics without date range', async () => {
      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result).toEqual(mockDashboardAnalytics);
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        undefined,
        'month'
      );
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledTimes(1);
    });

    it('should retrieve dashboard analytics with date range', async () => {
      // Act
      const result = await useCase.execute({
        dateRange: mockDateRange,
      });

      // Assert
      expect(result).toEqual(mockDashboardAnalytics);
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        mockDateRange,
        'month'
      );
    });

    it('should retrieve dashboard analytics with custom period type', async () => {
      // Act
      const result = await useCase.execute({
        dateRange: mockDateRange,
        periodType: 'week',
      });

      // Assert
      expect(result).toEqual(mockDashboardAnalytics);
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        mockDateRange,
        'week'
      );
    });

    it('should retrieve dashboard analytics without trends when includeTrends is false', async () => {
      // Arrange
      const expectedResult = {
        ...mockDashboardAnalytics,
        trends: {
          date_range: mockDateRange,
        },
      };

      // Act
      const result = await useCase.execute({
        dateRange: mockDateRange,
        includeTrends: false,
      });

      // Assert
      expect(result.trends).toEqual({
        date_range: mockDateRange,
      });
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalled();
    });

    it('should use default periodType of "month" when not specified', async () => {
      // Act
      await useCase.execute({});

      // Assert
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        undefined,
        'month'
      );
    });

    it('should use includeTrends default of true when not specified', async () => {
      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result.trends).toBeDefined();
      expect(result.trends).toHaveProperty('member_growth');
      expect(result.trends).toHaveProperty('attendance');
      expect(result.trends).toHaveProperty('revenue');
    });

    it('should handle all period types correctly', async () => {
      const periodTypes = ['day', 'week', 'month', 'quarter', 'year'] as const;

      for (const periodType of periodTypes) {
        // Act
        await useCase.execute({
          dateRange: mockDateRange,
          periodType,
        });

        // Assert
        expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
          mockDateRange,
          periodType
        );

        // Reset mock
        jest.clearAllMocks();
      }
    });

    it('should include all required analytics sections in response', async () => {
      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result).toHaveProperty('members');
      expect(result).toHaveProperty('courses');
      expect(result).toHaveProperty('finance');
      expect(result).toHaveProperty('store');
      expect(result).toHaveProperty('trends');
      expect(result).toHaveProperty('generated_at');
    });

    it('should pass through all analytics data correctly', async () => {
      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result.members).toEqual(mockMemberAnalytics);
      expect(result.courses).toEqual(mockCourseAnalytics);
      expect(result.finance).toEqual(mockFinancialAnalytics);
      expect(result.store).toEqual(mockStoreAnalytics);
      expect(result.trends).toEqual(mockTrendAnalytics);
    });
  });

  // ==========================================================================
  // ERROR CASES
  // ==========================================================================

  describe('Error Cases', () => {
    it('should throw error when repository fails', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockRepository.getDashboardAnalytics.mockRejectedValueOnce(
        new Error(errorMessage)
      );

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow(
        `Failed to retrieve dashboard analytics: ${errorMessage}`
      );
    });

    it('should throw error with unknown error message when error is not an Error instance', async () => {
      // Arrange
      mockRepository.getDashboardAnalytics.mockRejectedValueOnce('String error');

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow(
        'Failed to retrieve dashboard analytics: Unknown error'
      );
    });

    it('should handle repository returning null gracefully', async () => {
      // Arrange
      mockRepository.getDashboardAnalytics.mockResolvedValueOnce(null as any);

      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result).toBeNull();
    });

    it('should propagate repository errors without modification', async () => {
      // Arrange
      const customError = new Error('Custom repository error');
      mockRepository.getDashboardAnalytics.mockRejectedValueOnce(customError);

      // Act & Assert
      await expect(useCase.execute({})).rejects.toThrow(
        'Failed to retrieve dashboard analytics: Custom repository error'
      );
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle empty input object', async () => {
      // Act
      const result = await useCase.execute({});

      // Assert
      expect(result).toEqual(mockDashboardAnalytics);
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalled();
    });

    it('should handle undefined input', async () => {
      // Act
      const result = await useCase.execute(undefined as any);

      // Assert
      expect(result).toEqual(mockDashboardAnalytics);
    });

    it('should handle date range with same start and end date', async () => {
      // Arrange
      const sameDateRange: AnalyticsDateRange = {
        date_debut: new Date('2024-01-15'),
        date_fin: new Date('2024-01-15'),
      };

      // Act
      await useCase.execute({ dateRange: sameDateRange });

      // Assert
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        sameDateRange,
        'month'
      );
    });

    it('should handle very long date ranges', async () => {
      // Arrange
      const longDateRange: AnalyticsDateRange = {
        date_debut: new Date('2020-01-01'),
        date_fin: new Date('2024-12-31'),
      };

      // Act
      await useCase.execute({ dateRange: longDateRange });

      // Assert
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        longDateRange,
        'month'
      );
    });

    it('should handle explicit undefined values in input', async () => {
      // Act
      await useCase.execute({
        dateRange: undefined,
        periodType: undefined,
        includeTrends: undefined,
      });

      // Assert
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledWith(
        undefined,
        'month'
      );
    });
  });

  // ==========================================================================
  // INTEGRATION BEHAVIOR
  // ==========================================================================

  describe('Integration Behavior', () => {
    it('should call repository exactly once per execution', async () => {
      // Act
      await useCase.execute({});

      // Assert
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledTimes(1);
    });

    it('should not modify input parameters', async () => {
      // Arrange
      const input = {
        dateRange: { ...mockDateRange },
        periodType: 'month' as const,
        includeTrends: true,
      };
      const inputCopy = JSON.parse(JSON.stringify(input));

      // Act
      await useCase.execute(input);

      // Assert
      expect(JSON.stringify(input)).toEqual(JSON.stringify(inputCopy));
    });

    it('should handle concurrent executions independently', async () => {
      // Act
      const [result1, result2, result3] = await Promise.all([
        useCase.execute({}),
        useCase.execute({ periodType: 'week' }),
        useCase.execute({ includeTrends: false }),
      ]);

      // Assert
      expect(result1).toEqual(mockDashboardAnalytics);
      expect(result2).toEqual(mockDashboardAnalytics);
      expect(result3.trends).toEqual({ date_range: undefined });
      expect(mockRepository.getDashboardAnalytics).toHaveBeenCalledTimes(3);
    });
  });
});
