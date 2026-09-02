const fs = require('fs');

let modalPath = 'frontend/src/features/payments/components/StripePaymentModal.tsx';
let modalContent = fs.readFileSync(modalPath, 'utf8');
modalContent = modalContent.replace(/const stripePromise/, 'export const stripePromise');
modalContent = modalContent.replace(/const StripeCheckoutForm/, 'export const StripeCheckoutForm');
fs.writeFileSync(modalPath, modalContent, 'utf8');

let pagePath = 'frontend/src/features/payments/pages/QuickPayPage.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = pageContent.replace(/import \{ StripePaymentModal \} from "\.\.\/components\/StripePaymentModal";/, 
`import { StripeCheckoutForm, stripePromise } from "../components/StripePaymentModal";
import { Elements } from "@stripe/react-stripe-js";`);

// Find the modal rendering block and replace it
const modalBlockStart = `{stripeOpen && stripeClientSecret && selectedItem && (`;
const modalBlockEnd = `/>\n      )}`;
const replacement = `{stripeOpen && stripeClientSecret && selectedItem && stripePromise && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="mb-4 pb-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Finaliser le paiement de {formatCurrency(selectedItem.montant)}</h3>
            <button onClick={() => setStripeOpen(false)} className="text-gray-400 hover:text-gray-600">Annuler</button>
          </div>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeClientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <StripeCheckoutForm
              amount={selectedItem.montant}
              onSuccess={handleSuccess}
              onClose={() => setStripeOpen(false)}
            />
          </Elements>
        </div>
      )}`;

// We need to be careful with regex replacement of multiline blocks.
let startIdx = pageContent.indexOf(modalBlockStart);
if (startIdx !== -1) {
  let endIdx = pageContent.indexOf(')}', startIdx + modalBlockStart.length + 50); // find the closing )}
  if (endIdx !== -1) {
     pageContent = pageContent.substring(0, startIdx) + replacement + pageContent.substring(endIdx + 2);
  }
}

// In handlePay we should also probably hide the regular item list if they chose to pay, or just render it below.
fs.writeFileSync(pagePath, pageContent, 'utf8');
