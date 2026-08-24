import { GradeController } from '../GradeController';
import type { Response } from 'express';
import type { AuthRequest } from '@/shared/middleware/authMiddleware';

// Mock dependencies
jest.mock('../../../application/use-cases/GetGradesUseCase');
jest.mock('../../../application/use-cases/GetGradeByIdUseCase');
jest.mock('../../../application/use-cases/CreateGradeUseCase');
jest.mock('../../../application/use-cases/UpdateGradeUseCase');
jest.mock('../../../application/use-cases/DeleteGradeUseCase');

// Import mocked dependencies
import { GetGradesUseCase } from '../../../application/use-cases/GetGradesUseCase';
import { GetGradeByIdUseCase } from '../../../application/use-cases/GetGradeByIdUseCase';
import { CreateGradeUseCase } from '../../../application/use-cases/CreateGradeUseCase';
import { UpdateGradeUseCase } from '../../../application/use-cases/UpdateGradeUseCase';
import { DeleteGradeUseCase } from '../../../application/use-cases/DeleteGradeUseCase';

const mockGetGradesUC = GetGradesUseCase.prototype as jest.Mocked<GetGradesUseCase>;
const mockGetGradeByIdUC = GetGradeByIdUseCase.prototype as jest.Mocked<GetGradeByIdUseCase>;
const mockCreateGradeUC = CreateGradeUseCase.prototype as jest.Mocked<CreateGradeUseCase>;
const mockUpdateGradeUC = UpdateGradeUseCase.prototype as jest.Mocked<UpdateGradeUseCase>;
const mockDeleteGradeUC = DeleteGradeUseCase.prototype as jest.Mocked<DeleteGradeUseCase>;

let controller: GradeController;
let req: Partial<AuthRequest>;
let res: Partial<Response>;

beforeEach(() => {
  controller = new GradeController();
  req = { params: {}, body: {} };
  res = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('GradeController', () => {
  describe('getGrades', () => {
    it('devrait retourner la liste des grades', async () => {
      const grades = [{ id: 1, nom: 'Test', ordre: 1, couleur: null }];
      mockGetGradesUC.execute.mockResolvedValue(grades);

      await controller.getGrades(req as AuthRequest, res as Response);

      expect(mockGetGradesUC.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grades récupérés", data: grades });
    });

    it('devrait retourner 500 si erreur', async () => {
      mockGetGradesUC.execute.mockRejectedValue(new Error('Internal'));
      await controller.getGrades(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getGradeById', () => {
    it('devrait retourner le grade si trouvé', async () => {
      req.params = { id: '1' };
      const grade = { id: 1, nom: 'Test', ordre: 1, couleur: null };
      mockGetGradeByIdUC.execute.mockResolvedValue(grade);

      await controller.getGradeById(req as AuthRequest, res as Response);

      expect(mockGetGradeByIdUC.execute).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grade récupéré", data: grade });
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '999' };
      mockGetGradeByIdUC.execute.mockRejectedValue(new Error('Grade introuvable'));
      await controller.getGradeById(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('createGrade', () => {
    it('devrait créer un grade et retourner 201', async () => {
      req.body = { nom: 'Test', ordre: 1, couleur: '#fff' };
      const createdGrade = { id: 1, nom: 'Test', ordre: 1, couleur: '#fff' };
      mockCreateGradeUC.execute.mockResolvedValue(createdGrade);

      await controller.createGrade(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grade créé", data: createdGrade });
    });

    it('devrait retourner 400 si validation requis échoue', async () => {
      req.body = { ordre: 1 };
      mockCreateGradeUC.execute.mockRejectedValue(new Error('Le nom est requis'));
      await controller.createGrade(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    
    it('devrait retourner 400 si validation entier échoue', async () => {
      req.body = { nom: 'Test', ordre: 1.5 };
      mockCreateGradeUC.execute.mockRejectedValue(new Error('L\'ordre doit être un entier'));
      await controller.createGrade(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateGrade', () => {
    it('devrait mettre à jour un grade et retourner le résultat', async () => {
      req.params = { id: '1' };
      req.body = { nom: 'Test' };
      const updatedGrade = { id: 1, nom: 'Test', ordre: 1, couleur: null };
      mockUpdateGradeUC.execute.mockResolvedValue(updatedGrade);

      await controller.updateGrade(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grade mis à jour", data: updatedGrade });
    });

    it('devrait retourner 404 si introuvable', async () => {
      req.params = { id: '999' };
      mockUpdateGradeUC.execute.mockRejectedValue(new Error('Grade introuvable'));
      await controller.updateGrade(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('devrait retourner 400 si ordre entier échoue', async () => {
      req.params = { id: '1' };
      req.body = { ordre: -1 };
      mockUpdateGradeUC.execute.mockRejectedValue(new Error('L\'ordre doit être un entier >= 0'));
      await controller.updateGrade(req as AuthRequest, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteGrade', () => {
    it('devrait supprimer un grade et retourner le message de succès', async () => {
      req.params = { id: '1' };
      mockDeleteGradeUC.execute.mockResolvedValue(undefined);

      await controller.deleteGrade(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Grade supprimé" });
    });

    it('devrait retourner 409 si le grade est utilisé', async () => {
      req.params = { id: '1' };
      mockDeleteGradeUC.execute.mockRejectedValue(new Error('Grade utilisé par des membres'));

      await controller.deleteGrade(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
