import { GetCourseAnalytics } from '../GetCourseAnalytics.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetCourseAnalytics', () => {
  let useCase: GetCourseAnalytics;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getCourseAnalytics: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetCourseAnalytics(mockRepo);
  });

  it('should successfully get course analytics without date range', async () => {
    const mockResult = { test: true } as any;
    mockRepo.getCourseAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.getCourseAnalytics).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(mockResult);
  });

  it('should successfully get course analytics with date range', async () => {
    const mockResult = { test: true } as any;
    const dateRange = { date_debut: new Date(), date_fin: new Date() };
    mockRepo.getCourseAnalytics.mockResolvedValue(mockResult);

    const result = await useCase.execute({ dateRange });

    expect(mockRepo.getCourseAnalytics).toHaveBeenCalledWith(dateRange);
    expect(result).toEqual(mockResult);
  });
  
  it('should wrap and propagate known errors from repository', async () => {
    mockRepo.getCourseAnalytics.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve course analytics: DB Error');
  });

  it('should wrap and propagate unknown errors from repository', async () => {
    mockRepo.getCourseAnalytics.mockRejectedValue('Unknown String Error');

    await expect(useCase.execute()).rejects.toThrow('Failed to retrieve course analytics: Unknown error');
  });
});
