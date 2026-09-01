import jwt from "jsonwebtoken";
import { StripeService } from '../../../payments/infrastructure/services/StripeService.js';
import { MySQLUserRepository } from '@/modules/users/infrastructure/repositories/MySQLUserRepository.js';
import { Request, Response } from 'express';
import { CreateEventUseCase } from '../../application/use-cases/CreateEventUseCase.js';
import { GetEventsUseCase } from '../../application/use-cases/GetEventsUseCase.js';
import { RegisterToEventUseCase } from '../../application/use-cases/RegisterToEventUseCase.js';
import { UpdateEventUseCase } from '../../application/use-cases/UpdateEventUseCase.js';
import { DeleteEventUseCase } from '../../application/use-cases/DeleteEventUseCase.js';
import { MySQLEventRepository } from '../../infrastructure/repositories/MySQLEventRepository.js';
import { getStorageService } from '@/shared/storage/StorageServiceFactory.js';
import { EmailService } from '@/modules/auth/application/services/EmailService.js';

const emailService = new EmailService();

const repository = new MySQLEventRepository();
const createEventUseCase = new CreateEventUseCase(repository);
const getEventsUseCase = new GetEventsUseCase(repository);
const registerToEventUseCase = new RegisterToEventUseCase(repository);
const updateEventUseCase = new UpdateEventUseCase(repository);
const deleteEventUseCase = new DeleteEventUseCase(repository);

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

  async updateEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const event = await updateEventUseCase.execute(eventId, req.body);
      res.status(200).json(event);
    } catch (error: any) {
      console.error("[UpdateEvent Error]:", error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      await deleteEventUseCase.execute(eventId);
      res.status(204).send();
    } catch (error: any) {
      console.error("[DeleteEvent Error]:", error);
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
      // 1. Stripe verification if payment_intent_id is provided
      if (req.body.payment_intent_id) {
        const stripeService = new StripeService();
        const intent = await stripeService.retrievePaymentIntent(req.body.payment_intent_id);
        
        if (intent.status !== 'succeeded') {
          res.status(400).json({ error: "Le paiement Stripe n'a pas été validé (statut : " + intent.status + ")" });
          return;
        }

        // Attach payment status info to body so the UseCase saves it
        req.body.payment_status = 'PAID';
      }

      // We should also check if the event is PAID and they didn't provide payment_intent_id, but the frontend blocks it anyway.
      const event = await repository.getEventById(req.body.event_id);
      if (event && event.price && Number(event.price) > 0 && !req.body.payment_intent_id) {
         res.status(402).json({ error: 'Paiement requis avant inscription.' });
         return;
      }

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
      const eventId = Number(req.params.id);
      const userId = req.body.user_id; // from AuthRequest if possible, but let's take body for now
      
      const registration = await repository.getRegistration(eventId, userId);
      if (!registration) {
        return res.status(404).json({ error: "Inscription introuvable" });
      }
      
      if (registration.status === 'CANCELLED') {
        return res.status(400).json({ error: "DÃƒÂ©jÃƒÂ  dÃƒÂ©sinscrit" });
      }

      // Update in DB (using repository directly for simplicity here)
      const newPaymentStatus = registration.payment_status === 'PAID' ? 'REFUNDED' : registration.payment_status;
      await repository.updateRegistrationStatus(registration.id, 'CANCELLED', newPaymentStatus);

      // Envoi d'email
      const user = await repository.getUserBasicInfo(userId);
      const event = await repository.getEventById(eventId);
      if (user && event) {
        emailService.sendCustomEmail([user.email], "Annulation", "Annulation confirmée").catch((err: any) => {
          console.error("Failed to send cancellation email", err);
        });
      }

      res.status(200).json({ success: true, message: "DÃƒÂ©sinscription rÃƒÂ©ussie", payment_status: newPaymentStatus });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getRegistrationStatus(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const userId = Number(req.query.user_id);
      
      const registration = await repository.getRegistration(eventId, userId);
      res.status(200).json(registration || { status: 'NOT_REGISTERED' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async messageMembers(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const { subject, message } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ error: "Sujet et message requis" });
      }
      const event = await repository.getEventById(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });
      const registrations = await repository.listRegistrations(eventId);
      if (registrations.length === 0) return res.status(400).json({ error: "Aucun inscrit pour cet évènement" });
      const emails: string[] = [];
      for (const reg of registrations) {
        const user = await repository.getUserBasicInfo(reg.user_id);
        if (user) emails.push(user.email);
      }
      if (emails.length > 0) {
        const htmlContent = "<p>" + message.replace(/\n/g, '<br>') + "</p>";
        await emailService.sendCustomEmail(emails, subject, htmlContent);
      }
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async uploadImage(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Aucun fichier fourni" });
      }

      const event = await repository.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Ãƒâ€°vÃƒÂ©nement introuvable" });
      }

      const storage = getStorageService();
      const imageUrl = await storage.upload(file, "events");
      await repository.updateEvent(eventId, { image_url: imageUrl.url });

      res.status(200).json({ image_url: imageUrl.url });
    } catch (error: any) {
      console.error("[UploadImage Error]:", error);
      res.status(500).json({ error: error.message });
    }
  }


  async createPaymentIntent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        res.status(400).json({ error: 'ID invalide' });
        return;
      }

      const event = await repository.getEventById(eventId);
      if (!event) {
        res.status(404).json({ error: 'Événement introuvable' });
        return;
      }

      if (!event.price || Number(event.price) <= 0) {
        res.status(400).json({ error: 'Cet événement est gratuit' });
        return;
      }

      const stripeService = new StripeService();
      const amountInCents = Math.round(Number(event.price) * 100);
      
      const intent = await stripeService.createPaymentIntent(amountInCents, 'eur', {
        event_id: String(event.id),
      });

      res.status(200).json({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id
      });
    } catch (error: any) {
      console.error("[EventController] Error in createPaymentIntent:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async announceEvent(req: Request, res: Response) {
    try {
      const eventId = Number(req.params.id);
      const event = await repository.getEventById(eventId);
      if (!event) {
        return res.status(404).json({ error: "Événement introuvable" });
      }

      const userRepo = new MySQLUserRepository();
      const usersRes = await userRepo.findAll({ limit: 10000 });
      const activeUsers = usersRes.users;

      const secret = process.env.JWT_SECRET || "fallback_secret";
      const baseUrl = process.env.FRONTEND_URL || "https://club-management.com";
      const eventUrl = `${baseUrl}/events/${event.id}`;
      
      for (const u of activeUsers) {
        if (!u.email) continue;
        
        const subject = "Nouvel événement : " + event.title;
        let htmlContent = `<p>Un nouvel événement a été créé : <strong>${event.title}</strong></p>`;
        htmlContent += `<p>Date : ${new Date(event.start_date).toLocaleString('fr-FR')}</p>`;
        if (event.description) {
          htmlContent += `<p>${event.description}</p>`;
        }
        
        const token = jwt.sign({ id: u.id }, secret, { expiresIn: "30d" });
        const quickPayUrl = `${baseUrl}/quick-pay?token=${token}&type=evenement&id=${event.id}`;

        if (event.price && Number(event.price) > 0) {
          htmlContent += `<br><p>Cet événement est payant (${event.price} €). Si vous souhaitez y participer, vous pouvez vous inscrire et régler votre place directement en ligne :</p>`;
          htmlContent += `<p><a href="${quickPayUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">S'inscrire et Payer</a></p>`;
        } else {
          htmlContent += `<br><p>Pour plus de détails et pour confirmer votre présence, cliquez ci-dessous :</p>`;
          htmlContent += `<p><a href="${eventUrl}" style="display:inline-block;padding:10px 20px;background-color:#9333ea;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Voir l'événement</a></p>`;
        }

        await emailService.sendCustomEmail([u.email], subject, htmlContent);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[AnnounceEvent Error]:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
