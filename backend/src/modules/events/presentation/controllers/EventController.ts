import { Request, Response } from 'express';
import { CreateEventUseCase } from '../../application/use-cases/CreateEventUseCase.js';
import { GetEventsUseCase } from '../../application/use-cases/GetEventsUseCase.js';
import { RegisterToEventUseCase } from '../../application/use-cases/RegisterToEventUseCase.js';
import { MySQLEventRepository } from '../../infrastructure/repositories/MySQLEventRepository.js';
import { getStorageService } from '@/shared/storage/StorageServiceFactory.js';

const repository = new MySQLEventRepository();
const createEventUseCase = new CreateEventUseCase(repository);
const getEventsUseCase = new GetEventsUseCase(repository);
const registerToEventUseCase = new RegisterToEventUseCase(repository);

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const event = await createEventUseCase.execute(req.body);
      res.status(201).json(event);
    } catch (error: any) {
      console.error("[CreateEvent Error]:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const filters = req.query;
      const events = await getEventsUseCase.execute(filters);
      res.status(200).json(events);
    } catch (error: any) {
      console.error("[GetEvents Error]:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async registerToEvent(req: Request, res: Response) {
    try {
      const registration = await registerToEventUseCase.execute(req.body);
      res.status(201).json(registration);
    } catch (error: any) {
      if (error.message.startsWith('403:')) {
        res.status(403).json({ error: error.message.replace('403: ', '') });
      } else if (error.message.startsWith('409:')) {
        res.status(409).json({ error: error.message.replace('409: ', '') });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  async cancelRegistration(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id, 10);
      const userId = req.body.user_id; // from AuthRequest if possible, but let's take body for now
      
      const registration = await repository.getRegistration(eventId, userId);
      if (!registration) {
        return res.status(404).json({ error: "Inscription introuvable" });
      }
      
      if (registration.status === 'CANCELLED') {
        return res.status(400).json({ error: "Déjà désinscrit" });
      }

      // Update in DB (using repository directly for simplicity here)
      const newPaymentStatus = registration.payment_status === 'PAID' ? 'REFUNDED' : registration.payment_status;
      await repository.updateRegistrationStatus(registration.id, 'CANCELLED', newPaymentStatus);

      // Envoi d'email
      const user = await repository.getUserBasicInfo(userId);
      const event = await repository.getEventById(eventId);
      if (user && event) {
        emailService.sendCancellationConfirmation(user.email, user.nom, event.title).catch(err => {
          console.error("Failed to send cancellation email", err);
        });
      }

      res.status(200).json({ success: true, message: "Désinscription réussie", payment_status: newPaymentStatus });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRegistrationStatus(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id, 10);
      const userId = parseInt(req.query.user_id as string, 10);
      
      const registration = await repository.getRegistration(eventId, userId);
      res.status(200).json(registration || { status: 'NOT_REGISTERED' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadImage(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.id, 10);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      const event = await repository.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Événement introuvable" });
      }

      const storage = getStorageService();
      const imageUrl = await storage.upload(file, "events");

      await repository.updateEvent(eventId, { image_url: imageUrl });

      res.status(200).json({ image_url: imageUrl });
    } catch (error: any) {
      console.error("[UploadImage Error]:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
