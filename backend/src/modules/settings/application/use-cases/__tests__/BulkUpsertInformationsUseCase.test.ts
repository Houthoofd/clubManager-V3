import { BulkUpsertInformationsUseCase } from '../BulkUpsertInformationsUseCase.js';
import type { IInformationRepository } from '../../../domain/repositories/IInformationRepository.js';

describe('BulkUpsertInformationsUseCase', () => {
  let mockRepo: jest.Mocked<IInformationRepository>;
  let useCase: BulkUpsertInformationsUseCase;

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
    useCase = new BulkUpsertInformationsUseCase(mockRepo);
  });

  it('should throw an error if no informations are provided', async () => {
    await expect(useCase.execute([])).rejects.toThrow('Au moins une information doit être fournie');
    await expect(useCase.execute(null as any)).rejects.toThrow('Au moins une information doit être fournie');
  });

  it('should throw an error if more than 50 informations are provided', async () => {
    const infos = Array.from({ length: 51 }, (_, i) => ({ cle: `key${i}`, valeur: `val${i}` }));
    await expect(useCase.execute(infos)).rejects.toThrow('Vous ne pouvez pas créer/modifier plus de 50 informations à la fois');
  });

  it('should throw an error if a key is missing or empty', async () => {
    const infos = [{ cle: '', valeur: 'val1' }];
    await expect(useCase.execute(infos)).rejects.toThrow('Chaque entrée doit avoir une clé (cle) valide');

    const infos2 = [{ cle: '   ', valeur: 'val1' }];
    await expect(useCase.execute(infos2)).rejects.toThrow('Chaque entrée doit avoir une clé (cle) valide');
    
    const infos3 = [{ valeur: 'val1' } as any];
    await expect(useCase.execute(infos3)).rejects.toThrow('Chaque entrée doit avoir une clé (cle) valide');
  });

  it('should throw an error if a value is missing or empty', async () => {
    const infos = [{ cle: 'key1', valeur: '' }];
    await expect(useCase.execute(infos)).rejects.toThrow("La valeur est requise pour la clé 'key1'");

    const infos2 = [{ cle: 'key1', valeur: '   ' }];
    await expect(useCase.execute(infos2)).rejects.toThrow("La valeur est requise pour la clé 'key1'");

    const infos3 = [{ cle: 'key1' } as any];
    await expect(useCase.execute(infos3)).rejects.toThrow("La valeur est requise pour la clé 'key1'");
  });

  it('should bulk upsert successfully', async () => {
    const infos = [
      { cle: 'key1', valeur: 'val1' },
      { cle: 'key2', valeur: 'val2' },
    ];
    mockRepo.bulkUpsert.mockResolvedValue([
      { id_information: 1, cle: 'key1', valeur: 'val1', description: null, created_at: new Date(), updated_at: new Date() },
      { id_information: 2, cle: 'key2', valeur: 'val2', description: null, created_at: new Date(), updated_at: new Date() },
    ]);
    
    const result = await useCase.execute(infos);
    
    expect(mockRepo.bulkUpsert).toHaveBeenCalledWith(infos);
    expect(result).toHaveLength(2);
  });
});
