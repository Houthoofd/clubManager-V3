const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Find the previous fix and replace it
const oldMock = `const mockStorageService = {
  upload: jest.fn(),
  delete: jest.fn()
};
jest.mock('@/shared/storage/StorageServiceFactory.js', () => {
  return {
    __esModule: true,
    getStorageService: () => mockStorageService
  };
});`;

const newMock = `
jest.mock('@/shared/storage/StorageServiceFactory.js', () => {
  const singleton = {
    upload: jest.fn(),
    delete: jest.fn()
  };
  return {
    __esModule: true,
    getStorageService: () => singleton
  };
});
`;

content = content.replace(oldMock, newMock);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Applied singleton mock inside factory.');
