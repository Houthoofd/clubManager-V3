import type { Response } from 'express';
import type { AuthRequest } from '@/shared/middleware/authMiddleware.js';
import { AlertController } from '../AlertController';
import { GetAlertTypesUseCase } from '../../../application/use-cases/GetAlertTypesUseCase';
import { CreateAlertTypeUseCase } from '../../../application/use-cases/CreateAlertTypeUseCase';
import { UpdateAlertTypeUseCase } from '../../../application/use-cases/UpdateAlertTypeUseCase';
import { DeleteAlertTypeUseCase } from '../../../application/use-cases/DeleteAlertTypeUseCase';
import { GetUserAlertsUseCase } from '../../../application/use-cases/GetUserAlertsUseCase';
import { CreateUserAlertUseCase } from '../../../application/use-cases/CreateUserAlertUseCase';
import { ResolveAlertUseCase } from '../../../application/use-cases/ResolveAlertUseCase';
import { IgnoreAlertUseCase } from '../../../application/use-cases/IgnoreAlertUseCase';
import { GetAdminAlertsUseCase } from '../../../application/use-cases/GetAdminAlertsUseCase';
import { AddAlertActionUseCase } from '../../../application/use-cases/AddAlertActionUseCase';
import { GetAlertActionsUseCase } from '../../../application/use-cases/GetAlertActionsUseCase';

jest.mock('../../../application/use-cases/GetAlertTypesUseCase');
jest.mock('../../../application/use-cases/CreateAlertTypeUseCase');
jest.mock('../../../application/use-cases/UpdateAlertTypeUseCase');
jest.mock('../../../application/use-cases/DeleteAlertTypeUseCase');
jest.mock('../../../application/use-cases/GetUserAlertsUseCase');
jest.mock('../../../application/use-cases/CreateUserAlertUseCase');
jest.mock('../../../application/use-cases/ResolveAlertUseCase');
jest.mock('../../../application/use-cases/IgnoreAlertUseCase');
jest.mock('../../../application/use-cases/GetAdminAlertsUseCase');
jest.mock('../../../application/use-cases/AddAlertActionUseCase');
jest.mock('../../../application/use-cases/GetAlertActionsUseCase');

