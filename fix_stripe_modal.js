const fs = require('fs');

let modal = fs.readFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', 'utf8');
modal = modal.replace(
  'const { error } = await stripe.confirmPayment({',
  'const { error, paymentIntent } = await stripe.confirmPayment({'
);
fs.writeFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', modal, 'utf8');

console.log('StripePaymentModal patched.');
