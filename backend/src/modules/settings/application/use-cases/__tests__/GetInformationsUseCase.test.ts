import { GetInformationsUseCase } from '../GetInformationsUseCase.js';
import type { IInformationRepository } from '../../../domain/repositories/IInformationRepository.js';

describe('GetInformationsUseCase', () => {
  let mockRepo: jest.Mocked<IInformationRepository>;
  let useCase: GetInformationsUseCase;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByKey: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      bulkUpsert: jest.fn(),
    };
    useCase = new GetInformationsUseCase(mockRepo);
  });

  it('should call repo with default page and limit if not provided', async () => {
    const mockResponse = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    mockRepo.findAll.mockResolvedValue(mockResponse);

    const result = await useCase.execute({});
    
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(result).toEqual(mockResponse);
  });

  it('should constrain page to a minimum of 1', async () => {
    const mockResponse = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    mockRepo.findAll.mockResolvedValue(mockResponse);

    await useCase.execute({ page: -5, limit: 20 });
    
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('should constrain limit between 1 and 100', async () => {
    const mockResponse = { data: [], total: 0, page: 1, limit: 100, totalPages: 0 };
    mockRepo.findAll.mockResolvedValue(mockResponse);

    await useCase.execute({ limit: 150 });
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 100 });

    await useCase.execute({ limit: 0 });
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 1 });
  });

  it('should pass through query parameters correctly', async () => {
    const mockResponse = { data: [], total: 0, page: 2, limit: 50, totalPages: 0 };
    mockRepo.findAll.mockResolvedValue(mockResponse);

    await useCase.execute({ page: 2, limit: 50, search: 'test', sort_by: 'updated_at' });
    
    expect(mockRepo.findAll).toHaveBeenCalledWith({ page: 2, limit: 50, search: 'test', sort_by: 'updated_at' });
  });
});
