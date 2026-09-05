import { Router } from 'express';
import { OnboardingController } from '../controllers/OnboardingController';
// The tenantMiddleware is typically applied globally in app.ts,
// but let's make sure it knows /api/onboarding is a master route.

const router = Router();
const onboardingController = new OnboardingController();

router.post('/provision', onboardingController.provision);

export default router;
