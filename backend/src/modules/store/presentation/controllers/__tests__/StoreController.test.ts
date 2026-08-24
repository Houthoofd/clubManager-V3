import { Request, Response } from 'express';
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



describe('Store Controllers', () => {
  let req: Partial<any>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('OrderController', () => {
    let controller: OrderController;
    let mockOrderRepo: jest.Mocked<MySQLOrderRepository>;
    let mockStockRepo: jest.Mocked<MySQLStockRepository>;

    beforeEach(() => {
      controller = new OrderController();
      mockOrderRepo = MySQLOrderRepository.prototype as jest.Mocked<MySQLOrderRepository>;
      mockStockRepo = MySQLStockRepository.prototype as jest.Mocked<MySQLStockRepository>;
    });

    describe('getOrders', () => {
      it('should retrieve orders with default pagination', async () => {
        mockOrderRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 } as any);
        await controller.getOrders(req as any, res as Response);
        expect(mockOrderRepo.findAll).toHaveBeenCalledWith({ user_id: undefined, statut: undefined, page: 1, limit: 20 });
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Commandes récupérées', data: { data: [], total: 0 } });
      });

      it('should retrieve orders with query params', async () => {
        req.query = { user_id: '1', statut: 'payee', page: '2', limit: '10' };
        mockOrderRepo.findAll.mockResolvedValueOnce({ data: [], total: 0 } as any);
        await controller.getOrders(req as any, res as Response);
        expect(mockOrderRepo.findAll).toHaveBeenCalledWith({ user_id: 1, statut: 'payee', page: 2, limit: 10 });
      });

      it('should handle errors', async () => {
        mockOrderRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getOrders(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB Error' });
      });
      
      it('should handle non-Error throw', async () => {
        mockOrderRepo.findAll.mockRejectedValueOnce('Some string error');
        await controller.getOrders(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne' });
      });
    });

    describe('getMyOrders', () => {
      it('should return 401 if unauthenticated', async () => {
        await controller.getMyOrders(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return user orders', async () => {
        req.user = { userId: 123 };
        mockOrderRepo.findByUserId.mockResolvedValueOnce([]);
        await controller.getMyOrders(req as any, res as Response);
        expect(mockOrderRepo.findByUserId).toHaveBeenCalledWith(123);
        expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Mes commandes récupérées', data: [] });
      });

      it('should handle errors', async () => {
        req.user = { userId: 123 };
        mockOrderRepo.findByUserId.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getMyOrders(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.user = { userId: 123 };
        mockOrderRepo.findByUserId.mockRejectedValueOnce('DB Error');
        await controller.getMyOrders(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getOrderById', () => {
      it('should return 404 if not found', async () => {
        req.params = { id: '99' };
        mockOrderRepo.findById.mockResolvedValueOnce(null);
        await controller.getOrderById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return order if found', async () => {
        req.params = { id: '1' };
        const order = { id: 1 } as any;
        mockOrderRepo.findById.mockResolvedValueOnce(order);
        await controller.getOrderById(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: order }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getOrderById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.getOrderById(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('createOrder', () => {
      it('should return 401 if unauthenticated', async () => {
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return 400 if items is missing or empty', async () => {
        req.user = { userId: 1 };
        req.body = { items: [] };
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'La commande doit contenir au moins un article' }));
      });

      it('should return 400 if item fields are missing', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1 }] }; // Missing fields
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Chaque item doit contenir article_id, taille_id, quantite et prix' }));
      });

      it('should return 400 if item quantite <= 0', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: -1, prix: 10 }] };
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'La quantité doit être supérieure à 0' }));
      });

      it('should return 400 if item prix < 0', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: -5 }] };
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Le prix doit être positif' }));
      });

      it('should return 400 if stock is not found', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce(null);
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Stock introuvable pour l'article 1" }));
      });

      it('should return 400 if stock is insufficient', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 5, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce({ quantite: 2, article_nom: 'Test', taille_nom: 'M' } as any);
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should create order successfully', async () => {
        req.user = { userId: 1 };
        req.headers['x-forwarded-for'] = '192.168.1.1';
        req.headers['user-agent'] = 'jest';
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce({ quantite: 10 } as any);
        mockOrderRepo.create.mockResolvedValueOnce(99);
        mockStockRepo.decreaseForOrder.mockResolvedValueOnce();
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 99 } as any);

        await controller.createOrder(req as any, res as Response);
        
        expect(mockOrderRepo.create).toHaveBeenCalled();
        expect(mockStockRepo.decreaseForOrder).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
      });
      
      it('should fallback on missing names in stock insufficient message', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 5, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce({ quantite: 2 } as any);
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should fallback to remote address if x-forwarded-for is absent', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        req.headers = {};
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce({ quantite: 10 } as any);
        mockOrderRepo.create.mockResolvedValueOnce(99);
        
        await controller.createOrder(req as any, res as Response);
        expect(mockOrderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ ip_address: '127.0.0.1', user_agent: null }));
      });

      it('should fallback to null if both x-forwarded-for and remoteAddress are absent', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        req.headers = {};
        req.socket = {};
        mockStockRepo.findByArticleAndSize.mockResolvedValueOnce({ quantite: 10 } as any);
        mockOrderRepo.create.mockResolvedValueOnce(99);
        
        await controller.createOrder(req as any, res as Response);
        expect(mockOrderRepo.create).toHaveBeenCalledWith(expect.objectContaining({ ip_address: null, user_agent: null }));
      });

      it('should handle errors', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockRejectedValueOnce(new Error('DB Error'));
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
      
      it('should handle non-Error throws', async () => {
        req.user = { userId: 1 };
        req.body = { items: [{ article_id: 1, taille_id: 1, quantite: 1, prix: 10 }] };
        mockStockRepo.findByArticleAndSize.mockRejectedValueOnce('String error');
        await controller.createOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateOrderStatus', () => {
      it('should return 404 if order not found', async () => {
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce(null);
        await controller.updateOrderStatus(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 400 for invalid status', async () => {
        req.params = { id: '1' };
        req.body = { statut: 'invalid' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateOrderStatus(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should update status successfully', async () => {
        req.params = { id: '1' };
        req.body = { statut: 'payee' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1 } as any)
                              .mockResolvedValueOnce({ id: 1, statut: 'payee' } as any);
        await controller.updateOrderStatus(req as any, res as Response);
        expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith(1, 'payee');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateOrderStatus(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.updateOrderStatus(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('cancelOrder', () => {
      it('should return 401 if unauthenticated', async () => {
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return 404 if order not found', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce(null);
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 403 if unauthorized', async () => {
        req.user = { userId: 2, role_app: 'user' };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1, user_id: 1 } as any);
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(403);
      });

      it('should allow admin to cancel any order', async () => {
        req.user = { userId: 2, role_app: 'admin' };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1, user_id: 1, statut: 'en_attente' } as any)
                              .mockResolvedValueOnce({ id: 1, statut: 'annulee' } as any);
        await controller.cancelOrder(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should return 400 if order is not pending or paid', async () => {
        req.user = { userId: 1, role_app: 'user' };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1, user_id: 1, statut: 'expediee' } as any);
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should cancel order successfully', async () => {
        req.user = { userId: 1, role_app: 'user' };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockResolvedValueOnce({ id: 1, user_id: 1, statut: 'payee' } as any)
                              .mockResolvedValueOnce({ id: 1, statut: 'annulee' } as any);
        await controller.cancelOrder(req as any, res as Response);
        expect(mockOrderRepo.updateStatus).toHaveBeenCalledWith(1, 'annulee');
        expect(mockStockRepo.restoreForCancellation).toHaveBeenCalledWith(1, 1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockOrderRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.cancelOrder(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

  describe('StockController', () => {
    let controller: StockController;
    let mockStockRepo: jest.Mocked<MySQLStockRepository>;

    beforeEach(() => {
      controller = new StockController();
      mockStockRepo = MySQLStockRepository.prototype as jest.Mocked<MySQLStockRepository>;
    });

    describe('getStocks', () => {
      it('should return stocks with or without article_id', async () => {
        mockStockRepo.findAll.mockResolvedValueOnce([]);
        await controller.getStocks(req as any, res as Response);
        expect(mockStockRepo.findAll).toHaveBeenCalledWith(undefined);

        req.query = { article_id: '5' };
        mockStockRepo.findAll.mockResolvedValueOnce([]);
        await controller.getStocks(req as any, res as Response);
        expect(mockStockRepo.findAll).toHaveBeenCalledWith(5);
      });

      it('should handle errors', async () => {
        mockStockRepo.findAll.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        mockStockRepo.findAll.mockRejectedValueOnce('DB Error');
        await controller.getStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getLowStocks', () => {
      it('should return low stocks', async () => {
        mockStockRepo.findLowStock.mockResolvedValueOnce([]);
        await controller.getLowStocks(req as any, res as Response);
        expect(mockStockRepo.findLowStock).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        mockStockRepo.findLowStock.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getLowStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        mockStockRepo.findLowStock.mockRejectedValueOnce('DB Error');
        await controller.getLowStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getArticleStocks', () => {
      it('should return article stocks', async () => {
        req.params = { articleId: '1' };
        mockStockRepo.findByArticleId.mockResolvedValueOnce([]);
        await controller.getArticleStocks(req as any, res as Response);
        expect(mockStockRepo.findByArticleId).toHaveBeenCalledWith(1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should handle errors', async () => {
        req.params = { articleId: '1' };
        mockStockRepo.findByArticleId.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getArticleStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.params = { articleId: '1' };
        mockStockRepo.findByArticleId.mockRejectedValueOnce('DB Error');
        await controller.getArticleStocks(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('updateStock', () => {
      it('should return 404 if stock not found', async () => {
        req.params = { id: '1' };
        mockStockRepo.findById.mockResolvedValueOnce(null);
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 400 for invalid quantite', async () => {
        req.params = { id: '1' };
        req.body = { quantite: -5 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);

        req.body = { quantite: 'invalid' };
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 for invalid quantite_minimum', async () => {
        req.params = { id: '1' };
        req.body = { quantite_minimum: -1 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should update stock successfully', async () => {
        req.params = { id: '1' };
        req.body = { quantite: 10, quantite_minimum: 5 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any)
                              .mockResolvedValueOnce({ id: 1, quantite: 10 } as any);
        await controller.updateStock(req as any, res as Response);
        expect(mockStockRepo.update).toHaveBeenCalledWith(1, { quantite: 10, quantite_minimum: 5 });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should update without passing properties if not given', async () => {
        req.params = { id: '1' };
        req.body = {};
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any)
                              .mockResolvedValueOnce({ id: 1, quantite: 10 } as any);
        await controller.updateStock(req as any, res as Response);
        expect(mockStockRepo.update).toHaveBeenCalledWith(1, { quantite: undefined, quantite_minimum: undefined });
      });

      it('should handle errors', async () => {
        req.params = { id: '1' };
        mockStockRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockStockRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.updateStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('adjustStock', () => {
      it('should return 401 if unauthenticated', async () => {
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should return 404 if stock not found', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockStockRepo.findById.mockResolvedValueOnce(null);
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(404);
      });

      it('should return 400 if quantite is missing or invalid', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        
        req.body = {};
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);

        req.body = { quantite: 0 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        
        req.body = { quantite: 'invalid' };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should return 400 if adjustment leads to negative stock', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        req.body = { quantite: -10 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1, quantite: 5 } as any);
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
      });

      it('should adjust stock successfully with default motif', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        req.body = { quantite: 10 };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1, quantite: 5 } as any)
                              .mockResolvedValueOnce({ id: 1, quantite: 15 } as any);
        await controller.adjustStock(req as any, res as Response);
        expect(mockStockRepo.adjustQuantity).toHaveBeenCalledWith(1, 10, 'Ajustement manuel', 1);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      
      it('should adjust stock successfully with given motif', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        req.body = { quantite: 10, motif: 'Delivery' };
        mockStockRepo.findById.mockResolvedValueOnce({ id: 1, quantite: 5 } as any)
                              .mockResolvedValueOnce({ id: 1, quantite: 15 } as any);
        await controller.adjustStock(req as any, res as Response);
        expect(mockStockRepo.adjustQuantity).toHaveBeenCalledWith(1, 10, 'Delivery', 1);
      });

      it('should handle errors', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockStockRepo.findById.mockRejectedValueOnce(new Error('DB Error'));
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        req.user = { userId: 1 };
        req.params = { id: '1' };
        mockStockRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.adjustStock(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });

    describe('getMovements', () => {
      it('should return movements with default pagination', async () => {
        mockStockRepo.findMovements.mockResolvedValueOnce({ movements: [], total: 0 });
        await controller.getMovements(req as any, res as Response);
        expect(mockStockRepo.findMovements).toHaveBeenCalledWith({ article_id: undefined, type_mouvement: undefined, limit: 50, offset: 0 });
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });

      it('should respect query parameters', async () => {
        req.query = { article_id: '2', type_mouvement: 'IN', limit: '10', page: '3' };
        mockStockRepo.findMovements.mockResolvedValueOnce({ movements: [], total: 0 });
        await controller.getMovements(req as any, res as Response);
        expect(mockStockRepo.findMovements).toHaveBeenCalledWith({ article_id: 2, type_mouvement: 'IN', limit: 10, offset: 20 });
      });

      it('should handle errors', async () => {
        mockStockRepo.findMovements.mockRejectedValueOnce(new Error('DB Error'));
        await controller.getMovements(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });

      it('should handle non-Error throws', async () => {
        mockStockRepo.findMovements.mockRejectedValueOnce('DB Error');
        await controller.getMovements(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.body = { nom: 'Cat1' };
        mockCategoryRepo.create.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockCategoryRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.body = { categories: [{ id: 1, ordre: 2 }] };
        mockCategoryRepo.reorder.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        mockSizeRepo.findAll.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.body = { nom: 'L' };
        mockSizeRepo.create.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throw', async () => {
        req.params = { id: '1' };
        mockSizeRepo.findById.mockRejectedValueOnce('Some error');
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
      it('should handle non-Error throws', async () => {
        mockArticleRepo.findAll.mockRejectedValueOnce('DB Error');
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
      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
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
      it('should handle non-Error throws', async () => {
        req.body = { nom: 'Art', prix: 10 };
        mockArticleRepo.create.mockRejectedValueOnce('DB Error');
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
      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
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
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: 'http://localhost:3000/uploads/articles/uuid.jpg' }] } as any);
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
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1, images: [{ url: 'http://localhost:3000/uploads/articles/uuid.jpg' }] } as any);
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
      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
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
      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
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
      it('should handle non-Error throws', async () => {
        req.params = { id: '1' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
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
      
      it('should handle non-error throw in storage delete', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('http://localhost:3000/uploads/articles/uuid.jpg');
        mockStorageService.delete.mockRejectedValueOnce('Non-error string');

        await controller.deleteImage(req as any, res as Response);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      });
      it('should hit fallback return pathname in URL extraction', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockResolvedValueOnce({ id: 1 } as any);
        mockArticleRepo.deleteImage.mockResolvedValueOnce('mailto:test@example.com');
        mockStorageService.delete.mockResolvedValueOnce(undefined);
        await controller.deleteImage(req as any, res as Response);
        expect(mockStorageService.delete).toHaveBeenCalledWith('test@example.com');
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
      it('should handle non-Error throws', async () => {
        req.params = { articleId: '1', imageId: '2' };
        mockArticleRepo.findById.mockRejectedValueOnce('DB Error');
        await controller.deleteImage(req as any, res as Response);
        expect(res.status).toHaveBeenCalledWith(500);
      });
    });
  });

});
