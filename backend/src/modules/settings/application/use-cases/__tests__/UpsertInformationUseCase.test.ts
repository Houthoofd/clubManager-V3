import { UpsertInformationUseCase } from '../UpsertInformationUseCase.js';
import type { IInformationRepository } from '../../../domain/repositories/IInformationRepository.js';

describe('UpsertInformationUseCase', () => {
  let mockRepo: jest.Mocked<IInformationRepository>;
  let useCase: UpsertInformationUseCase;

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
    useCase = new UpsertInformationUseCase(mockRepo);
  });

  it('should throw an error if key is empty or missing', async () => {
    await expect(useCase.execute({ cle: '', valeur: 'val1' })).rejects.toThrow('La clé est requise');
    await expect(useCase.execute({ cle: '   ', valeur: 'val1' })).rejects.toThrow('La clé est requise');
    await expect(useCase.execute({ valeur: 'val1' } as any)).rejects.toThrow('La clé est requise');
  });

  it('should throw an error if value is empty or missing', async () => {
    await expect(useCase.execute({ cle: 'key1', valeur: '' })).rejects.toThrow('La valeur est requise');
    await expect(useCase.execute({ cle: 'key1', valeur: '   ' })).rejects.toThrow('La valeur est requise');
    await expect(useCase.execute({ cle: 'key1' } as any)).rejects.toThrow('La valeur est requise');
  });

  it('should throw an error if key is longer than 100 characters', async () => {
    const longKey = 'a'.repeat(101);
    await expect(useCase.execute({ cle: longKey, valeur: 'val1' })).rejects.toThrow('La clé ne peut pas dépasser 100 caractères');
  });

  it('should upsert successfully with trimmed values and default description to null', async () => {
    const mockInfo = { id_information: 1, cle: 'key1', valeur: 'val1', description: null, created_at: new Date(), updated_at: new Date() };
    mockRepo.upsert.mockResolvedValue(mockInfo);

    const result = await useCase.execute({ cle: ' key1 ', valeur: ' val1 ' });
    
    expect(mockRepo.upsert).toHaveBeenCalledWith({ cle: 'key1', valeur: 'val1', description: null });
    expect(result).toEqual(mockInfo);
  });

  it('should upsert successfully with provided description', async () => {
    const mockInfo = { id_information: 1, cle: 'key1', valeur: 'val1', description: 'desc', created_at: new Date(), updated_at: new Date() };
    mockRepo.upsert.mockResolvedValue(mockInfo);

    const result = await useCase.execute({ cle: 'key1', valeur: 'val1', description: ' desc ' });
    
    expect(mockRepo.upsert).toHaveBeenCalledWith({ cle: 'key1', valeur: 'val1', description: 'desc' });
    expect(result).toEqual(mockInfo);
  });
});
