import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getQuickPayData, createPublicStripeIntent, QuickPayItem } from "../api/paymentsApi";
import { StripePaymentModal } from "../components/StripePaymentModal";
import { formatCurrency } from "../../../shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function QuickPayPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
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

    getQuickPayData(token)
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        setError("Ce lien est invalide ou expirÃ©.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handlePay = async (item: QuickPayItem) => {
    if (!token) return;
    try {
      const intent = await createPublicStripeIntent({
        token,
        montant: item.montant,
        commande_id: item.type === "boutique" ? item.id : null,
        echeance_id: item.type === "cotisation" ? item.id : null,
        description: item.description,
      });
      setSelectedItem(item);
      setStripeClientSecret(intent.client_secret);
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