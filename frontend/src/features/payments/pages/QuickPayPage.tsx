import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getQuickPayData, createPublicStripeIntent, verifyPublicPayment, QuickPayItem } from "../api/paymentsApi";
import { StripePaymentModal } from "../components/StripePaymentModal";
import { formatCurrency } from "../../../shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function QuickPayPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const filterType = searchParams.get("type");
  const filterId = searchParams.get("id");
  const { t } = useTranslation();

  const [items, setItems] = useState<QuickPayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripeOpen, setStripeOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);

    useEffect(() => {
    if (!token) {
      setError("Lien de paiement invalide.");
      setLoading(false);
      return;
    }

    const paymentIntent = searchParams.get("payment_intent");

    const fetchOrders = () => {
      getQuickPayData(token, filterType, filterId)
        .then((data) => {
          setItems(data);
        })
        .catch((err) => {
          setError("Ce lien est invalide ou expiré.");
        })
        .finally(() => setLoading(false));
    };

    if (paymentIntent && filterType && filterId) {
      // Un paiement vient d'être redirigé par Stripe
      verifyPublicPayment(token, paymentIntent, filterType as any, Number(filterId))
        .then(() => {
          toast.success("Paiement validé avec succès !");
          searchParams.delete("payment_intent");
          searchParams.delete("payment_intent_client_secret");
          searchParams.delete("redirect_status");
          fetchOrders();
        })
        .catch((err) => {
          console.error("Verification failed", err);
          fetchOrders();
        });
    } else {
      fetchOrders();
    }
  }, [token, filterType, filterId]);

  const handlePay = async (item: QuickPayItem) => {
    if (!token) return;
    try {
      const intent = await createPublicStripeIntent({
          token,
          item_type: item.type,
          item_id: item.id
        } as any);
      setSelectedItem(item);
      setStripeClientSecret((intent as any).clientSecret || (intent as any).client_secret);
      setStripeOpen(true);
    } catch (err) {
      toast.error("Erreur lors de l'initialisation du paiement.");
    }
  };

  const handleSuccess = () => {
    setStripeOpen(false);
    setStripeClientSecret(null);
    toast.success("Paiement rÃ©alisÃ© avec succÃ¨s !");
    // Mettre Ã  jour la liste en retirant l'item payÃ©
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-600 font-medium">{error}</div>;
  }

  return (
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

        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Vous n'avez aucun paiement en attente.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-medium text-gray-900">{item.description}</h3>
                  <p className="text-sm text-gray-500">{item.type === "cotisation" ? "Cotisation" : "Boutique"}</p>
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

      {stripeOpen && stripeClientSecret && selectedItem && (
        <StripePaymentModal
          isOpen={stripeOpen}
          onClose={() => setStripeOpen(false)}
          onSuccess={handleSuccess}
          clientSecret={stripeClientSecret}
          amount={selectedItem.montant}
        />
      )}
    </div>
  );
}