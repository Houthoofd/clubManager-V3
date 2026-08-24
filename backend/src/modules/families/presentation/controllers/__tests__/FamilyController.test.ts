/**
 * FamilyController.test.ts
 * Tests unitaires — families / FamilyController
 */

import { Request, Response, NextFunction } from 'express';
import { FamilyController } from '../FamilyController';
import { IFamilyRepository } from '../../../domain/repositories/IFamilyRepository';

describe('FamilyController', () => {
  let controller: FamilyController;
  let mockRepo: jest.Mocked<IFamilyRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockRepo = {
      createFamille: jest.fn(),
      findFamilleByUserId: jest.fn(),
      addMembre: jest.fn(),
      getMembresByFamilleId: jest.fn(),
      removeMembre: jest.fn(),
      isMembre: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      adminAddMembre: jest.fn(),
      createChildUser: jest.fn(),
    } as jest.Mocked<IFamilyRepository>;

    controller = new FamilyController(mockRepo);

    req = {
      body: {},
      params: {},
      query: {},
      user: { userId: 1 } as any
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();
    
    jest.clearAllMocks();
  });

  // addMember
  describe('addMember', () => {
    it('devrait retourner 201 avec succès', async () => {
      req.body = { first_name: 'John', last_name: 'Doe', date_of_birth: '2010-01-01', genre_id: 1, role: 'enfant' };
      const mockExecute = jest.spyOn(controller['addFamilyMemberUseCase'], 'execute').mockResolvedValue({ success: true, message: 'Success', data: { famille_id: 1, membre: { id: 1 } as any } });

      await controller.addMember(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith(req.body, 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Success', data: { famille_id: 1, membre: { id: 1 } } });
    });

    it('devrait appeler next si une erreur survient', async () => {
      const error = new Error('Test error');
      jest.spyOn(controller['addFamilyMemberUseCase'], 'execute').mockRejectedValue(error);

      await controller.addMember(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getMyFamily
  describe('getMyFamily', () => {
    it('devrait retourner 200 avec les données', async () => {
      const mockExecute = jest.spyOn(controller['getMyFamilyUseCase'], 'execute').mockResolvedValue({ success: true, message: 'Success', data: { famille_id: 10, nom: null, membres: [] } });

      await controller.getMyFamily(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Success', data: { famille_id: 10, nom: null, membres: [] } });
    });

    it('devrait appeler next si une erreur survient', async () => {
      const error = new Error('Test error');
      jest.spyOn(controller['getMyFamilyUseCase'], 'execute').mockRejectedValue(error);

      await controller.getMyFamily(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // removeMember
  describe('removeMember', () => {
    it('devrait retourner 400 si userId manquant', async () => {
      req.params = {};
      await controller.removeMember(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "L'identifiant du membre est requis" });
    });

    it('devrait retourner 200 avec succès', async () => {
      req.params = { userId: 'U-001' };
      const mockExecute = jest.spyOn(controller['removeFamilyMemberUseCase'], 'execute').mockResolvedValue({ success: true, message: 'Success' });

      await controller.removeMember(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({ requesterId: 1, membreUserIdString: 'U-001' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Success' });
    });

    it('devrait appeler next si une erreur survient', async () => {
      req.params = { userId: 'U-001' };
      const error = new Error('Test error');
      jest.spyOn(controller['removeFamilyMemberUseCase'], 'execute').mockRejectedValue(error);

      await controller.removeMember(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getFamilies
  describe('getFamilies', () => {
    it('devrait retourner 200 avec la liste', async () => {
      req.query = { search: 'Doe', page: '2', limit: '10' };
      const mockResult = { data: [], total: 0, page: 2, limit: 10, totalPages: 0 };
      const mockExecute = jest.spyOn(controller['getFamiliesUseCase'], 'execute').mockResolvedValue(mockResult);

      await controller.getFamilies(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({ search: 'Doe', page: 2, limit: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Familles récupérées', data: mockResult });
    });

    it('devrait utiliser les valeurs par défaut si non fournies', async () => {
      req.query = {};
      const mockResult = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      const mockExecute = jest.spyOn(controller['getFamiliesUseCase'], 'execute').mockResolvedValue(mockResult);

      await controller.getFamilies(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({ search: undefined, page: 1, limit: 20 });
    });

    it('devrait appeler next en cas d erreur', async () => {
      const error = new Error('Test error');
      jest.spyOn(controller['getFamiliesUseCase'], 'execute').mockRejectedValue(error);

      await controller.getFamilies(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // getFamilyById
  describe('getFamilyById', () => {
    it('devrait retourner 200', async () => {
      req.params = { id: '10' };
      const mockExecute = jest.spyOn(controller['adminGetFamilyByIdUseCase'], 'execute').mockResolvedValue({ id: 10 } as any);

      await controller.getFamilyById(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Famille récupérée', data: { id: 10 } });
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['adminGetFamilyByIdUseCase'], 'execute').mockRejectedValue(new Error('Famille introuvable'));

      await controller.getFamilyById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Famille introuvable' });
    });

    it('devrait retourner 500 pour autre erreur', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['adminGetFamilyByIdUseCase'], 'execute').mockRejectedValue(new Error('DB error'));

      await controller.getFamilyById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB error' });
    });
    
    it('devrait retourner 500 pour autre erreur si non Error object', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['adminGetFamilyByIdUseCase'], 'execute').mockRejectedValue('Str error');

      await controller.getFamilyById(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne' });
    });
  });

  // updateFamily
  describe('updateFamily', () => {
    it('devrait retourner 200', async () => {
      req.params = { id: '10' };
      req.body = { nom: 'Doe' };
      const mockExecute = jest.spyOn(controller['updateFamilyUseCase'], 'execute').mockResolvedValue({ id: 10, nom: 'Doe' } as any);

      await controller.updateFamily(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({ id: 10, nom: 'Doe' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['updateFamilyUseCase'], 'execute').mockRejectedValue(new Error('Famille introuvable'));
      await controller.updateFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si nom invalide', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['updateFamilyUseCase'], 'execute').mockRejectedValue(new Error('Le nom doit contenir au moins 2 caractères'));
      await controller.updateFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);

      jest.spyOn(controller['updateFamilyUseCase'], 'execute').mockRejectedValue(new Error('Le nom ne peut pas dépasser 100'));
      await controller.updateFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 500 pour autre erreur', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['updateFamilyUseCase'], 'execute').mockRejectedValue('Str error');
      await controller.updateFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // deleteFamily
  describe('deleteFamily', () => {
    it('devrait retourner 200', async () => {
      req.params = { id: '10' };
      const mockExecute = jest.spyOn(controller['deleteFamilyUseCase'], 'execute').mockResolvedValue(undefined);

      await controller.deleteFamily(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['deleteFamilyUseCase'], 'execute').mockRejectedValue(new Error('Famille introuvable'));
      await controller.deleteFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 pour erreur non object', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['deleteFamilyUseCase'], 'execute').mockRejectedValue('Err');
      await controller.deleteFamily(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // adminGetMembers
  describe('adminGetMembers', () => {
    it('devrait retourner 200', async () => {
      req.params = { id: '10' };
      const mockExecute = jest.spyOn(controller['adminGetFamilyMembersUseCase'], 'execute').mockResolvedValue([]);

      await controller.adminGetMembers(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['adminGetFamilyMembersUseCase'], 'execute').mockRejectedValue(new Error('Famille introuvable'));
      await controller.adminGetMembers(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 pour erreur non object', async () => {
      req.params = { id: '10' };
      jest.spyOn(controller['adminGetFamilyMembersUseCase'], 'execute').mockRejectedValue('Err');
      await controller.adminGetMembers(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // adminAddMember
  describe('adminAddMember', () => {
    it('devrait retourner 400 si userId est manquant ou invalide', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 'abc' };

      await controller.adminAddMember(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'user_id est requis et doit être un nombre valide' });
    });

    it('devrait retourner 201 avec paramètres par défaut', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 5 };
      const mockExecute = jest.spyOn(controller['adminAddFamilyMemberUseCase'], 'execute').mockResolvedValue(undefined);

      await controller.adminAddMember(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({
        familleId: 10,
        userId: 5,
        role: 'autre',
        estResponsable: false,
        estTuteurLegal: false
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 201 avec paramètres fournis', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 5, role: 'parent', est_responsable: true, est_tuteur_legal: true };
      const mockExecute = jest.spyOn(controller['adminAddFamilyMemberUseCase'], 'execute').mockResolvedValue(undefined);

      await controller.adminAddMember(req as Request, res as Response, next);

      expect(mockExecute).toHaveBeenCalledWith({
        familleId: 10,
        userId: 5,
        role: 'parent',
        estResponsable: true,
        estTuteurLegal: true
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 5 };
      jest.spyOn(controller['adminAddFamilyMemberUseCase'], 'execute').mockRejectedValue(new Error('Famille introuvable'));
      await controller.adminAddMember(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 409 si déjà membre', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 5 };
      jest.spyOn(controller['adminAddFamilyMemberUseCase'], 'execute').mockRejectedValue(new Error('Cet utilisateur est déjà membre'));
      await controller.adminAddMember(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('devrait retourner 500 pour erreur non object', async () => {
      req.params = { id: '10' };
      req.body = { user_id: 5 };
      jest.spyOn(controller['adminAddFamilyMemberUseCase'], 'execute').mockRejectedValue('Err');
      await controller.adminAddMember(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // adminRemoveMember
  describe('adminRemoveMember', () => {
    it('devrait retourner 400 si params invalides', async () => {
      req.params = { id: 'abc', userId: '5' };
      await controller.adminRemoveMember(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);

      req.params = { id: '10', userId: 'abc' };
      await controller.adminRemoveMember(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si famille introuvable', async () => {
      req.params = { id: '10', userId: '5' };
      mockRepo.findById.mockResolvedValue(null);

      await controller.adminRemoveMember(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 200 avec succès', async () => {
      req.params = { id: '10', userId: '5' };
      mockRepo.findById.mockResolvedValue({ id: 10 } as any);
      mockRepo.removeMembre.mockResolvedValue(undefined);

      await controller.adminRemoveMember(req as Request, res as Response, next);

      expect(mockRepo.removeMembre).toHaveBeenCalledWith(10, 5);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('devrait appeler next si erreur', async () => {
      req.params = { id: '10', userId: '5' };
      mockRepo.findById.mockRejectedValue(new Error('DB error'));

      await controller.adminRemoveMember(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
