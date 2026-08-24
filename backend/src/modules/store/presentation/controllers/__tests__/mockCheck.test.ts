import { getStorageService } from '@/shared/storage/StorageServiceFactory.js';

const mockStorageService = {
  upload: jest.fn(),
  delete: jest.fn()
};
jest.mock('@/shared/storage/StorageServiceFactory.js', () => {
  return {
    __esModule: true,
    getStorageService: () => mockStorageService
  };
});

describe('mock check', () => {
  it('should not be undefined', () => {
    console.log('getStorageService is:', getStorageService.toString());
    const service = getStorageService();
    console.log('service:', service);
  });
});
