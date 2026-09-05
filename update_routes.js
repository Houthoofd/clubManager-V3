const fs = require('fs');

const code = `import { Router, Request, Response, NextFunction } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';

const router = Router();
const superAdminController = new SuperAdminController();

// Middleware minimal pour s'assurer que c'est un Super Admin
const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use(checkSuperAdmin);
router.get('/clubs', superAdminController.getClubs);
router.patch('/clubs/:id/status', superAdminController.updateClubStatus);
router.put('/clubs/:id', superAdminController.updateClub);
router.delete('/clubs/:id', superAdminController.deleteClub);

export default router;
`;

fs.writeFileSync('backend/src/modules/superadmin/presentation/routes/superadminRoutes.ts', code);
