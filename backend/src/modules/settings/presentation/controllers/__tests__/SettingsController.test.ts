import { Request, Response } from 'express';
import { SettingsController, settingsController } from '../SettingsController.js';
import { GetInformationsUseCase } from '../../../application/use-cases/GetInformationsUseCase.js';
import { GetInformationByKeyUseCase } from '../../../application/use-cases/GetInformationByKeyUseCase.js';
import { UpsertInformationUseCase } from '../../../application/use-cases/UpsertInformationUseCase.js';
import { BulkUpsertInformationsUseCase } from '../../../application/use-cases/BulkUpsertInformationsUseCase.js';
import { MySQLInformationRepository } from '../../../infrastructure/repositories/MySQLInformationRepository.js';
import type { AuthRequest } from '@/shared/middleware/authMiddleware.js';

jest.mock('../../../infrastructure/repositories/MySQLInformationRepository.js');
jest.mock('../../../application/use-cases/GetInformationsUseCase.js');
jest.mock('../../../application/use-cases/GetInformationByKeyUseCase.js');
jest.mock('../../../application/use-cases/UpsertInformationUseCase.js');
jest.mock('../../../application/use-cases/BulkUpsertInformationsUseCase.js');

describe('SettingsController', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return paginated settings successfully', async () => {
      req.query = { page: '2', limit: '10', search: 'test', cle: 'key', sort_by: 'updated_at', sort_order: 'desc' };
      const mockResult = { data: [], total: 0, page: 2, limit: 10, totalPages: 0 };
      (GetInformationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await settingsController.getSettings(req as AuthRequest, res as Response);

      expect(GetInformationsUseCase.prototype.execute).toHaveBeenCalledWith({
        search: 'test',
        cle: 'key',
        sort_by: 'updated_at',
        sort_order: 'desc',
        page: 2,
        limit: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paramètres récupérés',
        data: mockResult,
      });
    });

    it('should use default values for missing query params', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      (GetInformationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await settingsController.getSettings(req as AuthRequest, res as Response);

      expect(GetInformationsUseCase.prototype.execute).toHaveBeenCalledWith({
        search: undefined,
        cle: undefined,
        sort_by: 'cle',
        sort_order: 'asc',
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paramètres récupérés',
        data: mockResult,
      });
    });

    it('should return 500 on server error', async () => {
      (GetInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Test error'));

      await settingsController.getSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        error: 'INTERNAL_ERROR',
      });
    });

    it('should return 500 with default message on server error without message', async () => {
      (GetInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue({});

      await settingsController.getSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur',
        error: 'INTERNAL_ERROR',
      });
    });
  });

  describe('getSettingByKey', () => {
    it('should return a setting successfully', async () => {
      req.params = { cle: 'testKey' };
      const mockResult = { id_information: 1, cle: 'testKey', valeur: 'testVal' };
      (GetInformationByKeyUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await settingsController.getSettingByKey(req as AuthRequest, res as Response);

      expect(GetInformationByKeyUseCase.prototype.execute).toHaveBeenCalledWith('testKey');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paramètre récupéré',
        data: mockResult,
      });
    });

    it('should return 404 if setting is not found', async () => {
      req.params = { cle: 'testKey' };
      (GetInformationByKeyUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));

      await settingsController.getSettingByKey(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'introuvable',
      });
    });

    it('should return 500 on server error', async () => {
      req.params = { cle: 'testKey' };
      (GetInformationByKeyUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Other error'));

      await settingsController.getSettingByKey(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Other error',
      });
    });
  });

  describe('upsertSetting', () => {
    it('should return 400 if valeur is missing', async () => {
      req.params = { cle: 'testKey' };
      req.body = { description: 'testDesc' };

      await settingsController.upsertSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'La valeur est requise',
      });
    });

    it('should upsert successfully', async () => {
      req.params = { cle: 'testKey' };
      req.body = { valeur: 'testVal', description: 'testDesc' };
      const mockResult = { id_information: 1, cle: 'testKey', valeur: 'testVal', description: 'testDesc' };
      (UpsertInformationUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await settingsController.upsertSetting(req as AuthRequest, res as Response);

      expect(UpsertInformationUseCase.prototype.execute).toHaveBeenCalledWith({
        cle: 'testKey',
        valeur: 'testVal',
        description: 'testDesc',
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paramètre sauvegardé',
        data: mockResult,
      });
    });

    it('should return 400 if use case throws a validation error (requis)', async () => {
      req.params = { cle: 'testKey' };
      req.body = { valeur: 'testVal' };
      (UpsertInformationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('requis'));

      await settingsController.upsertSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'requis',
      });
    });
    
    it('should return 400 if use case throws a validation error (dépasser)', async () => {
      req.params = { cle: 'testKey' };
      req.body = { valeur: 'testVal' };
      (UpsertInformationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('dépasser'));

      await settingsController.upsertSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'dépasser',
      });
    });

    it('should return 500 on server error', async () => {
      req.params = { cle: 'testKey' };
      req.body = { valeur: 'testVal' };
      (UpsertInformationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Other error'));

      await settingsController.upsertSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Other error',
      });
    });
  });

  describe('bulkUpsertSettings', () => {
    it('should return 400 if informations is not an array', async () => {
      req.body = { informations: 'not-an-array' };

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Le champ 'informations' doit être un tableau",
      });
    });

    it('should bulk upsert successfully', async () => {
      req.body = { informations: [{ cle: 'testKey', valeur: 'testVal' }] };
      const mockResult = [{ id_information: 1, cle: 'testKey', valeur: 'testVal' }];
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(BulkUpsertInformationsUseCase.prototype.execute).toHaveBeenCalledWith([{ cle: 'testKey', valeur: 'testVal' }]);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '1 paramètre(s) sauvegardé(s)',
        data: mockResult,
      });
    });

    it('should return 400 if use case throws a validation error (Au moins)', async () => {
      req.body = { informations: [] };
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Au moins'));

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Au moins',
      });
    });
    
    it('should return 400 if use case throws a validation error (plus de)', async () => {
      req.body = { informations: [] };
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('plus de'));

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'plus de',
      });
    });
    
    it('should return 400 if use case throws a validation error (requis)', async () => {
      req.body = { informations: [] };
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('requis'));

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'requis',
      });
    });
    
    it('should return 400 if use case throws a validation error (valide)', async () => {
      req.body = { informations: [] };
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('valide'));

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'valide',
      });
    });

    it('should return 500 on server error', async () => {
      req.body = { informations: [] };
      (BulkUpsertInformationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Other error'));

      await settingsController.bulkUpsertSettings(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Other error',
      });
    });
  });

  describe('deleteSetting', () => {
    it('should return 400 if id is invalid', async () => {
      req.params = { id: 'invalid' };

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID invalide',
      });
    });
    
    it('should return 400 if id is negative', async () => {
      req.params = { id: '-5' };

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'ID invalide',
      });
    });

    it('should return 404 if setting is not found', async () => {
      req.params = { id: '1' };
      (MySQLInformationRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(MySQLInformationRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Paramètre introuvable',
      });
    });

    it('should delete setting successfully', async () => {
      req.params = { id: '1' };
      (MySQLInformationRepository.prototype.findById as jest.Mock).mockResolvedValue({ id_information: 1 });
      (MySQLInformationRepository.prototype.delete as jest.Mock).mockResolvedValue(undefined);

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(MySQLInformationRepository.prototype.findById).toHaveBeenCalledWith(1);
      expect(MySQLInformationRepository.prototype.delete).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Paramètre supprimé',
      });
    });

    it('should return 500 on server error', async () => {
      req.params = { id: '1' };
      (MySQLInformationRepository.prototype.findById as jest.Mock).mockRejectedValue(new Error('Test error'));

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        error: 'INTERNAL_ERROR',
      });
    });

    it('should return 500 with default message on server error without message', async () => {
      req.params = { id: '1' };
      (MySQLInformationRepository.prototype.findById as jest.Mock).mockRejectedValue({});

      await settingsController.deleteSetting(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erreur serveur',
        error: 'INTERNAL_ERROR',
      });
    });
  });
});
