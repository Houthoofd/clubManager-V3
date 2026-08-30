import { GetFinancialAnalytics } from '../GetFinancialAnalytics.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetFinancialAnalytics', () => {
  let useCase: GetFinancialAnalytics;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getFinancialAnalytics: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetFinancialAnalytics(mockRepo);
  });

  it('should successfully get financial analytics without date range', async () => {
    const mockResult = { revenue: 1000 } as any;
    mockRepo.getFinancialAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.getFinancialAnalytics).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockResult);
  });

  it('should successfully get financial analytics with date range', async () => {
    const mockResult = { revenue: 1000 } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getFinancialAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange });

    expect(mockRepo.getFinancialAnalytics).toHaveBeenCalledWith(dateRange);
    expect(result).toEqual(mockResult);
  });
  
  it('should wrap and propagate known errors from repository', async () => {
    mockRepo.getFinancialAnalytics.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve financial analytics: DB Error');
  });

  it('should wrap and propagate unknown errors from repository', async () => {
    mockRepo.getFinancialAnalytics.mockRejectedValue('Unknown String Error');

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve financial analytics: Unknown error');
  });
});
