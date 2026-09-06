import { Router, Request, Response, NextFunction } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController';
import { SaaSBillingController } from '../controllers/SaaSBillingController';

const router = Router();
const superAdminController = new SuperAdminController();
const saasBillingController = new SaaSBillingController();

// Middleware minimal pour s'assurer que c'est un Super Admin
const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  next();
};

router.use(checkSuperAdmin);
router.get('/clubs', superAdminController.getClubs);
router.patch('/clubs/:id/status', superAdminController.updateClubStatus);
router.put('/clubs/:id', superAdminController.updateClub);
router.delete('/clubs/:id', superAdminController.deleteClub);

router.post('/clubs/invite', superAdminController.inviteClub);
router.post('/clubs/:id/impersonate', superAdminController.impersonateClub);
router.post('/clubs/:id/extend-trial', superAdminController.extendTrial);

// Plans Tarifaires
router.get('/billing/plans', saasBillingController.getPlans);
router.post('/billing/plans', saasBillingController.createPlan);
router.put('/billing/plans/:id', saasBillingController.updatePlan);
router.delete('/billing/plans/:id', saasBillingController.deletePlan);

export default router;
