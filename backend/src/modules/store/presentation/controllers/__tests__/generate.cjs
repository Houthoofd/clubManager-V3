const fs = require('fs');

const targetFile = 'c:\\Users\\Oxfam\\Documents\\clubManager-V3\\backend\\src\\modules\\store\\presentation\\controllers\\__tests__\\StoreController.test.ts';
let content = fs.readFileSync(targetFile, 'utf8');

// Replace imports and mocks
const oldImports = `import { Request, Response } from 'express';
import { OrderController } from '../OrderController';
import { StockController } from '../StockController';
import { MySQLOrderRepository } from '../../../infrastructure/repositories/MySQLOrderRepository';
import { MySQLStockRepository } from '../../../infrastructure/repositories/MySQLStockRepository';

// Mock dependencies
jest.mock('../../../infrastructure/repositories/MySQLOrderRepository');
jest.mock('../../../infrastructure/repositories/MySQLStockRepository');`;

const newImports = `import { Request, Response } from 'express';
import { OrderController } from '../OrderController';
import { StockController } from '../StockController';
import { ArticleController } from '../ArticleController';
import { CategoryController } from '../CategoryController';
import { SizeController } from '../SizeController';
import { MySQLOrderRepository } from '../../../infrastructure/repositories/MySQLOrderRepository';
import { MySQLStockRepository } from '../../../infrastructure/repositories/MySQLStockRepository';
import { MySQLArticleRepository } from '../../../infrastructure/repositories/MySQLArticleRepository';
import { MySQLCategoryRepository } from '../../../infrastructure/repositories/MySQLCategoryRepository';
import { MySQLSizeRepository } from '../../../infrastructure/repositories/MySQLSizeRepository';
import { getStorageService } from '@/shared/storage/StorageServiceFactory.js';

// Mock dependencies
jest.mock('../../../infrastructure/repositories/MySQLOrderRepository');
jest.mock('../../../infrastructure/repositories/MySQLStockRepository');
jest.mock('../../../infrastructure/repositories/MySQLArticleRepository');
jest.mock('../../../infrastructure/repositories/MySQLCategoryRepository');
jest.mock('../../../infrastructure/repositories/MySQLSizeRepository');
jest.mock('@/shared/storage/StorageServiceFactory.js', () => ({
  getStorageService: jest.fn().mockReturnValue({
    upload: jest.fn(),
    delete: jest.fn()
  })
}));`;

content = content.replace(oldImports, newImports);

// Append the new describe blocks at the end before the final `});`
const closingBracketIndex = content.lastIndexOf('});');

