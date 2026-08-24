const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';

// We will mock the entire ArticleController's dependencies properly
// Actually, it's easier to mock the StorageServiceFactory without the alias, or using the relative path.
// But we can just use the jest.mock with the exact same string as in the import.
let content = fs.readFileSync(targetFile, 'utf8');

// replace the jest mock for storage service
const oldMock = `jest.mock('@/shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}));`;

const newMock = `jest.mock('../../../../../shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });
jest.mock('@/shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });
jest.mock('@/shared/storage/StorageServiceFactory', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });`;

content = content.replace(oldMock, newMock);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed mocks.');
