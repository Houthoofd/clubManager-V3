const fs = require('fs');
const filePath = 'backend/src/modules/payments/presentation/routes/paymentRoutes.ts';
let routes = fs.readFileSync(filePath, 'utf8');

const target = 'paymentCtrl.createPublicStripeIntent(req, res)\n);';
const replacement = `paymentCtrl.createPublicStripeIntent(req, res)
);

router.post(
  "/stripe/public/verify",
  express.json(),
  (req, res) => paymentCtrl.verifyPublicPayment(req, res)
);`;

if (routes.includes(target)) {
    routes = routes.replace(target, replacement);
    fs.writeFileSync(filePath, routes, 'utf8');
    console.log('paymentRoutes.ts patched successfully.');
} else {
    // try with windows line endings
    const targetWin = 'paymentCtrl.createPublicStripeIntent(req, res)\r\n);';
    if (routes.includes(targetWin)) {
        routes = routes.replace(targetWin, replacement);
        fs.writeFileSync(filePath, routes, 'utf8');
        console.log('paymentRoutes.ts patched successfully.');
    } else {
        console.log('Could not find target in paymentRoutes.ts');
    }
}
