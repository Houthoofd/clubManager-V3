const fs = require('fs');
let c = fs.readFileSync('frontend/src/features/events/hooks/useEvents.ts', 'utf8');

c = c.replace(/mutationFn: \(\{ eventId, userId \}: \{ eventId: number, userId: number \}\) =>\s*eventsService.registerToEvent\(eventId, userId\),/s, `mutationFn: ({ eventId, userId, paymentIntentId }: { eventId: number, userId: number, paymentIntentId?: string }) => 
      eventsService.registerToEvent(eventId, userId, paymentIntentId),`);

fs.writeFileSync('frontend/src/features/events/hooks/useEvents.ts', c, 'utf8');
