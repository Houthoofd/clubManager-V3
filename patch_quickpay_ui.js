const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');

// Replace everything from `return (` to the end of the file.
const returnIndex = content.indexOf('  return (\n');
if (returnIndex !== -1) {
    const replacement = `  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Paiement Rapide</h1>
        
        {import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith("pk_test_") && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong className="font-semibold block mb-1">🛠 Mode Test Activé</strong>
            Utilisez la fausse carte de test ci-dessous pour simuler un paiement réussi :
            <ul className="mt-2 space-y-1 list-disc list-inside text-yellow-700">
              <li><strong>Carte :</strong> <span className="font-mono bg-yellow-100 px-1 py-0.5 rounded">4242 4242 4242 4242</span></li>
              <li><strong>Date d'expiration :</strong> <span className="font-mono bg-yellow-100 px-1 py-0.5 rounded">12/30</span> (ou n'importe quelle date future)</li>
              <li><strong>CVC :</strong> <span className="font-mono bg-yellow-100 px-1 py-0.5 rounded">123</span></li>
            </ul>
          </div>
        )}

        {stripeOpen && stripeClientSecret && selectedItem && stripePromise ? (
          <div className="mt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 mb-6">
              <div>
                <h3 className="font-medium text-gray-900">{selectedItem.description}</h3>
                <p className="text-sm text-gray-500">{selectedItem.type === "cotisation" ? "Cotisation" : selectedItem.type === "evenement" ? "Événement" : "Boutique"}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedItem.montant)}</span>
                <button onClick={() => setStripeOpen(false)} className="text-sm text-gray-500 hover:text-gray-700 underline">Annuler</button>
              </div>
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
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Vous n'avez aucun paiement en attente.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={\`\${item.type}-\${item.id}\`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">{item.description}</h3>
                  <p className="text-sm text-gray-500">{item.type === "cotisation" ? "Cotisation" : item.type === "evenement" ? "Événement" : "Boutique"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(item.montant)}</span>
                  <button
                    onClick={() => handlePay(item)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Payer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
    content = content.substring(0, returnIndex) + replacement;
    fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', content, 'utf8');
} else {
    console.log("Could not find return statement");
}
