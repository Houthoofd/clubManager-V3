const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Remove all existing StorageServiceFactory mocks
content = content.replace(/jest\.mock\(['"][^'"]*StorageServiceFactory[^'"]*['"],[\s\S]*?\{ virtual: true \}\);\n/g, '');

// Insert the proper mock
const properMock = `
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
`;

const insertionPoint = "jest.mock('../../../infrastructure/repositories/MySQLSizeRepository');";
content = content.replace(insertionPoint, insertionPoint + properMock);

// Now inside the ArticleController describe block, we need to adapt mockStorageService
// It was declared as `let mockStorageService: any;` and in beforeEach: `mockStorageService = getStorageService();`
// We can just keep it as is, because getStorageService() will return the mockStorageService object.

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Applied plain function mock.');
