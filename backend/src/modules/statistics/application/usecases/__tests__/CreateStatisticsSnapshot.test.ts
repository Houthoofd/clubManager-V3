import { CreateStatisticsSnapshot } from '../CreateStatisticsSnapshot.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('CreateStatisticsSnapshot', () => {
  let useCase: CreateStatisticsSnapshot;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      createSnapshot: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new CreateStatisticsSnapshot(mockRepo);
  });

  it('should successfully create a snapshot', async () => {
    const mockResult = { inserted: 5, date_stat: new Date('2024-01-01') };
    mockRepo.createSnapshot.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.createSnapshot).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResult);
  });
  
  it('should propagate errors from repository', async () => {
    mockRepo.createSnapshot.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('DB Error');
  });
});
