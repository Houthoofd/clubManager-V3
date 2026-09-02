const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', 'utf8');
content = content.replace('const StripeCheckoutFormActions: React.FC<{', 'export const StripeCheckoutFormActions: React.FC<{');
fs.writeFileSync('frontend/src/features/payments/components/StripePaymentModal.tsx', content, 'utf8');

let pageContent = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');
pageContent = pageContent.replace('import { StripeCheckoutForm, stripePromise } from "../components/StripePaymentModal";', 'import { StripeCheckoutForm, StripeCheckoutFormActions, stripePromise } from "../components/StripePaymentModal";');

pageContent = pageContent.replace('<StripeCheckoutForm\n                amount={selectedItem.montant}\n                onSuccess={handleSuccess}\n                onClose={() => setStripeOpen(false)}\n              />\n            </Elements>',
`<StripeCheckoutForm
                amount={selectedItem.montant}
                onSuccess={handleSuccess}
                onClose={() => setStripeOpen(false)}
              />
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                 <StripeCheckoutFormActions amount={selectedItem.montant} onClose={() => setStripeOpen(false)} />
              </div>
            </Elements>`);

fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', pageContent, 'utf8');
