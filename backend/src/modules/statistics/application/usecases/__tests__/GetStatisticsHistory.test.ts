import { GetStatisticsHistory } from '../GetStatisticsHistory.js';
import type { IStatisticsRepository } from '../../../domain/repositories/StatisticsRepository.js';

describe('GetStatisticsHistory', () => {
  let useCase: GetStatisticsHistory;
  let mockRepo: jest.Mocked<IStatisticsRepository>;

  beforeEach(() => {
    mockRepo = {
      getSnapshotHistory: jest.fn(),
    } as unknown as jest.Mocked<IStatisticsRepository>;
    useCase = new GetStatisticsHistory(mockRepo);
  });

  it('should successfully get history without args', async () => {
    const mockResult = [{ type: 't', cle: 'c', valeur: 'v', date_stat: new Date() }];
    mockRepo.getSnapshotHistory.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockRepo.getSnapshotHistory).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(mockResult);
  });

  it('should successfully get history with args', async () => {
    const mockResult = [{ type: 't', cle: 'c', valeur: 'v', date_stat: new Date() }];
    mockRepo.getSnapshotHistory.mockResolvedValue(mockResult);

    const result = await useCase.execute('type1', 10);

    expect(mockRepo.getSnapshotHistory).toHaveBeenCalledWith('type1', 10);
    expect(result).toEqual(mockResult);
  });
  
  it('should propagate errors from repository', async () => {
    mockRepo.getSnapshotHistory.mockRejectedValue(new Error('DB Error'));

    await expect(useCase.execute()).rejects.toThrow('DB Error');
  });
});
