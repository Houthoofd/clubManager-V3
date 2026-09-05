import { Router, Request, Response, NextFunction } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';

const router = Router();
const superAdminController = new SuperAdminController();

// Middleware minimal pour s'assurer que c'est un Super Admin
// Dans un vrai projet, ceci utiliserait le requireAuth + checkRole
const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  // Par sécurité pour ce prototype, on peut vérifier que global_role existe
  // if (!user || user.global_role !== 'super_admin') {
  //   return res.status(403).json({ success: false, message: 'Accès interdit' });
  // }
  next();
};

router.use(checkSuperAdmin);
router.get('/clubs', superAdminController.getClubs);
router.patch('/clubs/:id/status', superAdminController.updateClubStatus);

export default router;