describe('AlertController', () => {
  let controller: AlertController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new AlertController();
    req = { query: {}, params: {}, body: {}, user: { userId: 1 } } as any;
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  const mockError = new Error('Database Error');
  
  describe('getAlertTypes', () => {
    it('devrait retourner la liste des types d\'alertes', async () => {
      req.query = { activeOnly: 'true' };
      (GetAlertTypesUseCase.prototype.execute as jest.Mock).mockResolvedValue([{ id: 1 }]);
      await controller.getAlertTypes(req as AuthRequest, res as Response);
      expect(GetAlertTypesUseCase.prototype.execute).toHaveBeenCalledWith(true);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Types d'alertes récupérés", data: [{ id: 1 }] });
    });

    it('devrait retourner 500 si erreur interne', async () => {
      (GetAlertTypesUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.getAlertTypes(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Database Error' });
    });

    it('devrait retourner 500 avec string par défaut', async () => {
      (GetAlertTypesUseCase.prototype.execute as jest.Mock).mockRejectedValue('Erreur');
      await controller.getAlertTypes(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne du serveur' });
    });
  });

  describe('createAlertType', () => {
    it('devrait créer un type d\'alerte', async () => {
      req.body = { code: 'A1', nom: 'Alerte 1', description: 'desc', priorite: 'haute', actif: true };
      (CreateAlertTypeUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.createAlertType(req as AuthRequest, res as Response);
      expect(CreateAlertTypeUseCase.prototype.execute).toHaveBeenCalledWith({
        code: 'A1', nom: 'Alerte 1', description: 'desc', priorite: 'haute', actif: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type d'alerte créé", data: { id: 1 } });
    });

    it('devrait retourner 400 si champs manquants', async () => {
      req.body = { code: 'A1' }; // nom manquant
      await controller.createAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'code et nom sont requis (chaînes)' });
    });

    it('devrait retourner 400 si erreur de validation', async () => {
      req.body = { code: 'A1', nom: 'Alerte' };
      (CreateAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('priorité invalide'));
      await controller.createAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'priorité invalide' });
    });

    it('devrait retourner 500 si erreur serveur', async () => {
      req.body = { code: 'A1', nom: 'Alerte' };
      (CreateAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.createAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Database Error' });
    });
  });

  describe('updateAlertType', () => {
    it('devrait modifier un type', async () => {
      req.params = { id: '1' };
      req.body = { nom: 'Modif', description: 'desc', priorite: 'basse', actif: false };
      (UpdateAlertTypeUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.updateAlertType(req as AuthRequest, res as Response);
      expect(UpdateAlertTypeUseCase.prototype.execute).toHaveBeenCalledWith(1, {
        nom: 'Modif', description: 'desc', priorite: 'basse', actif: false
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type d'alerte mis à jour", data: { id: 1 } });
    });

    it('devrait retourner 400 si ID invalide', async () => {
      req.params = { id: 'abc' };
      await controller.updateAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      req.body = {};
      (UpdateAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.updateAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si validation échoue', async () => {
      req.params = { id: '1' };
      req.body = {};
      (UpdateAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('nom vide'));
      await controller.updateAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 sinon', async () => {
      req.params = { id: '1' };
      req.body = {};
      (UpdateAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.updateAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteAlertType', () => {
    it('devrait supprimer un type', async () => {
      req.params = { id: '1' };
      (DeleteAlertTypeUseCase.prototype.execute as jest.Mock).mockResolvedValue(true);
      await controller.deleteAlertType(req as AuthRequest, res as Response);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Type d'alerte supprimé" });
    });

    it('devrait retourner 400 si ID invalide', async () => {
      req.params = { id: '0' };
      await controller.deleteAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      (DeleteAlertTypeUseCase.prototype.execute as jest.Mock).mockResolvedValue(false);
      await controller.deleteAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      req.params = { id: '1' };
      (DeleteAlertTypeUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.deleteAlertType(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAdminAlerts', () => {
    it('devrait retourner toutes les alertes avec filtres', async () => {
      req.query = { statut: 'active', priorite: 'haute', userId: '2' };
      (GetAdminAlertsUseCase.prototype.execute as jest.Mock).mockResolvedValue([]);
      await controller.getAdminAlerts(req as AuthRequest, res as Response);
      expect(GetAdminAlertsUseCase.prototype.execute).toHaveBeenCalledWith({ statut: 'active', priorite: 'haute', userId: 2 });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Alertes récupérées', data: [] });
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      (GetAdminAlertsUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.getAdminAlerts(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createUserAlert', () => {
    it('devrait créer une alerte', async () => {
      req.body = { user_id: 1, alerte_type_id: 2, donnees_contexte: { k: 'v' }, notes: 'notes' };
      (CreateUserAlertUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 400 si user_id est invalide', async () => {
      req.body = { alerte_type_id: 2 };
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 400 si alerte_type_id est invalide', async () => {
      req.body = { user_id: 1 };
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait gérer donnees_contexte correctement quand non object', async () => {
      req.body = { user_id: 1, alerte_type_id: 2, donnees_contexte: [] };
      (CreateUserAlertUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(CreateUserAlertUseCase.prototype.execute).toHaveBeenCalledWith(expect.objectContaining({ donnees_contexte: undefined }));
    });

    it('devrait retourner 400 pour erreur de use case avec requis', async () => {
      req.body = { user_id: 1, alerte_type_id: 2 };
      (CreateUserAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('requis'));
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 sinon', async () => {
      req.body = { user_id: 1, alerte_type_id: 2 };
      (CreateUserAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.createUserAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resolveAlert', () => {
    it('devrait résoudre l\'alerte', async () => {
      req.params = { id: '1' };
      req.body = { notes: 'ok' };
      (ResolveAlertUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.resolveAlert(req as AuthRequest, res as Response);
      expect(ResolveAlertUseCase.prototype.execute).toHaveBeenCalledWith(1, 1, 'ok');
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Alerte résolue', data: { id: 1 } });
    });

    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: '0' };
      await controller.resolveAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      (ResolveAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.resolveAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si invalide', async () => {
      req.params = { id: '1' };
      (ResolveAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('invalide'));
      await controller.resolveAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 pour autre erreur', async () => {
      req.params = { id: '1' };
      (ResolveAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.resolveAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('ignoreAlert', () => {
    it('devrait ignorer l\'alerte', async () => {
      req.params = { id: '1' };
      (IgnoreAlertUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.ignoreAlert(req as AuthRequest, res as Response);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Alerte ignorée', data: { id: 1 } });
    });

    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: '0' };
      await controller.ignoreAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      (IgnoreAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.ignoreAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si invalide', async () => {
      req.params = { id: '1' };
      (IgnoreAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('invalide'));
      await controller.ignoreAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 sinon', async () => {
      req.params = { id: '1' };
      (IgnoreAlertUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.ignoreAlert(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAlertActions', () => {
    it('devrait retourner les actions', async () => {
      req.params = { id: '1' };
      (GetAlertActionsUseCase.prototype.execute as jest.Mock).mockResolvedValue([]);
      await controller.getAlertActions(req as AuthRequest, res as Response);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
    });

    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: 'a' };
      await controller.getAlertActions(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      req.params = { id: '1' };
      (GetAlertActionsUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.getAlertActions(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addAlertAction', () => {
    it('devrait ajouter une action', async () => {
      req.params = { id: '1' };
      req.body = { action_type: 'autre', description: 'desc' };
      (AddAlertActionUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 1 });
      await controller.addAlertAction(req as AuthRequest, res as Response);
      expect(AddAlertActionUseCase.prototype.execute).toHaveBeenCalledWith({
        alerte_user_id: 1, user_id: 1, action_type: 'autre', description: 'desc'
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 400 si id invalide', async () => {
      req.params = { id: 'a' };
      await controller.addAlertAction(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 400 si action_type invalide/manquant', async () => {
      req.params = { id: '1' };
      req.body = {};
      await controller.addAlertAction(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 400 en cas d\'erreur invalide ou requis', async () => {
      req.params = { id: '1' };
      req.body = { action_type: 'autre' };
      (AddAlertActionUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('invalide'));
      await controller.addAlertAction(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 sinon', async () => {
      req.params = { id: '1' };
      req.body = { action_type: 'autre' };
      (AddAlertActionUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.addAlertAction(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMyAlerts', () => {
    it('devrait retourner mes alertes', async () => {
      req.query = { statut: 'active' };
      (GetUserAlertsUseCase.prototype.execute as jest.Mock).mockResolvedValue([]);
      await controller.getMyAlerts(req as AuthRequest, res as Response);
      expect(GetUserAlertsUseCase.prototype.execute).toHaveBeenCalledWith(1, 'active');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
    });

    it('devrait retourner 500 en cas d\'erreur', async () => {
      (GetUserAlertsUseCase.prototype.execute as jest.Mock).mockRejectedValue(mockError);
      await controller.getMyAlerts(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
