import { Router } from 'express';
import { EventController } from '../controllers/EventController.js';
import { authMiddleware as authenticate } from '@/shared/middleware/authMiddleware.js';

const router = Router();
const controller = new EventController();

router.post('/', authenticate, controller.createEvent);
router.get('/', authenticate, controller.getEvents);
router.post('/register', authenticate, controller.registerToEvent);
router.post('/:id/cancel', authenticate, controller.cancelRegistration);
router.get('/:id/registration', authenticate, controller.getRegistrationStatus);

export default router;
