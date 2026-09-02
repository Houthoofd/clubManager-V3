const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

const newMethod = `
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
  }`;

c = c.replace(/  async registerToEvent\([\s\S]*?async cancelRegistration/m, newMethod + '\n\n  async cancelRegistration');
fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
