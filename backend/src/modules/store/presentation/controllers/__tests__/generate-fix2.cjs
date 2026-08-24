const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';

let content = fs.readFileSync(targetFile, 'utf8');

const oldMock1 = `jest.mock('../../../../../shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });`;

const oldMock2 = `jest.mock('@/shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });`;

const oldMock3 = `jest.mock('@/shared/storage/StorageServiceFactory', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}), { virtual: true });`;

const newMock1 = `jest.mock('../../../../../shared/storage/StorageServiceFactory.js', () => {
  const uploadFn = jest.fn();
  const deleteFn = jest.fn();
  return {
    __esModule: true,
    getStorageService: jest.fn().mockReturnValue({
      upload: uploadFn,
      delete: deleteFn
    })
  };
}, { virtual: true });`;

const newMock2 = `jest.mock('@/shared/storage/StorageServiceFactory.js', () => {
  const uploadFn = jest.fn();
  const deleteFn = jest.fn();
  return {
    __esModule: true,
    getStorageService: jest.fn().mockReturnValue({
      upload: uploadFn,
      delete: deleteFn
    })
  };
}, { virtual: true });`;

const newMock3 = `jest.mock('@/shared/storage/StorageServiceFactory', () => {
  const uploadFn = jest.fn();
  const deleteFn = jest.fn();
  return {
    __esModule: true,
    getStorageService: jest.fn().mockReturnValue({
      upload: uploadFn,
      delete: deleteFn
    })
  };
}, { virtual: true });`;

content = content.replace(oldMock1, newMock1).replace(oldMock2, newMock2).replace(oldMock3, newMock3);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Fixed esModule in mocks.');
