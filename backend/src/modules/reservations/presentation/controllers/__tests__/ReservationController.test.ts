import { ReservationController } from '../ReservationController.js';
import { GetReservationsUseCase } from '../../../application/use-cases/GetReservationsUseCase.js';
import { GetUserReservationsUseCase } from '../../../application/use-cases/GetUserReservationsUseCase.js';
import { CreateReservationUseCase } from '../../../application/use-cases/CreateReservationUseCase.js';
import { CancelReservationUseCase } from '../../../application/use-cases/CancelReservationUseCase.js';
import { UserRole } from '@clubmanager/types';

jest.mock('../../../application/use-cases/GetReservationsUseCase.js');
jest.mock('../../../application/use-cases/GetUserReservationsUseCase.js');
jest.mock('../../../application/use-cases/CreateReservationUseCase.js');
jest.mock('../../../application/use-cases/CancelReservationUseCase.js');
jest.mock('../../../infrastructure/repositories/MySQLReservationRepository.js');

describe('ReservationController', () => {
  let controller: ReservationController;
  let req: any;
  let res: any;

  beforeEach(() => {
    controller = new ReservationController();
    req = {
      user: { userId: 1, role_app: UserRole.MEMBER },
      query: {},
      params: {},
      body: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getReservations', () => {
    it('should get reservations for privileged user with all query params', async () => {
      req.user.role_app = UserRole.ADMIN;
      req.query = { cours_id: '10', user_id: '2', statut: 'CONFIRMED', page: '1', limit: '10' };
      
      const mockData = { items: [], total: 0 };
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockData);

      await controller.getReservations(req, res);

      expect(GetReservationsUseCase.prototype.execute).toHaveBeenCalledWith({
        cours_id: 10,
        user_id: 2,
        statut: 'CONFIRMED',
        page: 1,
        limit: 10
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Réservations récupérées',
        data: mockData
      });
    });

    it('should fall back to undefined for user_id if not provided as admin', async () => {
      req.user.role_app = UserRole.PROFESSOR;
      req.query = {};
      
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue({});

      await controller.getReservations(req, res);

      expect(GetReservationsUseCase.prototype.execute).toHaveBeenCalledWith({
        cours_id: undefined,
        user_id: undefined,
        statut: undefined,
        page: undefined,
        limit: undefined
      });
    });

    it('should force user_id for MEMBER', async () => {
      req.user.role_app = UserRole.MEMBER;
      req.query = { user_id: '99' };
      
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue({});

      await controller.getReservations(req, res);

      expect(GetReservationsUseCase.prototype.execute).toHaveBeenCalledWith({
        cours_id: undefined,
        user_id: 1,
        statut: undefined,
        page: undefined,
        limit: undefined
      });
    });

    it('should handle internal errors', async () => {
      req.user.role_app = UserRole.MEMBER;
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.getReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'DB Error',
        error: 'INTERNAL_ERROR'
      });
    });
  });

  describe('getCourseReservations', () => {
    it('should return 400 if cours_id is NaN', async () => {
      req.params.coursId = 'not-a-number';
      
      await controller.getCourseReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID de cours invalide' });
    });

    it('should return reservations for valid cours_id', async () => {
      req.params.coursId = '5';
      const mockData = [{ id: 1 }];
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockData);

      await controller.getCourseReservations(req, res);

      expect(GetReservationsUseCase.prototype.execute).toHaveBeenCalledWith({ cours_id: 5 });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Réservations du cours récupérées',
        data: mockData
      });
    });

    it('should handle internal errors', async () => {
      req.params.coursId = '5';
      (GetReservationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await controller.getCourseReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'DB Error',
        error: 'INTERNAL_ERROR'
      });
    });
  });

  describe('createReservation', () => {
    it('should return 400 if cours_id is missing', async () => {
      req.body = {};
      
      await controller.createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'cours_id est requis' });
    });

    it('should return 403 if MEMBER tries to create for another user', async () => {
      req.body = { cours_id: 10, user_id: 2 };
      req.user.role_app = UserRole.MEMBER;
      req.user.userId = 1;

      await controller.createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accès refusé' });
    });

    it('should allow ADMIN to create for another user', async () => {
      req.body = { cours_id: 10, user_id: 2 };
      req.user.role_app = UserRole.ADMIN;
      req.user.userId = 1;

      (CreateReservationUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 100 });

      await controller.createReservation(req, res);

      expect(CreateReservationUseCase.prototype.execute).toHaveBeenCalledWith({ user_id: 2, cours_id: 10 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Réservation créée', data: { id: 100 } });
    });

    it('should use req.user.userId if user_id not provided in body', async () => {
      req.body = { cours_id: 10 };
      req.user.role_app = UserRole.MEMBER;
      req.user.userId = 5;

      (CreateReservationUseCase.prototype.execute as jest.Mock).mockResolvedValue({ id: 101 });

      await controller.createReservation(req, res);

      expect(CreateReservationUseCase.prototype.execute).toHaveBeenCalledWith({ user_id: 5, cours_id: 10 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Réservation créée', data: { id: 101 } });
    });

    it('should return 409 if error message contains "déjà"', async () => {
      req.body = { cours_id: 10 };
      (CreateReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Utilisateur a déjà réservé'));

      await controller.createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Utilisateur a déjà réservé' });
    });

    it('should return 500 for other errors', async () => {
      req.body = { cours_id: 10 };
      (CreateReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Some other error'));

      await controller.createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Some other error' });
    });
  });

  describe('cancelReservation', () => {
    it('should return 400 if id is NaN', async () => {
      req.params.id = 'abc';
      
      await controller.cancelReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID invalide' });
    });

    it('should cancel reservation successfully', async () => {
      req.params.id = '123';
      req.user.userId = 1;
      req.user.role_app = UserRole.MEMBER;
      
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.cancelReservation(req, res);

      expect(CancelReservationUseCase.prototype.execute).toHaveBeenCalledWith(123, 1, UserRole.MEMBER);
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Réservation annulée' });
    });
    
    it('should fallback role to empty string if missing', async () => {
      req.params.id = '123';
      req.user.userId = 1;
      req.user.role_app = undefined;
      
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockResolvedValue(undefined);

      await controller.cancelReservation(req, res);

      expect(CancelReservationUseCase.prototype.execute).toHaveBeenCalledWith(123, 1, "");
    });

    it('should return 404 if error message contains "introuvable"', async () => {
      req.params.id = '123';
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Réservation introuvable'));

      await controller.cancelReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Réservation introuvable' });
    });

    it('should return 403 if error message contains "Accès"', async () => {
      req.params.id = '123';
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Accès refusé'));

      await controller.cancelReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accès refusé' });
    });

    it('should return 409 if error message contains "déjà"', async () => {
      req.params.id = '123';
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Réservation déjà annulée'));

      await controller.cancelReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Réservation déjà annulée' });
    });

    it('should return 500 for other errors', async () => {
      req.params.id = '123';
      (CancelReservationUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      await controller.cancelReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Unexpected error' });
    });
  });

  describe('getUserReservations', () => {
    it('should return 400 if userId is NaN', async () => {
      req.params.userId = 'abc';
      
      await controller.getUserReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ID utilisateur invalide' });
    });

    it('should use req.user.userId if targetUserId is not provided in params', async () => {
      req.params.userId = undefined;
      req.user.userId = 5;
      const mockData = [{ id: 1 }];
      (GetUserReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockData);

      await controller.getUserReservations(req, res);

      expect(GetUserReservationsUseCase.prototype.execute).toHaveBeenCalledWith(5, undefined);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Réservations de l'utilisateur récupérées",
        data: mockData
      });
    });

    it('should return 403 if unprivileged user requests reservations of another user', async () => {
      req.params.userId = '2';
      req.user.userId = 1;
      req.user.role_app = UserRole.MEMBER;

      await controller.getUserReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Accès refusé' });
    });

    it('should allow ADMIN to request reservations of another user', async () => {
      req.params.userId = '2';
      req.user.userId = 1;
      req.user.role_app = UserRole.ADMIN;
      req.query.statut = 'CONFIRMED';
      const mockData = [{ id: 1 }];
      (GetUserReservationsUseCase.prototype.execute as jest.Mock).mockResolvedValue(mockData);

      await controller.getUserReservations(req, res);

      expect(GetUserReservationsUseCase.prototype.execute).toHaveBeenCalledWith(2, 'CONFIRMED');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Réservations de l'utilisateur récupérées",
        data: mockData
      });
    });

    it('should handle internal errors', async () => {
      req.params.userId = '1';
      (GetUserReservationsUseCase.prototype.execute as jest.Mock).mockRejectedValue(new Error('Some error'));

      await controller.getUserReservations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Some error',
        error: 'INTERNAL_ERROR'
      });
    });
  });
});
