import { Request, Response } from 'express';
import { GroupController } from '../GroupController';
import { GetGroupsUseCase } from '../../../application/use-cases/GetGroupsUseCase';
import { GetGroupByIdUseCase } from '../../../application/use-cases/GetGroupByIdUseCase';
import { CreateGroupUseCase } from '../../../application/use-cases/CreateGroupUseCase';
import { UpdateGroupUseCase } from '../../../application/use-cases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from '../../../application/use-cases/DeleteGroupUseCase';
import { GetGroupMembersUseCase } from '../../../application/use-cases/GetGroupMembersUseCase';
import { AddMemberToGroupUseCase } from '../../../application/use-cases/AddMemberToGroupUseCase';
import { RemoveMemberFromGroupUseCase } from '../../../application/use-cases/RemoveMemberFromGroupUseCase';
import type { AuthRequest } from '@/shared/middleware/authMiddleware';

jest.mock('../../../infrastructure/repositories/MySQLGroupRepository');
jest.mock('../../../application/use-cases/GetGroupsUseCase');
jest.mock('../../../application/use-cases/GetGroupByIdUseCase');
jest.mock('../../../application/use-cases/CreateGroupUseCase');
jest.mock('../../../application/use-cases/UpdateGroupUseCase');
jest.mock('../../../application/use-cases/DeleteGroupUseCase');
jest.mock('../../../application/use-cases/GetGroupMembersUseCase');
jest.mock('../../../application/use-cases/AddMemberToGroupUseCase');
jest.mock('../../../application/use-cases/RemoveMemberFromGroupUseCase');

