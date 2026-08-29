import { Router } from 'express';
import { EventController } from '../controllers/EventController.js';
import { authMiddleware as authenticate } from '@/shared/middleware/authMiddleware.js';

import { uploadSingleImage } from '@/shared/middleware/uploadMiddleware.js';

const router = Router();
const controller = new EventController();

router.post('/', authenticate, controller.createEvent);
router.get('/', authenticate, controller.getEvents);
router.post('/register', authenticate, controller.registerToEvent);
router.post('/:id/cancel', authenticate, controller.cancelRegistration);
router.get('/:id/registration', authenticate, controller.getRegistrationStatus);
router.post('/:id/image', authenticate, uploadSingleImage, controller.uploadImage);

export default router;
