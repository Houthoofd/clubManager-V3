const fs = require('fs');

// Patch StripePaymentModal.tsx
let modal = fs.readFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', 'utf8');
modal = modal.replace(/onSuccess: \(\) => void;/g, 'onSuccess: (paymentIntentId?: string) => void;');
modal = modal.replace(/onSuccess\(\);/g, 'onSuccess(paymentIntent?.id);');
fs.writeFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', modal, 'utf8');

// Patch QuickPayPage.tsx
let quickPay = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');
const oldHandleSuccess = `  const handleSuccess = () => {
    setStripeOpen(false);
    setStripeClientSecret(null);
    setPaymentSuccess(true);
    
    const isEvent = selectedItem?.type === "evenement";
    const itemId = selectedItem?.id;

    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
    }

    if (isEvent && itemId) {
      setTimeout(() => {
        navigate(\`/events/\${itemId}\`);
      }, 2500);
    }
  };`;

const newHandleSuccess = `  const handleSuccess = (paymentIntentId?: string) => {
    setStripeOpen(false);
    setStripeClientSecret(null);

    const isEvent = selectedItem?.type === "evenement";
    const itemId = selectedItem?.id;

    if (paymentIntentId && selectedItem) {
      verifyPublicPayment(token, paymentIntentId, selectedItem.type as any, selectedItem.id)
        .then(() => {
          setPaymentSuccess(true);
          if (selectedItem) {
            setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
          }
          if (isEvent && itemId) {
            setTimeout(() => {
              navigate(\`/events/\${itemId}\`);
            }, 2500);
          }
        })
        .catch((err) => {
          console.error("Failed to verify payment via frontend:", err);
          toast.error("Erreur lors de la validation du paiement.");
        });
    } else {
      // Fallback si pas d'ID
      setPaymentSuccess(true);
      if (selectedItem) {
        setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
      }
      if (isEvent && itemId) {
        setTimeout(() => {
          navigate(\`/events/\${itemId}\`);
        }, 2500);
      }
    }
  };`;

// Also patch the old QuickPayPage if CRLF
quickPay = quickPay.replace(/\r\n/g, '\n');
if (quickPay.includes(oldHandleSuccess)) {
    quickPay = quickPay.replace(oldHandleSuccess, newHandleSuccess);
    fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', quickPay, 'utf8');
    console.log('Frontend patched.');
} else {
    console.log('Could not find oldHandleSuccess in QuickPayPage.tsx');
}
