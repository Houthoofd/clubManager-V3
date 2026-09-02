const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', 'utf8');

if (!c.includes('import { StripeService }')) {
  c = `import { StripeService } from '../../../payments/infrastructure/services/StripeService.js';\n` + c;
}

fs.writeFileSync('backend/src/modules/events/presentation/controllers/EventController.ts', c, 'utf8');
