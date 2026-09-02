const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

if (!c.includes('import { StripeService }')) {
  c = c.replace(/import \{ EventEmailService \} from '\.\.\/\.\.\/application\/services\/EventEmailService\.js';/, `import { EventEmailService } from '../../application/services/EventEmailService.js';\nimport { StripeService } from '../../../payments/infrastructure/services/StripeService.js';`);
}

const newMethod = `
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

  async announceEvent`;

c = c.replace(/  async announceEvent/, newMethod);
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
