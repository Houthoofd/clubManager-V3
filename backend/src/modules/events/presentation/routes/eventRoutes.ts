import { Router } from 'express';
import { EventController } from '../controllers/EventController.js';
import { authMiddleware as authenticate } from '@/shared/middleware/authMiddleware.js';

import { uploadSingleImage } from '@/shared/middleware/uploadMiddleware.js';

const router = Router();
const controller = new EventController();

router.post('/', authenticate, controller.createEvent);
router.get('/', authenticate, controller.getEvents);
router.put('/:id', authenticate, controller.updateEvent);
router.delete('/:id', authenticate, controller.deleteEvent);
router.post('/register', authenticate, controller.registerToEvent);
router.post('/:id/cancel', authenticate, controller.cancelRegistration);
router.get('/:id/registration', authenticate, controller.getRegistrationStatus);
router.post('/:id/image', authenticate, uploadSingleImage, controller.uploadImage);
router.post('/:id/message', authenticate, controller.messageMembers);

router.post('/:id/announce', authenticate, controller.announceEvent);

export default router;


