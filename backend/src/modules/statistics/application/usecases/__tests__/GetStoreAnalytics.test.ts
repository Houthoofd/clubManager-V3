import { GetStoreAnalytics } from '../GetStoreAnalytics.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetStoreAnalytics', () => {
  let useCase: GetStoreAnalytics;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getStoreAnalytics: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetStoreAnalytics(mockRepo);
  });

  it('should successfully get store analytics without date range', async () => {
    const mockResult = { sales: 1000 } as any;
    mockRepo.getStoreAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.getStoreAnalytics).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockResult);
  });

  it('should successfully get store analytics with date range', async () => {
    const mockResult = { sales: 1000 } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getStoreAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange });

    expect(mockRepo.getStoreAnalytics).toHaveBeenCalledWith(dateRange);
    expect(result).toEqual(mockResult);
  });
  
  it('should wrap and propagate known errors from repository', async () => {
    mockRepo.getStoreAnalytics.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve store analytics: DB Error');
  });

  it('should wrap and propagate unknown errors from repository', async () => {
    mockRepo.getStoreAnalytics.mockRejectedValue('Unknown String Error');

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve store analytics: Unknown error');
  });
});
