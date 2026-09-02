const fs = require('fs');
let c = fs.readFileSync('backend/src/modules/events/presentation/routes/eventRoutes.ts', 'utf8');
c = c.replace(/export default router;/, "router.post('/:id/create-payment-intent', authenticate, controller.createPaymentIntent);\n\nexport default router;");
fs.writeFileSync('backend/src/modules/events/presentation/routes/eventRoutes.ts', c, 'utf8');
