const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/api/eventsService.ts', 'utf8');

c = c.replace(/registerToEvent: async \(eventId: number, userId: number\): Promise<any> => \{/, `registerToEvent: async (eventId: number, userId: number, payment_intent_id?: string): Promise<any> => {
    const response = await api.post("/events/register", { event_id: eventId, user_id: userId, payment_intent_id });
    return response.data;
  },

  createPaymentIntent: async (eventId: number): Promise<{ clientSecret: string; paymentIntentId: string }> => {
    const response = await api.post(\`/events/\${eventId}/create-payment-intent\`);
    return response.data;
  },

  dummy_replacement: async (eventId: number, userId: number): Promise<any> => {`);
c = c.replace(/dummy_replacement.*\}\,/s, '');

fs.writeFileSync('frontend/src/features/events/api/eventsService.ts', c, 'utf8');
