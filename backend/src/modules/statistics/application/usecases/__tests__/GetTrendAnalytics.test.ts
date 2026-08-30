import { GetTrendAnalytics } from '../GetTrendAnalytics.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetTrendAnalytics', () => {
  let useCase: GetTrendAnalytics;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getTrendAnalytics: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetTrendAnalytics(mockRepo);
  });

  it('should successfully get trend analytics with default periodType', async () => {
    const mockResult = { data: [] } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getTrendAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange });

    expect(mockRepo.getTrendAnalytics).toHaveBeenCalledWith(dateRange, 'month');
    expect(result).toEqual(mockResult);
  });

  it('should successfully get trend analytics with specific periodType', async () => {
    const mockResult = { data: [] } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getTrendAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange, periodType: 'week' });

    expect(mockRepo.getTrendAnalytics).toHaveBeenCalledWith(dateRange, 'week');
    expect(result).toEqual(mockResult);
  });
  
  it('should wrap and propagate known errors from repository', async () => {
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getTrendAnalytics.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute({ dateRange })).rejects.toThrow('Failed to retrieve trend analytics: DB Error');
  });

  it('should wrap and propagate unknown errors from repository', async () => {
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getTrendAnalytics.mockRejectedValue('Unknown String Error');

    await expect(useCase.execute({ dateRange })).rejects.toThrow('Failed to retrieve trend analytics: Unknown error');
  });
});
