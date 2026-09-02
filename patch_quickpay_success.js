const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', 'utf8');

// Add state
content = content.replace('const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);', 'const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);\n  const [paymentSuccess, setPaymentSuccess] = useState(false);');

// Change handleSuccess
content = content.replace('  const handleSuccess = () => {\n    setStripeOpen(false);\n    setStripeClientSecret(null);\n    toast.success("Paiement réalisé avec succès !");\n    if (selectedItem) {\n      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));\n    }\n  };',
`  const handleSuccess = () => {
    setStripeOpen(false);
    setStripeClientSecret(null);
    setPaymentSuccess(true);
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
    }
  };`);
  
// Import CheckCircleIcon
if (!content.includes('CheckCircleIcon')) {
  content = content.replace('import { useTranslation } from "react-i18next";', 'import { useTranslation } from "react-i18next";\nimport { CheckCircleIcon } from "@heroicons/react/24/outline";');
}

// Add success view
content = content.replace(`        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Vous n'avez aucun paiement en attente.
          </div>
        ) : (`,
`        ) : paymentSuccess ? (
          <div className="text-center py-12 animate-in zoom-in duration-500">
            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement réussi !</h2>
            <p className="text-gray-500 mb-8">Merci, votre paiement a bien été pris en compte.</p>
            {items.length > 0 && (
               <button onClick={() => setPaymentSuccess(false)} className="text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 bg-indigo-50 rounded-lg">Voir les autres paiements en attente</button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Vous n'avez aucun paiement en attente.
          </div>
        ) : (`);

fs.writeFileSync('frontend/src/features/payments/pages/QuickPayPage.tsx', content, 'utf8');
