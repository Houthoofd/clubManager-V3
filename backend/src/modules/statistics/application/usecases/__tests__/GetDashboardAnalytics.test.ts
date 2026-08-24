import { GetDashboardAnalytics } from '../GetDashboardAnalytics.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetDashboardAnalytics', () => {
  let useCase: GetDashboardAnalytics;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getDashboardAnalytics: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetDashboardAnalytics(mockRepo);
  });

  it('should successfully get dashboard analytics with defaults', async () => {
    const mockResult = { data: 'test', trends: { date_range: {} } } as any;
    mockRepo.getDashboardAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(undefined, 'month');
    expect(result).toEqual(mockResult);
  });

  it('should successfully get dashboard analytics with all params', async () => {
    const mockResult = { data: 'test', trends: { date_range: {} } } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getDashboardAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange, periodType: 'week', includeTrends: true });

    expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(dateRange, 'week');
    expect(result).toEqual(mockResult);
  });

  it('should filter out trends if includeTrends is false (with dateRange)', async () => {
    const mockResult = { data: 'test', trends: { date_range: {}, extra: 'info' } } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getDashboardAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange, includeTrends: false });

    expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(dateRange, 'month');
    expect(result.trends).toEqual({ date_range: dateRange });
  });

  it('should filter out trends if includeTrends is false (without dateRange)', async () => {
    const mockResult = { data: 'test', trends: { date_range: {}, extra: 'info' } } as any;
    mockRepo.getDashboardAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ includeTrends: false });

    expect(mockRepo.getDashboardAnalytics).toHaveBeenCalledWith(undefined, 'month');
    expect(result.trends.date_range).toHaveProperty('date_debut');
    expect(result.trends.date_range).toHaveProperty('date_fin');
    expect((result.trends as any).extra).toBeUndefined();
  });

  it('should wrap and propagate known errors from repository', async () => {
    mockRepo.getDashboardAnalytics.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve dashboard analytics: DB Error');
  });

  it('should wrap and propagate unknown errors from repository', async () => {
    mockRepo.getDashboardAnalytics.mockRejectedValue('Unknown String Error');

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve dashboard analytics: Unknown error');
  });
});
