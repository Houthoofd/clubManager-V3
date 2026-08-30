/**
 * BulkUpdatePresenceUseCase.test.ts
 * Tests unitaires — courses / BulkUpdatePresenceUseCase
 */

import { BulkUpdatePresenceUseCase } from '../BulkUpdatePresenceUseCase';
import type { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import type { BulkUpdatePresenceDto } from "@clubmanager/types";

const mockRepo = {
  bulkUpdatePresence: jest.fn(),
} as unknown as jest.Mocked<ICourseRepository>;

let useCase: BulkUpdatePresenceUseCase;

beforeEach(() => {
  useCase = new BulkUpdatePresenceUseCase(mockRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('BulkUpdatePresenceUseCase', () => {
  describe('execute', () => {
    it('devrait appeler la mise à jour en masse avec succès', async () => {
      mockRepo.bulkUpdatePresence.mockResolvedValue();
      const dto: BulkUpdatePresenceDto = [{ inscription_id: 1, status_id: 2 }];

      await useCase.execute(dto);

      expect(mockRepo.bulkUpdatePresence).toHaveBeenCalledWith(dto);
    });

    it('devrait relayer l\'erreur si le repository échoue', async () => {
      mockRepo.bulkUpdatePresence.mockRejectedValue(new Error('DB error'));
      const dto: BulkUpdatePresenceDto = [{ inscription_id: 1, status_id: 2 }];

      await expect(useCase.execute(dto)).rejects.toThrow('DB error');
    });
  });
});
