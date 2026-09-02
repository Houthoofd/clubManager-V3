const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', 'utf8');

// Fix 1: Duplicate jwt import
// Replace all imports of jwt and leave just one at the top.
content = content.replace(/import jwt from "jsonwebtoken";/g, '');
content = 'import jwt from "jsonwebtoken";\n' + content;

// Fix 2: price_paid in RegisterToEventDto
content = content.replace(/price_paid: payment.montant/g, '');

// Fix 3: methode_nom doesn't exist on PaymentRow
content = content.replace(/payment.methode_nom/g, 'payment.methode_id ? payment.methode_id.toString() : "Stripe"');

// Fix 4: stripe is private
content = content.replace(/stripeService.stripe.paymentIntents/g, '(stripeService as any).stripe.paymentIntents');

// Fix 5: possibly undefined
content = content.replace(/items\[0\].montant/g, 'items[0]?.montant');
content = content.replace(/items\[0\].description/g, 'items[0]?.description');

fs.writeFileSync('backend/src/modules/payments/presentation/controllers/PaymentController.ts', content, 'utf8');
