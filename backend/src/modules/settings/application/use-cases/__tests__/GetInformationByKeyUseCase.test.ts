import { GetInformationByKeyUseCase } from '../GetInformationByKeyUseCase.js';
import type { IInformationRepository } from '../../../domain/repositories/IInformationRepository.js';

describe('GetInformationByKeyUseCase', () => {
  let mockRepo: jest.Mocked<IInformationRepository>;
  let useCase: GetInformationByKeyUseCase;

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
    useCase = new GetInformationByKeyUseCase(mockRepo);
  });

  it('should throw an error if key is empty or missing', async () => {
    await expect(useCase.execute('')).rejects.toThrow('La clé est requise');
    await expect(useCase.execute('   ')).rejects.toThrow('La clé est requise');
    await expect(useCase.execute(null as any)).rejects.toThrow('La clé est requise');
  });

  it('should throw an error if information is not found', async () => {
    mockRepo.findByKey.mockResolvedValue(null);
    await expect(useCase.execute('unknown')).rejects.toThrow("Paramètre 'unknown' introuvable");
    expect(mockRepo.findByKey).toHaveBeenCalledWith('unknown');
  });

  it('should return information successfully', async () => {
    const mockInfo = { id_information: 1, cle: 'key1', valeur: 'val1', description: null, created_at: new Date(), updated_at: new Date() };
    mockRepo.findByKey.mockResolvedValue(mockInfo);
    
    const result = await useCase.execute(' key1 ');
    
    expect(mockRepo.findByKey).toHaveBeenCalledWith('key1');
    expect(result).toEqual(mockInfo);
  });
});
