import { authMiddleware } from '../../../../shared/middleware/authMiddleware.js';
import { Router, Request, Response, NextFunction } from 'express';
import { SuperAdminController } from '../controllers/SuperAdminController.js';
import { SaaSBillingController } from '../controllers/SaaSBillingController.js';
import { SaaSModulesController } from '../controllers/SaaSModulesController.js';

const router = Router();
const superAdminController = new SuperAdminController();
const saasBillingController = new SaaSBillingController();
const saasModulesController = new SaaSModulesController();

// Appliquer l'authentification à TOUTES les routes superadmin
router.use(authMiddleware);

// Middleware pour s'assurer que c'est un Super Admin
const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.role_app !== 'super_admin' && user?.global_role !== 'super_admin') {
    res.status(403).json({ success: false, message: 'Accès interdit: rôle super_admin requis' });
    return;
  }
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

// Abonnements & Factures (Super Admin view)
router.get('/billing/subscriptions', saasBillingController.getAllSubscriptions);
router.post('/billing/subscriptions/:id/cancel', saasBillingController.cancelSubscription);
router.get('/billing/invoices', saasBillingController.getAllInvoices);

// Modules
router.get('/saas/modules', saasModulesController.getAllModules);
router.post('/saas/modules', saasModulesController.createModule);
router.put('/saas/modules/:id', saasModulesController.updateModule);
router.post('/saas/modules/:id/toggle', saasModulesController.toggleModule);

export default router;
