import { Request, Response } from 'express';

jest.mock('../../../infrastructure/repositories/MySQLRecoveryRepository');

jest.mock('../../../application/use-cases/CreateRecoveryRequestUseCase', () => {
  const execute = jest.fn();
  return {
    CreateRecoveryRequestUseCase: jest.fn().mockImplementation(() => ({ execute })),
    mockCreateExecute: execute
  };
});

jest.mock('../../../application/use-cases/GetRecoveryRequestsUseCase', () => {
  const execute = jest.fn();
  return {
    GetRecoveryRequestsUseCase: jest.fn().mockImplementation(() => ({ execute })),
    mockGetExecute: execute
  };
});

jest.mock('../../../application/use-cases/ProcessRecoveryRequestUseCase', () => {
  const execute = jest.fn();
  return {
    ProcessRecoveryRequestUseCase: jest.fn().mockImplementation(() => ({ execute })),
    mockProcessExecute: execute
  };
});

import { RecoveryController } from '../RecoveryController';
const { mockCreateExecute } = require('../../../application/use-cases/CreateRecoveryRequestUseCase');
const { mockGetExecute } = require('../../../application/use-cases/GetRecoveryRequestsUseCase');
const { mockProcessExecute } = require('../../../application/use-cases/ProcessRecoveryRequestUseCase');

