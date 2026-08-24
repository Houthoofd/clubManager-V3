import { StatisticsController } from '../StatisticsController.js';
import type { Request, Response, NextFunction } from 'express';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('StatisticsController', () => {
  let controller: StatisticsController;
  let mockRepo: jest.Mocked<IStatisticsRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockRepo = {
      getDashboardAnalytics: jest.fn(),
      getCourseAnalytics: jest.fn(),
      getFinancialAnalytics: jest.fn(),
      getStoreAnalytics: jest.fn(),
      getTrendAnalytics: jest.fn(),
      getMemberAnalytics: jest.fn(),
      getTotalMembers: jest.fn(),
      getNewMembersCount: jest.fn(),
      getTotalCourses: jest.fn(),
      getAttendanceRate: jest.fn(),
      getTotalRevenue: jest.fn(),
      getLatePaymentsCount: jest.fn(),
      getLatePaymentsAmount: jest.fn(),
      getTotalOrders: jest.fn(),
      getStoreRevenue: jest.fn(),
      healthCheck: jest.fn(),
      createSnapshot: jest.fn(),
      getSnapshotHistory: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;

    controller = new StatisticsController(mockRepo);

    req = { query: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('getDashboard', () => {
    it('should successfully get dashboard data with valid dates', async () => {
      req.query = { date_debut: '2024-01-01', date_fin: '2024-12-31', period_type: 'week', include_trends: 'true' };
      mockRepo.getDashboardAnalytics.mockResolvedValue({} as any);

      await controller.getDashboard(req as Request, res as Response, next);

      expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ date_debut: new Date('2024-01-01') }),
        'week'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });

    it('should handle invalid date format gracefully', async () => {
      req.query = { date_debut: 'invalid', date_fin: '2024-12-31' };
      mockRepo.getDashboardAnalytics.mockResolvedValue({} as any);

      await controller.getDashboard(req as Request, res as Response, next);

      expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(undefined, 'month');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle date_fin before date_debut gracefully', async () => {
      req.query = { date_debut: '2024-12-31', date_fin: '2024-01-01' };
      mockRepo.getDashboardAnalytics.mockResolvedValue({} as any);

      await controller.getDashboard(req as Request, res as Response, next);

      expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(undefined, 'month');
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Test Error');
      mockRepo.getDashboardAnalytics.mockRejectedValue(error);

      await controller.getDashboard(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('getMemberAnalytics', () => {
    it('should successfully get member analytics', async () => {
      mockRepo.getMemberAnalytics.mockResolvedValue({} as any);
      await controller.getMemberAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should call next on error', async () => {
      mockRepo.getMemberAnalytics.mockRejectedValue(new Error('error'));
      await controller.getMemberAnalytics(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getCourseAnalytics', () => {
    it('should successfully get course analytics', async () => {
      mockRepo.getCourseAnalytics.mockResolvedValue({} as any);
      await controller.getCourseAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should call next on error', async () => {
      mockRepo.getCourseAnalytics.mockRejectedValue(new Error('error'));
      await controller.getCourseAnalytics(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getFinancialAnalytics', () => {
    it('should successfully get financial analytics', async () => {
      mockRepo.getFinancialAnalytics.mockResolvedValue({} as any);
      await controller.getFinancialAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should call next on error', async () => {
      mockRepo.getFinancialAnalytics.mockRejectedValue(new Error('error'));
      await controller.getFinancialAnalytics(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getStoreAnalytics', () => {
    it('should successfully get store analytics', async () => {
      mockRepo.getStoreAnalytics.mockResolvedValue({} as any);
      await controller.getStoreAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    
    it('should call next on error', async () => {
      mockRepo.getStoreAnalytics.mockRejectedValue(new Error('error'));
      await controller.getStoreAnalytics(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getTrendAnalytics', () => {
    it('should require date_debut and date_fin', async () => {
      await controller.getTrendAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: expect.any(String) });
    });

    it('should require valid date range', async () => {
      req.query = { date_debut: 'invalid', date_fin: 'invalid' };
      await controller.getTrendAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid date range provided' });
    });

    it('should successfully get trend analytics with valid dates', async () => {
      req.query = { date_debut: '2024-01-01', date_fin: '2024-12-31' };
      mockRepo.getTrendAnalytics.mockResolvedValue({} as any);
      await controller.getTrendAnalytics(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      req.query = { date_debut: '2024-01-01', date_fin: '2024-12-31' };
      mockRepo.getTrendAnalytics.mockRejectedValue(new Error('error'));
      await controller.getTrendAnalytics(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getMetric', () => {
    it('should handle total-members', async () => {
      req.params = { metric: 'total-members' };
      mockRepo.getTotalMembers.mockResolvedValue(10);
      await controller.getMetric(req as Request, res as Response, next);
      expect(mockRepo.getTotalMembers).toHaveBeenCalledWith();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle active-members', async () => {
      req.params = { metric: 'active-members' };
      mockRepo.getTotalMembers.mockResolvedValue(5);
      await controller.getMetric(req as Request, res as Response, next);
      expect(mockRepo.getTotalMembers).toHaveBeenCalledWith(true);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle new-members with valid date range', async () => {
      req.params = { metric: 'new-members' };
      req.query = { date_debut: '2024-01-01', date_fin: '2024-12-31' };
      mockRepo.getNewMembersCount.mockResolvedValue(3);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject new-members without valid date range', async () => {
      req.params = { metric: 'new-members' };
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle total-courses', async () => {
      req.params = { metric: 'total-courses' };
      mockRepo.getTotalCourses.mockResolvedValue(2);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle attendance-rate', async () => {
      req.params = { metric: 'attendance-rate' };
      mockRepo.getAttendanceRate.mockResolvedValue(80);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle total-revenue', async () => {
      req.params = { metric: 'total-revenue' };
      mockRepo.getTotalRevenue.mockResolvedValue(1000);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle late-payments-count', async () => {
      req.params = { metric: 'late-payments-count' };
      mockRepo.getLatePaymentsCount.mockResolvedValue(1);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle late-payments-amount', async () => {
      req.params = { metric: 'late-payments-amount' };
      mockRepo.getLatePaymentsAmount.mockResolvedValue(50);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle total-orders', async () => {
      req.params = { metric: 'total-orders' };
      mockRepo.getTotalOrders.mockResolvedValue(10);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle store-revenue', async () => {
      req.params = { metric: 'store-revenue' };
      mockRepo.getStoreRevenue.mockResolvedValue(500);
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 for unknown metric', async () => {
      req.params = { metric: 'unknown-metric' };
      await controller.getMetric(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should call next on error', async () => {
      req.params = { metric: 'total-members' };
      mockRepo.getTotalMembers.mockRejectedValue(new Error('error'));
      await controller.getMetric(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return 200 if healthy', async () => {
      mockRepo.healthCheck.mockResolvedValue(true);
      await controller.healthCheck(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('should return 503 if unhealthy', async () => {
      mockRepo.healthCheck.mockResolvedValue(false);
      await controller.healthCheck(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('should call next on error', async () => {
      mockRepo.healthCheck.mockRejectedValue(new Error('error'));
      await controller.healthCheck(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('createSnapshot', () => {
    it('should successfully create snapshot', async () => {
      mockRepo.createSnapshot.mockResolvedValue({ inserted: 1, date_stat: new Date() });
      await controller.createSnapshot(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should call next on error', async () => {
      mockRepo.createSnapshot.mockRejectedValue(new Error('error'));
      await controller.createSnapshot(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getHistory', () => {
    it('should successfully get history', async () => {
      req.query = { type: 'membres', limit: '10' };
      mockRepo.getSnapshotHistory.mockResolvedValue([]);
      await controller.getHistory(req as Request, res as Response, next);
      expect(mockRepo.getSnapshotHistory).toHaveBeenCalledWith('membres', 10);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call next on error', async () => {
      mockRepo.getSnapshotHistory.mockRejectedValue(new Error('error'));
      await controller.getHistory(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Helper methods', () => {
    it('isValidPeriodType should validate period types', () => {
      const isValid = (controller as any).isValidPeriodType('month');
      expect(isValid).toBe(true);
      const isInvalid = (controller as any).isValidPeriodType('invalid');
      expect(isInvalid).toBe(false);
    });

    it('parseDateRange should return undefined if Date throws', () => {
      const originalDate = global.Date;
      const mockDate = jest.fn(() => { throw new Error('Simulated error'); }) as unknown as typeof Date;
      global.Date = mockDate;
      
      const result = (controller as any).parseDateRange('2024-01-01', '2024-12-31');
      expect(result).toBeUndefined();
      
      global.Date = originalDate;
    });
  });
});