const additionalTests = `
  describe('CategoryController', () => {
    let controller: CategoryController;
    let mockCategoryRepo: jest.Mocked<MySQLCategoryRepository>;

    beforeEach(() => {
      controller = new CategoryController();
      mockCategoryRepo = MySQLCategoryRepository.prototype as jest.Mocked<MySQLCategoryRepository>;
    });

    describe('getCategories', () => {
      it('should return categories successfully', async () => {
        mockCategoryRepo.findAll.mockResolvedValueOnce([]);
        await controller.getCategories(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Catégories récupérées', data: [] });
      });

      it('should handle errors', async () => {
        mockCategoryRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      
      it('should handle non-Error throw', async () => {
        mockCategoryRepo.findAll.mockRejectedValueOnce('Some error');
        await controller.getCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getCategoryById', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockResolvedValueOnce(null);
        await controller.getCategoryById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return category if found', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.getCategoryById(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 1 } }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getCategoryById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('createCategory', () => {
      it('should return 400 if nom is missing', async () => {
        req.body = {};
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should create successfully', async () => {
        req.body = { nom: 'Cat1', description: 'Desc1', ordre: 1 };
        mockCategoryRepo.create.mockResolvedValueOnce(1);
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1, nom: 'Cat1' } as any);
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(201);
      });

      it('should create with defaults', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockResolvedValueOnce(1);
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1, nom: 'Cat1' } as any);
        await controller.createCategory(req as any, res as Response);
        expect(mockCategoryRepo.create).toHaveBeenCalledWith({ nom: 'Cat1', description: null, ordre: 0 });
      });

      it('should handle errors', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateCategory', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockResolvedValueOnce(null);
        await controller.updateCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should update successfully', async () => {
        req.params = { id: '1' };
        req.body = { nom: 'Cat2', description: 'Desc2', ordre: 2 };
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1, nom: 'Cat2' } as any);
        await controller.updateCategory(req as any, res as Response);
        expect(mockCategoryRepo.update).toHaveBeenCalledWith(1, { nom: 'Cat2', description: 'Desc2', ordre: 2 });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should update with undefined fields', async () => {
        req.params = { id: '1' };
        req.body = { };
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateCategory(req as any, res as Response);
        expect(mockCategoryRepo.update).toHaveBeenCalledWith(1, { nom: undefined, description: undefined, ordre: undefined });
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('deleteCategory', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockResolvedValueOnce(null);
        await controller.deleteCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should delete successfully', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.deleteCategory(req as any, res as Response);
        expect(mockCategoryRepo.delete).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteCategory(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('reorderCategories', () => {
      it('should return 400 if categories is not array', async () => {
        req.body = { categories: null };
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });
      
      it('should return 400 if categories is empty array', async () => {
        req.body = { categories: [] };
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should reorder successfully', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        await controller.reorderCategories(req as any, res as Response);
        expect(mockCategoryRepo.reorder).toHaveBeenCalledWith([{ id: 1, ordre: 2 }]);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        mockCategoryRepo.reorder.mockRejectedValueOnce(new Error('DB Error'));
        await controller.reorderCategories(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('SizeController', () => {
    let controller: SizeController;
    let mockSizeRepo: jest.Mocked<MySQLSizeRepository>;

    beforeEach(() => {
      controller = new SizeController();
      mockSizeRepo = MySQLSizeRepository.prototype as jest.Mocked<MySQLSizeRepository>;
    });

    describe('getSizes', () => {
      it('should return sizes successfully', async () => {
        mockSizeRepo.findAll.mockResolvedValueOnce([]);
        await controller.getSizes(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Tailles récupérées', data: [] });
      });

      it('should handle errors', async () => {
        mockSizeRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizes(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getSizeById', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockResolvedValueOnce(null);
        await controller.getSizeById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return size if found', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.getSizeById(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 1 } }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getSizeById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('createSize', () => {
      it('should return 400 if nom is missing', async () => {
        req.body = {};
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should create successfully', async () => {
        req.body = { nom: 'L', ordre: 1 };
        mockSizeRepo.create.mockResolvedValueOnce(1);
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1, nom: 'L' } as any);
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(201);
      });
      
      it('should create with defaults', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockResolvedValueOnce(1);
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1, nom: 'L' } as any);
        await controller.createSize(req as any, res as Response);
        expect(mockSizeRepo.create).toHaveBeenCalledWith({ nom: 'L', ordre: 0 });
      });

      it('should handle errors', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateSize', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockResolvedValueOnce(null);
        await controller.updateSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should update successfully', async () => {
        req.params = { id: '1' };
        req.body = { nom: 'XL', ordre: 2 };
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1, nom: 'XL' } as any);
        await controller.updateSize(req as any, res as Response);
        expect(mockSizeRepo.update).toHaveBeenCalledWith(1, { nom: 'XL', ordre: 2 });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should update with undefined fields', async () => {
        req.params = { id: '1' };
        req.body = { };
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateSize(req as any, res as Response);
        expect(mockSizeRepo.update).toHaveBeenCalledWith(1, { nom: undefined, ordre: undefined });
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('deleteSize', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockResolvedValueOnce(null);
        await controller.deleteSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should delete successfully', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.deleteSize(req as any, res as Response);
        expect(mockSizeRepo.delete).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteSize(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('ArticleController', () => {
    let controller: ArticleController;
    let mockArticleRepo: jest.Mocked<MySQLArticleRepository>;
    let mockStorageService: any;

    beforeEach(() => {
      controller = new ArticleController();
      mockArticleRepo = MySQLArticleRepository.prototype as jest.Mocked<MySQLArticleRepository>;
      mockStorageService = getStorageService();
      mockStorageService.delete.mockClear();
      mockStorageService.upload.mockClear();
    });

    describe('getArticles', () => {
      it('should return articles with default pagination', async () => {
        mockArticleRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 } as any);
        await controller.getArticles(req as any, res as Response);
        expect(mockArticleRepo.findAll).toHaveBeenCalledWith({
          search: undefined,
          categorie_id: undefined,
          actif: undefined,
          page: 1,
          limit: 20
        });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should handle actif param', async () => {
        req.query = { actif: 'true', categorie_id: '1', page: '2', limit: '10' };
        mockArticleRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 } as any);
        await controller.getArticles(req as any, res as Response);
        expect(mockArticleRepo.findAll).toHaveBeenCalledWith({
          search: undefined,
          categorie_id: 1,
          actif: true,
          page: 2,
          limit: 10
        });
      });
      
      it('should handle actif param = 1', async () => {
        req.query = { actif: '1' };
        mockArticleRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 } as any);
        await controller.getArticles(req as any, res as Response);
        expect(mockArticleRepo.findAll).toHaveBeenCalledWith(expect.objectContaining({
          actif: true,
        }));
      });

      it('should handle errors', async () => {
        mockArticleRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getArticles(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getArticleById', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.getArticleById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return article if found', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.getArticleById(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 1 } }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getArticleById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('createArticle', () => {
      it('should return 400 if nom is missing', async () => {
        req.body = { prix: 10 };
        await controller.createArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });
      
      it('should return 400 if prix is missing', async () => {
        req.body = { nom: 'Art' };
        await controller.createArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });
      
      it('should return 400 if prix is invalid', async () => {
        req.body = { nom: 'Art', prix: -5 };
        await controller.createArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });
      
      it('should return 400 if prix is NaN', async () => {
        req.body = { nom: 'Art', prix: 'abc' };
        await controller.createArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should create successfully', async () => {
        req.body = { nom: 'Art', prix: 10, description: 'Desc', categorie_id: 1, actif: false };
        mockArticleRepo.create.mockResolvedValueOnce(1);
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.createArticle(req as any, res as Response);
        expect(mockArticleRepo.create).toHaveBeenCalledWith({
          nom: 'Art', prix: 10, description: 'Desc', categorie_id: 1, actif: false
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });
      
      it('should create successfully with defaults', async () => {
        req.body = { nom: 'Art', prix: 10 };
        mockArticleRepo.create.mockResolvedValueOnce(1);
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.createArticle(req as any, res as Response);
        expect(mockArticleRepo.create).toHaveBeenCalledWith({
          nom: 'Art', prix: 10, description: null, categorie_id: null, actif: true
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });

      it('should handle errors', async () => {
        req.body = { nom: 'Art', prix: 10 };
        mockArticleRepo.create.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateArticle', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        req.body = { prix: 15 };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.updateArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });
      
      it('should return 400 if prix is invalid', async () => {
        req.params = { id: '1' };
        req.body = { prix: -5 };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });
      
      it('should return 400 if prix is NaN', async () => {
        req.params = { id: '1' };
        req.body = { prix: 'abc' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should update successfully', async () => {
        req.params = { id: '1' };
        req.body = { nom: 'Art2', prix: 20, description: 'Desc2', categorie_id: 2, actif: true };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateArticle(req as any, res as Response);
        expect(mockArticleRepo.update).toHaveBeenCalledWith(1, {
          nom: 'Art2', prix: 20, description: 'Desc2', categorie_id: 2, actif: true
        });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should update correctly with empty string category_id', async () => {
        req.params = { id: '1' };
        req.body = { categorie_id: "" };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateArticle(req as any, res as Response);
        expect(mockArticleRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ categorie_id: null }));
      });

      it('should update correctly without fields provided', async () => {
        req.params = { id: '1' };
        req.body = { };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateArticle(req as any, res as Response);
        expect(mockArticleRepo.update).toHaveBeenCalledWith(1, {
          nom: undefined, prix: undefined, description: undefined, categorie_id: undefined, actif: undefined
        });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('deleteArticle', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.deleteArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should delete successfully and its images', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: '/uploads/articles/uuid.jpg' }] } as any);
        mockStorageService.delete.mockResolvedValueOnce();
        
        await controller.deleteArticle(req as any, res as Response);
        
        expect(mockStorageService.delete).toHaveBeenCalledWith('articles/uuid.jpg');
        expect(mockArticleRepo.delete).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should continue if image extraction key fails', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: 'invalid-url' }] } as any);
        mockStorageService.delete.mockResolvedValueOnce();
        
        await controller.deleteArticle(req as any, res as Response);
        expect(mockArticleRepo.delete).toHaveBeenCalledWith(1);
      });
      
      it('should continue if image deletion fails', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: '/uploads/articles/uuid.jpg' }] } as any);
        mockStorageService.delete.mockRejectedValueOnce(new Error('Storage Error'));
        
        await controller.deleteArticle(req as any, res as Response);
        
        expect(mockArticleRepo.delete).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
    
    describe('toggleArticle', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.toggleArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should toggle successfully', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any).mockResolvedValueOnce({ id: 1, actif: false } as any);
        await controller.toggleArticle(req as any, res as Response);
        expect(mockArticleRepo.toggleActive).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.toggleArticle(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('uploadImage', () => {
      it('should return 404 if article not found', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.uploadImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });
      
      it('should return 400 if file missing', async () => {
        req.params = { id: '1' };
        req.file = undefined;
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.uploadImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should upload successfully', async () => {
        req.params = { id: '1' };
        req.file = { buffer: Buffer.from(''), originalname: 'a.jpg', mimetype: 'image/jpeg', size: 100 } as any;
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [] } as any);
        mockStorageService.upload.mockResolvedValueOnce({ url: 'url' });
        mockArticleRepo.addImage.mockResolvedValueOnce(2);
        mockArticleRepo.getImages.mockResolvedValueOnce([{ id: 2 } as any]);

        await controller.uploadImage(req as any, res as Response);
        
        expect(mockStorageService.upload).toHaveBeenCalled();
        expect(mockArticleRepo.addImage).toHaveBeenCalledWith(1, 'url', 0);
        expect(res.status).toHaveBeenCalledWith(201);
      });
      
      it('should upload with max ordre + 1', async () => {
        req.params = { id: '1' };
        req.file = { buffer: Buffer.from(''), originalname: 'a.jpg', mimetype: 'image/jpeg', size: 100 } as any;
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ ordre: 5 }] } as any);
        mockStorageService.upload.mockResolvedValueOnce({ url: 'url' });
        mockArticleRepo.addImage.mockResolvedValueOnce(2);
        mockArticleRepo.getImages.mockResolvedValueOnce([{ id: 2 } as any]);

        await controller.uploadImage(req as any, res as Response);
        expect(mockArticleRepo.addImage).toHaveBeenCalledWith(1, 'url', 6);
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.uploadImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('deleteImage', () => {
      it('should return 404 if article not found', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce(null);
        await controller.deleteImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 404 if image not found in DB', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce(null);
        await controller.deleteImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should delete successfully', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('https://bucket.s3.region.amazonaws.com/articles/uuid.jpg');
        mockStorageService.delete.mockResolvedValueOnce();

        await controller.deleteImage(req as any, res as Response);
        
        expect(mockStorageService.delete).toHaveBeenCalledWith('articles/uuid.jpg');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should handle local URL extract', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('http://localhost:3000/uploads/articles/uuid.jpg');
        mockStorageService.delete.mockResolvedValueOnce();

        await controller.deleteImage(req as any, res as Response);
        expect(mockStorageService.delete).toHaveBeenCalledWith('articles/uuid.jpg');
      });
      
      it('should continue if storage delete fails', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('/uploads/articles/uuid.jpg');
        mockStorageService.delete.mockRejectedValueOnce(new Error('Storage error'));

        await controller.deleteImage(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should handle unparseable URLs', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('invalid_url');
        
        await controller.deleteImage(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.deleteImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });
`;

content = content.substring(0, closingBracketIndex) + additionalTests + '\n});\n';

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated the file.');
