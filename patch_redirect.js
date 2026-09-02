const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');

// Add useNavigate import
if (!content.includes('useNavigate')) {
  content = content.replace('import { useSearchParams } from "react-router-dom";', 'import { useSearchParams, useNavigate } from "react-router-dom";');
}

// Add navigate instance
if (!content.includes('const navigate = useNavigate();')) {
  content = content.replace('const [searchParams] = useSearchParams();', 'const [searchParams] = useSearchParams();\n  const navigate = useNavigate();');
}

// Patch handleSuccess
const oldHandleSuccess = `  const handleSuccess = () => {
    setStripeOpen(false);
    setStripeClientSecret(null);
    setPaymentSuccess(true);
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
    }
  };`;

const newHandleSuccess = `  const handleSuccess = () => {
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

content = content.replace(oldHandleSuccess, newHandleSuccess);

// Patch paymentIntent success
const oldIntentSuccess = `        .then(() => {
          toast.success("Paiement validé avec succès !");
          searchParams.delete("payment_intent");
          searchParams.delete("payment_intent_client_secret");
          searchParams.delete("redirect_status");
          fetchOrders();
        })`;

const newIntentSuccess = `        .then(() => {
          toast.success("Paiement validé avec succès !");
          searchParams.delete("payment_intent");
          searchParams.delete("payment_intent_client_secret");
          searchParams.delete("redirect_status");
          
          if (filterType === "evenement") {
            setPaymentSuccess(true);
            setTimeout(() => {
              navigate(\`/events/\${filterId}\`);
            }, 2500);
          } else {
            fetchOrders();
          }
        })`;

content = content.replace(oldIntentSuccess, newIntentSuccess);

fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', content, 'utf8');