describe('RecoveryController', () => {
  let controller: RecoveryController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    mockCreateExecute.mockClear();
    mockGetExecute.mockClear();
    mockProcessExecute.mockClear();

    // Default successful mocks
    mockCreateExecute.mockResolvedValue(undefined);
    mockGetExecute.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });
    mockProcessExecute.mockResolvedValue(undefined);

    controller = new RecoveryController();

    req = {
      body: {},
      params: {},
      query: {},
      headers: {},
      socket: { remoteAddress: '127.0.0.1' } as any
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('submitRequest', () => {
    it('should submit a recovery request successfully with x-forwarded-for IP', async () => {
      req.body = { email: 'test@example.com', reason: 'Lost my access' };
      req.headers = { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' };
      mockCreateExecute.mockResolvedValue(undefined);

      await controller.submitRequest(req as any, res as any);

      expect(mockCreateExecute).toHaveBeenCalledWith({
        email: 'test@example.com',
        reason: 'Lost my access',
        ip_address: '192.168.1.1'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Demande de récupération soumise' });
    });

    it('should submit a recovery request successfully with socket IP when headers are missing', async () => {
      req.body = { email: 'test@example.com', reason: 'Lost my access' };
      mockCreateExecute.mockResolvedValue(undefined);

      await controller.submitRequest(req as any, res as any);

      expect(mockCreateExecute).toHaveBeenCalledWith({
        email: 'test@example.com',
        reason: 'Lost my access',
        ip_address: '127.0.0.1'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Demande de récupération soumise' });
    });

    it('should use "unknown" if ip cannot be determined', async () => {
      req.body = { email: 'test@example.com', reason: 'Lost my access' };
      req.socket = {} as any;
      mockCreateExecute.mockResolvedValue(undefined);

      await controller.submitRequest(req as any, res as any);

      expect(mockCreateExecute).toHaveBeenCalledWith({
        email: 'test@example.com',
        reason: 'Lost my access',
        ip_address: 'unknown'
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle validation errors (400) for invalide message', async () => {
      req.body = { email: 'invalid', reason: 'Lost my access' };
      mockCreateExecute.mockRejectedValue(new Error('Adresse email invalide'));

      await controller.submitRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Adresse email invalide' });
    });

    it('should handle validation errors (400) for caractères message', async () => {
      req.body = { email: 'test@test.com', reason: 'short' };
      mockCreateExecute.mockRejectedValue(new Error('La raison doit contenir au moins 10 caractères'));

      await controller.submitRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'La raison doit contenir au moins 10 caractères' });
    });

    it('should handle general server errors (500)', async () => {
      req.body = { email: 'test@example.com', reason: 'Lost my access' };
      mockCreateExecute.mockRejectedValue(new Error('DB error'));

      await controller.submitRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
    });
  });

  describe('getRequests', () => {
    it('should get requests with default query parameters', async () => {
      const mockData = { items: [], total: 0, page: 1, limit: 20 };
      mockGetExecute.mockResolvedValue(mockData);

      await controller.getRequests(req as any, res as any);

      expect(mockGetExecute).toHaveBeenCalledWith({
        status: undefined,
        page: 1,
        limit: 20
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demandes de récupération récupérées',
        data: mockData
      });
    });

    it('should get requests with custom query parameters', async () => {
      req.query = { status: 'approved', page: '2', limit: '50' };
      const mockData = { items: [], total: 0, page: 2, limit: 50 };
      mockGetExecute.mockResolvedValue(mockData);

      await controller.getRequests(req as any, res as any);

      expect(mockGetExecute).toHaveBeenCalledWith({
        status: 'approved',
        page: 2,
        limit: 50
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demandes de récupération récupérées',
        data: mockData
      });
    });

    it('should get requests ignoring invalid status parameter', async () => {
      req.query = { status: 'invalid_status' };
      const mockData = { items: [], total: 0, page: 1, limit: 20 };
      mockGetExecute.mockResolvedValue(mockData);

      await controller.getRequests(req as any, res as any);

      expect(mockGetExecute).toHaveBeenCalledWith({
        status: undefined,
        page: 1,
        limit: 20
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demandes de récupération récupérées',
        data: mockData
      });
    });

    it('should handle general errors (500) with error message', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetExecute.mockRejectedValue(new Error('DB fetch error'));

      await controller.getRequests(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'DB fetch error',
        error: 'INTERNAL_ERROR'
      });
      errorSpy.mockRestore();
    });

    it('should handle general errors (500) without error message', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetExecute.mockRejectedValue({}); // Object without message

      await controller.getRequests(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur interne du serveur',
        error: 'INTERNAL_ERROR'
      });
      errorSpy.mockRestore();
    });
  });

  describe('processRequest', () => {
    it('should process request successfully as approved without admin note', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      mockProcessExecute.mockResolvedValue(undefined);

      await controller.processRequest(req as any, res as any);

      expect(mockProcessExecute).toHaveBeenCalledWith({
        id: 1,
        status: 'approved',
        admin_note: undefined
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demande approuvée avec succès'
      });
    });

    it('should process request successfully as rejected with admin note', async () => {
      req.params = { id: '1' };
      req.body = { status: 'rejected', admin_note: 'Not valid' };
      mockProcessExecute.mockResolvedValue(undefined);

      await controller.processRequest(req as any, res as any);

      expect(mockProcessExecute).toHaveBeenCalledWith({
        id: 1,
        status: 'rejected',
        admin_note: 'Not valid'
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demande rejetée — Not valid'
      });
    });

    it('should process request successfully as approved with admin note', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved', admin_note: 'Valid user' };
      mockProcessExecute.mockResolvedValue(undefined);

      await controller.processRequest(req as any, res as any);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Demande approuvée — Valid user'
      });
    });

    it('should return 400 if id is missing or invalid', async () => {
      req.params = { id: 'not_a_number' };

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Identifiant de demande invalide'
      });
      
      req.params = { id: '-1' };
      await controller.processRequest(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if status is invalid', async () => {
      req.params = { id: '1' };
      req.body = { status: 'pending' }; // Invalid status to update

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Le statut doit être \'approved\' ou \'rejected\''
      });
    });

    it('should handle request not found (404)', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockProcessExecute.mockRejectedValue(new Error('Demande introuvable'));

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Demande introuvable'
      });
      errorSpy.mockRestore();
    });

    it('should handle request already processed (409)', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockProcessExecute.mockRejectedValue(new Error('Cette demande a déjà été traitée'));

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cette demande a déjà été traitée'
      });
      errorSpy.mockRestore();
    });

    it('should handle general server error (500) with message', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockProcessExecute.mockRejectedValue(new Error('Unknown DB error'));

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unknown DB error',
        error: 'INTERNAL_ERROR'
      });
      errorSpy.mockRestore();
    });

    it('should handle general server error (500) without message', async () => {
      req.params = { id: '1' };
      req.body = { status: 'approved' };
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockProcessExecute.mockRejectedValue({});

      await controller.processRequest(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur interne du serveur',
        error: 'INTERNAL_ERROR'
      });
      errorSpy.mockRestore();
    });
  });
});
