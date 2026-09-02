const fs = require('fs');
let modal = fs.readFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', 'utf8');

const target = `  const handleSuccess = useCallback(() => {
    onSuccess(paymentIntent?.id);
    onClose();
  }, [onSuccess, onClose]);`;

const replacement = `  const handleSuccess = useCallback((paymentIntentId?: string) => {
    onSuccess(paymentIntentId);
    onClose();
  }, [onSuccess, onClose]);`;

modal = modal.replace(/\r\n/g, '\n');
modal = modal.replace(target, replacement);

fs.writeFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', modal, 'utf8');
console.log('Fixed handleSuccess in StripePaymentModal');
