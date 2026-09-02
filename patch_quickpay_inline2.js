const fs = require('fs');

let pagePath = 'frontend/src/features/payments/pages/QuickPayPage.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(/import \{ StripePaymentModal \} from "\.\.\/components\/StripePaymentModal";/, 
`import { StripeCheckoutForm, stripePromise } from "../components/StripePaymentModal";
import { Elements } from "@stripe/react-stripe-js";`);

// Use regex to replace the entire StripePaymentModal block
pageContent = pageContent.replace(/\{stripeOpen[\s\S]*?<StripePaymentModal[\s\S]*?\/>\s*\)\}/, 
`{stripeOpen && stripeClientSecret && selectedItem && stripePromise && (
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
      )}`);

fs.writeFileSync(pagePath, pageContent, 'utf8');
