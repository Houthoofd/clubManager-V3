import { Request, Response, NextFunction } from 'express';
import { CourseController } from '../CourseController';
import { pool } from '@/core/database/connection';

// Mock DB pool
jest.mock('@/core/database/connection', () => ({
  pool: {
    query: jest.fn(),
  }
}));

// Use Cases - mock all of them
jest.mock('../../../application/use-cases/GetCourseRecurrentsUseCase');
jest.mock('../../../application/use-cases/GetCourseRecurrentByIdUseCase');
jest.mock('../../../application/use-cases/CreateCourseRecurrentUseCase');
jest.mock('../../../application/use-cases/UpdateCourseRecurrentUseCase');
jest.mock('../../../application/use-cases/DeleteCourseRecurrentUseCase');
jest.mock('../../../application/use-cases/GetProfessorsUseCase');
jest.mock('../../../application/use-cases/GetProfessorByIdUseCase');
jest.mock('../../../application/use-cases/CreateProfessorUseCase');
jest.mock('../../../application/use-cases/UpdateProfessorUseCase');
jest.mock('../../../application/use-cases/DeleteProfessorUseCase');
jest.mock('../../../application/use-cases/GetCoursesUseCase');
jest.mock('../../../application/use-cases/GetCourseByIdUseCase');
jest.mock('../../../application/use-cases/CreateCourseUseCase');
jest.mock('../../../application/use-cases/GenerateCoursesUseCase');
jest.mock('../../../application/use-cases/GetCourseInscriptionsUseCase');
jest.mock('../../../application/use-cases/CreateInscriptionUseCase');
jest.mock('../../../application/use-cases/BulkUpdatePresenceUseCase');
jest.mock('../../../application/use-cases/DeleteInscriptionUseCase');
jest.mock('../../../application/use-cases/GetMyEnrollmentsUseCase');
jest.mock('../../../application/use-cases/ExportSessionAttendanceUseCase');
jest.mock('../../../application/use-cases/AssignProfessorToCourseUseCase');
jest.mock('../../../application/use-cases/UnassignProfessorFromCourseUseCase');
jest.mock('../../../application/use-cases/GetCourseProfessorsUseCase');

import { GetCourseRecurrentsUseCase } from '../../../application/use-cases/GetCourseRecurrentsUseCase';
import { GetCourseRecurrentByIdUseCase } from '../../../application/use-cases/GetCourseRecurrentByIdUseCase';
import { CreateCourseRecurrentUseCase } from '../../../application/use-cases/CreateCourseRecurrentUseCase';
import { UpdateCourseRecurrentUseCase } from '../../../application/use-cases/UpdateCourseRecurrentUseCase';
import { DeleteCourseRecurrentUseCase } from '../../../application/use-cases/DeleteCourseRecurrentUseCase';
import { GetProfessorsUseCase } from '../../../application/use-cases/GetProfessorsUseCase';
import { GetProfessorByIdUseCase } from '../../../application/use-cases/GetProfessorByIdUseCase';
import { CreateProfessorUseCase } from '../../../application/use-cases/CreateProfessorUseCase';
import { UpdateProfessorUseCase } from '../../../application/use-cases/UpdateProfessorUseCase';
import { DeleteProfessorUseCase } from '../../../application/use-cases/DeleteProfessorUseCase';
import { GetCoursesUseCase } from '../../../application/use-cases/GetCoursesUseCase';
import { GetCourseByIdUseCase } from '../../../application/use-cases/GetCourseByIdUseCase';
import { CreateCourseUseCase } from '../../../application/use-cases/CreateCourseUseCase';
import { GenerateCoursesUseCase } from '../../../application/use-cases/GenerateCoursesUseCase';
import { GetCourseInscriptionsUseCase } from '../../../application/use-cases/GetCourseInscriptionsUseCase';
import { CreateInscriptionUseCase } from '../../../application/use-cases/CreateInscriptionUseCase';
import { BulkUpdatePresenceUseCase } from '../../../application/use-cases/BulkUpdatePresenceUseCase';
import { DeleteInscriptionUseCase } from '../../../application/use-cases/DeleteInscriptionUseCase';
import { GetMyEnrollmentsUseCase } from '../../../application/use-cases/GetMyEnrollmentsUseCase';
import { ExportSessionAttendanceUseCase } from '../../../application/use-cases/ExportSessionAttendanceUseCase';
import { AssignProfessorToCourseUseCase } from '../../../application/use-cases/AssignProfessorToCourseUseCase';
import { UnassignProfessorFromCourseUseCase } from '../../../application/use-cases/UnassignProfessorFromCourseUseCase';
import { GetCourseProfessorsUseCase } from '../../../application/use-cases/GetCourseProfessorsUseCase';