describe('GroupController', () => {
  let controller: GroupController;
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new GroupController();
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

  describe('getGroups', () => {
    it('devrait retourner les groupes avec succès', async () => {
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };
      (GetGroupsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockResult);

      await controller.getGroups(req as AuthRequest, res as Response);

      expect(GetGroupsUseCase.prototype.execute).toHaveBeenCalledWith({ search: undefined, page: 1, limit: 20 });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Groupes récupérés', data: mockResult });
    });

    it('devrait utiliser les query params fournis', async () => {
      req.query = { search: 'test', page: '2', limit: '10' };
      (GetGroupsUseCase.prototype.execute as jest.Mock).mockResolvedValue({ data: [], total: 0, page: 2, limit: 10 });

      await controller.getGroups(req as AuthRequest, res as Response);

      expect(GetGroupsUseCase.prototype.execute).toHaveBeenCalledWith({ search: 'test', page: 2, limit: 10 });
    });

    it('devrait gérer les erreurs internes', async () => {
      (GetGroupsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Internal error'));

      await controller.getGroups(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal error' });
    });

    it('devrait gérer les erreurs non-Error', async () => {
      (GetGroupsUseCase.prototype.execute as jest.Mock).mockRejectedValue('Erreur string');

      await controller.getGroups(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne' });
    });
  });

  describe('getGroupById', () => {
    it('devrait retourner le groupe avec succès', async () => {
      req.params = { id: '1' };
      const mockGroup = { id: 1, nom: 'Group' };
      (GetGroupByIdUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockGroup);

      await controller.getGroupById(req as AuthRequest, res as Response);

      expect(GetGroupByIdUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Groupe récupéré', data: mockGroup });
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      (GetGroupByIdUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Groupe introuvable'));

      await controller.getGroupById(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Groupe introuvable' });
    });

    it('devrait retourner 500 sur erreur inconnue', async () => {
      req.params = { id: '1' };
      (GetGroupByIdUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Internal error'));

      await controller.getGroupById(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal error' });
    });

    it('devrait retourner 500 sur erreur non-Error', async () => {
      req.params = { id: '1' };
      (GetGroupByIdUseCase.prototype.execute as jest.Mock).mockRejectedValue('Erreur');

      await controller.getGroupById(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Erreur interne' });
    });
  });

  describe('createGroup', () => {
    it('devrait créer le groupe avec succès', async () => {
      req.body = { nom: 'Group 1', description: 'Desc' };
      const mockGroup = { id: 1, nom: 'Group 1' };
      (CreateGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockGroup);

      await controller.createGroup(req as AuthRequest, res as Response);

      expect(CreateGroupUseCase.prototype.execute).toHaveBeenCalledWith({ nom: 'Group 1', description: 'Desc' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Groupe créé', data: mockGroup });
    });

    it('devrait retourner 400 si nom requis ou trop court', async () => {
      req.body = { nom: 'A' };
      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Le nom du groupe est requis'));

      await controller.createGroup(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);

      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('au moins 2 caractères'));
      await controller.createGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 409 si duplication ou déjà existant', async () => {
      req.body = { nom: 'Group' };
      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Duplicate entry'));
      await controller.createGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);

      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('déjà existant'));
      await controller.createGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('devrait retourner 500 sinon', async () => {
      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Internal error'));
      await controller.createGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour objet non Error', async () => {
      (CreateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue('Erreur');
      await controller.createGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateGroup', () => {
    it('devrait mettre à jour avec succès', async () => {
      req.params = { id: '1' };
      req.body = { nom: 'New' };
      const mockGroup = { id: 1, nom: 'New' };
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockGroup);

      await controller.updateGroup(req as AuthRequest, res as Response);

      expect(UpdateGroupUseCase.prototype.execute).toHaveBeenCalledWith({ id: 1, nom: 'New' });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Groupe mis à jour', data: mockGroup });
    });

    it('devrait retourner 404 si introuvable', async () => {
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Groupe introuvable'));
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si validation échoue (au moins)', async () => {
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('au moins 2 caractères'));
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 409 si duplication', async () => {
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Duplicate entry'));
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
      
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('déjà existant'));
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('devrait retourner 500 sinon', async () => {
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Internal error'));
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour non-Error', async () => {
      (UpdateGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue('Erreur');
      await controller.updateGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteGroup', () => {
    it('devrait supprimer avec succès', async () => {
      req.params = { id: '1' };
      (DeleteGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.deleteGroup(req as AuthRequest, res as Response);

      expect(DeleteGroupUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Groupe supprimé' });
    });

    it('devrait retourner 404 si introuvable', async () => {
      (DeleteGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.deleteGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 sinon', async () => {
      (DeleteGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('error'));
      await controller.deleteGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour non-Error', async () => {
      (DeleteGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue('error');
      await controller.deleteGroup(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMembers', () => {
    it('devrait retourner les membres avec succès', async () => {
      req.params = { id: '1' };
      (GetGroupMembersUseCase.prototype.execute as jest.Mock).mockResolvedValue([{ user_id: 1 }]);

      await controller.getMembers(req as AuthRequest, res as Response);

      expect(GetGroupMembersUseCase.prototype.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Membres récupérés', data: [{ user_id: 1 }] });
    });

    it('devrait retourner 404 si introuvable', async () => {
      (GetGroupMembersUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.getMembers(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 sinon', async () => {
      (GetGroupMembersUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('error'));
      await controller.getMembers(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour non-Error', async () => {
      (GetGroupMembersUseCase.prototype.execute as jest.Mock).mockRejectedValue('error');
      await controller.getMembers(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('addMember', () => {
    it('devrait ajouter le membre avec succès', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (AddMemberToGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.addMember(req as AuthRequest, res as Response);

      expect(AddMemberToGroupUseCase.prototype.execute).toHaveBeenCalledWith(1, 2);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Membre ajouté au groupe' });
    });

    it('devrait retourner 400 si user_id manquant ou invalide', async () => {
      req.params = { id: '1' };
      req.body = {};
      
      await controller.addMember(req as AuthRequest, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'user_id est requis et doit être un nombre valide' });

      req.body = { user_id: 'abc' };
      await controller.addMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (AddMemberToGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.addMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 409 si déjà membre', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (AddMemberToGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('déjà membre'));
      await controller.addMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('devrait retourner 500 sinon', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (AddMemberToGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('error'));
      await controller.addMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour non-Error', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (AddMemberToGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue('error');
      await controller.addMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('removeMember', () => {
    it('devrait retirer le membre avec param.userId', async () => {
      req.params = { id: '1', userId: '2' };
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.removeMember(req as AuthRequest, res as Response);

      expect(RemoveMemberFromGroupUseCase.prototype.execute).toHaveBeenCalledWith({ groupe_id: 1, user_id: 2 });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Membre retiré du groupe' });
    });

    it('devrait retirer le membre avec body.user_id', async () => {
      req.params = { id: '1' };
      req.body = { user_id: '2' };
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.removeMember(req as AuthRequest, res as Response);

      expect(RemoveMemberFromGroupUseCase.prototype.execute).toHaveBeenCalledWith({ groupe_id: 1, user_id: 2 });
    });

    it('devrait retourner 400 si user_id manquant ou invalide', async () => {
      req.params = { id: '1' };
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);

      req.params = { id: '1', userId: 'abc' };
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '1', userId: '2' };
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('introuvable'));
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
      
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Membre introuvable'));
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 500 sinon', async () => {
      req.params = { id: '1', userId: '2' };
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('error'));
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
    
    it('devrait retourner 500 pour non-Error', async () => {
      req.params = { id: '1', userId: '2' };
      (RemoveMemberFromGroupUseCase.prototype.execute as jest.Mock).mockRejectedValue('error');
      await controller.removeMember(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