describe('CourseController', () => {
  let controller: CourseController;
  let req: Partial<Request> & { user?: any };
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    controller = new CourseController();
    req = {
      params: {},
      body: {},
      query: {},
      user: { userId: 1, role_app: 'admin' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  const getMockInstance = (UseCaseClass: any) => {
    return UseCaseClass.prototype;
  };

  describe('Cours Récurrents', () => {
    it('getCourseRecurrents - success', async () => {
      const mockData = [{ id: 1 }];
      getMockInstance(GetCourseRecurrentsUseCase).execute.mockResolvedValue(mockData);

      await controller.getCourseRecurrents(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cours récurrents récupérés", data: mockData });
    });

    it('getCourseRecurrents - error', async () => {
      getMockInstance(GetCourseRecurrentsUseCase).execute.mockRejectedValue(new Error('Test Error'));

      await controller.getCourseRecurrents(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Test Error', error: "INTERNAL_ERROR" });
    });

    it('getCourseRecurrentById - success', async () => {
      req.params = { id: '1' };
      const mockData = { id: 1 };
      getMockInstance(GetCourseRecurrentByIdUseCase).execute.mockResolvedValue(mockData);

      await controller.getCourseRecurrentById(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cours récurrent récupéré", data: mockData });
    });

    it('getCourseRecurrentById - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.getCourseRecurrentById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('getCourseRecurrentById - not found error', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseRecurrentByIdUseCase).execute.mockRejectedValue(new Error('Cours introuvable'));
      await controller.getCourseRecurrentById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('createCourseRecurrent - success', async () => {
      req.body = { nom: 'Test' };
      const mockData = { id: 1 };
      getMockInstance(CreateCourseRecurrentUseCase).execute.mockResolvedValue(mockData);

      await controller.createCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cours récurrent créé", data: mockData });
    });

    it('createCourseRecurrent - validation error', async () => {
      req.body = {};
      getMockInstance(CreateCourseRecurrentUseCase).execute.mockRejectedValue(new Error('Le nom est obligatoire'));
      await controller.createCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updateCourseRecurrent - success', async () => {
      req.params = { id: '1' };
      req.body = { nom: 'Test' };
      const mockData = { id: 1 };
      getMockInstance(UpdateCourseRecurrentUseCase).execute.mockResolvedValue(mockData);

      await controller.updateCourseRecurrent(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cours récurrent mis à jour", data: mockData });
    });

    it('updateCourseRecurrent - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.updateCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updateCourseRecurrent - not found error', async () => {
      req.params = { id: '1' };
      getMockInstance(UpdateCourseRecurrentUseCase).execute.mockRejectedValue(new Error('Cours introuvable'));
      await controller.updateCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deleteCourseRecurrent - success', async () => {
      req.params = { id: '1' };
      getMockInstance(DeleteCourseRecurrentUseCase).execute.mockResolvedValue(undefined);

      await controller.deleteCourseRecurrent(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: "Cours récurrent supprimé" });
    });

    it('deleteCourseRecurrent - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.deleteCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deleteCourseRecurrent - error', async () => {
      req.params = { id: '1' };
      getMockInstance(DeleteCourseRecurrentUseCase).execute.mockRejectedValue(new Error('Test Error'));
      await controller.deleteCourseRecurrent(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Professeurs', () => {
    it('getProfessors - success', async () => {
      getMockInstance(GetProfessorsUseCase).execute.mockResolvedValue([]);
      await controller.getProfessors(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getProfessors - error', async () => {
      getMockInstance(GetProfessorsUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.getProfessors(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('createProfessor - success', async () => {
      getMockInstance(CreateProfessorUseCase).execute.mockResolvedValue({});
      await controller.createProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('createProfessor - error', async () => {
      getMockInstance(CreateProfessorUseCase).execute.mockRejectedValue(new Error('obligatoire'));
      await controller.createProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updateProfessor - success', async () => {
      req.params = { id: '1' };
      getMockInstance(UpdateProfessorUseCase).execute.mockResolvedValue({});
      await controller.updateProfessor(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('updateProfessor - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.updateProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('updateProfessor - error 404', async () => {
      req.params = { id: '1' };
      getMockInstance(UpdateProfessorUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.updateProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('getProfessorById - success', async () => {
      req.params = { id: '1' };
      getMockInstance(GetProfessorByIdUseCase).execute.mockResolvedValue({});
      await controller.getProfessorById(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getProfessorById - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.getProfessorById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('getProfessorById - error 404', async () => {
      req.params = { id: '1' };
      getMockInstance(GetProfessorByIdUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.getProfessorById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('deleteProfessor - success', async () => {
      req.params = { id: '1' };
      getMockInstance(DeleteProfessorUseCase).execute.mockResolvedValue({});
      await controller.deleteProfessor(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('deleteProfessor - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.deleteProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deleteProfessor - error 404', async () => {
      req.params = { id: '1' };
      getMockInstance(DeleteProfessorUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.deleteProfessor(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Cours (Instances)', () => {
    it('getCourses - success', async () => {
      req.query = { date_debut: '2023-01-01', cours_recurrent_id: '1' };
      getMockInstance(GetCoursesUseCase).execute.mockResolvedValue([]);
      await controller.getCourses(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getCourses - error', async () => {
      getMockInstance(GetCoursesUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.getCourses(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('getCourseById - success', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseByIdUseCase).execute.mockResolvedValue({});
      await controller.getCourseById(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getCourseById - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.getCourseById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('getCourseById - error 404', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseByIdUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.getCourseById(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('createCourse - success', async () => {
      getMockInstance(CreateCourseUseCase).execute.mockResolvedValue({});
      await controller.createCourse(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('createCourse - error', async () => {
      getMockInstance(CreateCourseUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.createCourse(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('generateCourses - success', async () => {
      getMockInstance(GenerateCoursesUseCase).execute.mockResolvedValue({ generated: 5 });
      await controller.generateCourses(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('generateCourses - error 404', async () => {
      getMockInstance(GenerateCoursesUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.generateCourses(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('Inscriptions', () => {
    it('getCourseInscriptions - success', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseInscriptionsUseCase).execute.mockResolvedValue([]);
      await controller.getCourseInscriptions(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getCourseInscriptions - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.getCourseInscriptions(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('getCourseInscriptions - error 404', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseInscriptionsUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.getCourseInscriptions(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('createInscription - success with user_id', async () => {
      req.params = { id: '1' };
      req.body = { user_id: 1 };
      getMockInstance(CreateInscriptionUseCase).execute.mockResolvedValue({});
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('createInscription - success with utilisateur_id', async () => {
      req.params = { id: '1' };
      req.body = { utilisateur_id: 1 };
      getMockInstance(CreateInscriptionUseCase).execute.mockResolvedValue({});
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('createInscription - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('createInscription - missing user_id', async () => {
      req.params = { id: '1' };
      req.body = {};
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('createInscription - duplicate entry error', async () => {
      req.params = { id: '1' };
      req.body = { user_id: 1 };
      const err: any = new Error('Dup');
      err.code = 'ER_DUP_ENTRY';
      getMockInstance(CreateInscriptionUseCase).execute.mockRejectedValue(err);
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('createInscription - other error', async () => {
      req.params = { id: '1' };
      req.body = { user_id: 1 };
      getMockInstance(CreateInscriptionUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.createInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('bulkUpdatePresence - success client format', async () => {
      req.body = { presences: [{ inscription_id: 1, statut: 'present' }, { inscription_id: 2, statut: 'absent' }] };
      getMockInstance(BulkUpdatePresenceUseCase).execute.mockResolvedValue({});
      await controller.bulkUpdatePresence(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('bulkUpdatePresence - success dto format', async () => {
      req.body = { updates: [{ inscription_id: 1, status_id: 1 }] };
      getMockInstance(BulkUpdatePresenceUseCase).execute.mockResolvedValue({});
      await controller.bulkUpdatePresence(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('bulkUpdatePresence - error', async () => {
      req.body = { updates: [] };
      getMockInstance(BulkUpdatePresenceUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.bulkUpdatePresence(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deleteInscription - success admin', async () => {
      req.params = { inscriptionId: '1' };
      req.user = { role_app: 'admin' };
      getMockInstance(DeleteInscriptionUseCase).execute.mockResolvedValue({});
      await controller.deleteInscription(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('deleteInscription - invalid id', async () => {
      req.params = { inscriptionId: 'abc' };
      await controller.deleteInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('deleteInscription - success member owns inscription', async () => {
      req.params = { inscriptionId: '1' };
      req.user = { role_app: 'member', userId: 1 };
      (pool.query as jest.Mock).mockResolvedValue([[{ id: 1 }]]);
      getMockInstance(DeleteInscriptionUseCase).execute.mockResolvedValue({});
      await controller.deleteInscription(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('deleteInscription - forbidden member does not own inscription', async () => {
      req.params = { inscriptionId: '1' };
      req.user = { role_app: 'member', userId: 1 };
      (pool.query as jest.Mock).mockResolvedValue([[]]); // empty rows
      await controller.deleteInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('deleteInscription - error', async () => {
      req.params = { inscriptionId: '1' };
      req.user = { role_app: 'admin' };
      getMockInstance(DeleteInscriptionUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.deleteInscription(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('getMyEnrollments - success', async () => {
      req.user = { userId: 1 };
      getMockInstance(GetMyEnrollmentsUseCase).execute.mockResolvedValue([]);
      await controller.getMyEnrollments(req as any, res as any);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it('getMyEnrollments - error', async () => {
      req.user = { userId: 1 };
      getMockInstance(GetMyEnrollmentsUseCase).execute.mockRejectedValue(new Error('Err'));
      await controller.getMyEnrollments(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Export', () => {
    it('exportSessionAttendance - success', async () => {
      req.params = { id: '1' };
      getMockInstance(ExportSessionAttendanceUseCase).execute.mockResolvedValue({ filename: 'test.csv', csv: 'a,b,c' });
      await controller.exportSessionAttendance(req as any, res as any, next);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv; charset=utf-8");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalled();
    });

    it('exportSessionAttendance - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.exportSessionAttendance(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('exportSessionAttendance - not found', async () => {
      req.params = { id: '1' };
      getMockInstance(ExportSessionAttendanceUseCase).execute.mockResolvedValue(null);
      await controller.exportSessionAttendance(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('exportSessionAttendance - error passes to next', async () => {
      req.params = { id: '1' };
      const err = new Error('Err');
      getMockInstance(ExportSessionAttendanceUseCase).execute.mockRejectedValue(err);
      await controller.exportSessionAttendance(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe('Assignation', () => {
    it('getCourseProfessors - success', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseProfessorsUseCase).execute.mockResolvedValue([]);
      await controller.getCourseProfessors(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getCourseProfessors - invalid id', async () => {
      req.params = { id: 'abc' };
      await controller.getCourseProfessors(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('getCourseProfessors - not found', async () => {
      req.params = { id: '1' };
      getMockInstance(GetCourseProfessorsUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.getCourseProfessors(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('getCourseProfessors - other error to next', async () => {
      req.params = { id: '1' };
      const err = new Error('Err');
      getMockInstance(GetCourseProfessorsUseCase).execute.mockRejectedValue(err);
      await controller.getCourseProfessors(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it('assignProfessorToCourse - success', async () => {
      req.params = { id: '1' };
      req.body = { professor_id: 2 };
      getMockInstance(AssignProfessorToCourseUseCase).execute.mockResolvedValue({});
      await controller.assignProfessorToCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('assignProfessorToCourse - invalid course id', async () => {
      req.params = { id: 'abc' };
      await controller.assignProfessorToCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('assignProfessorToCourse - missing prof id', async () => {
      req.params = { id: '1' };
      req.body = {};
      await controller.assignProfessorToCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('assignProfessorToCourse - not found', async () => {
      req.params = { id: '1' };
      req.body = { professor_id: 2 };
      getMockInstance(AssignProfessorToCourseUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.assignProfessorToCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('assignProfessorToCourse - error to next', async () => {
      req.params = { id: '1' };
      req.body = { professor_id: 2 };
      const err = new Error('Err');
      getMockInstance(AssignProfessorToCourseUseCase).execute.mockRejectedValue(err);
      await controller.assignProfessorToCourse(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it('unassignProfessorFromCourse - success', async () => {
      req.params = { id: '1', professorId: '2' };
      getMockInstance(UnassignProfessorFromCourseUseCase).execute.mockResolvedValue({});
      await controller.unassignProfessorFromCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('unassignProfessorFromCourse - invalid course id', async () => {
      req.params = { id: 'abc', professorId: '2' };
      await controller.unassignProfessorFromCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('unassignProfessorFromCourse - not found', async () => {
      req.params = { id: '1', professorId: '2' };
      getMockInstance(UnassignProfessorFromCourseUseCase).execute.mockRejectedValue(new Error('introuvable'));
      await controller.unassignProfessorFromCourse(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('unassignProfessorFromCourse - error to next', async () => {
      req.params = { id: '1', professorId: '2' };
      const err = new Error('Err');
      getMockInstance(UnassignProfessorFromCourseUseCase).execute.mockRejectedValue(err);
      await controller.unassignProfessorFromCourse(req as any, res as any, next);
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
