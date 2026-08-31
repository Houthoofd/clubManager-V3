import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getQuickPayData, createPublicStripeIntent, QuickPayItem } from "../api/paymentsApi";
import { formatCurrency } from "../../../shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button } from "../../../shared/components";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise: Promise<Stripe | null> | null = stripePublicKey ? loadStripe(stripePublicKey) : null;

const InlineStripeForm: React.FC<{
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message ?? "Erreur lors du paiement");
        setIsLoading(false);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Erreur lors du paiement");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-white rounded-lg border shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Paiement sécurisé par carte bancaire</h3>
      <PaymentElement options={{ layout: "tabs" }} />
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded text-sm">{errorMessage}</div>
      )}
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={!stripe || !elements || isLoading}>
          {isLoading ? "Traitement en cours..." : `Confirmer le paiement de ${formatCurrency(amount)}`}
        </Button>
      </div>
    </form>
  );
};

export function QuickPayPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslation();

  const [items, setItems] = useState<QuickPayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Lien de paiement invalide.");
      setLoading(false);
      return;
    }

    getQuickPayData(token)
      .then(setItems)
      .catch(() => setError("Ce lien est invalide ou expiré."))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePayClick = async (item: QuickPayItem) => {
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
      setStripeClientSecret(intent.client_secret || intent.clientSecret);
    } catch (err) {
      toast.error("Erreur lors de l'initialisation du paiement.");
    }
  };

  const handleSuccess = () => {
    setStripeClientSecret(null);
    toast.success("Paiement réalisé avec succès !");
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
      setSelectedItem(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Chargement...</div>;
  if (error) return <div className="text-center p-12 text-red-600 font-medium">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Paiement Rapide</h1>
        
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Vous n'avez aucun paiement en attente.</div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              const isSelected = selectedItem?.id === item.id && selectedItem?.type === item.type;
              return (
                <div key={`${item.type}-${item.id}`} className="transition-all">
                  <div className={`flex items-center justify-between p-4 border rounded-lg ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'}`}>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.description}</h3>
                      <p className="text-sm text-gray-500">{item.type === "cotisation" ? "Cotisation" : "Boutique"}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(item.montant)}</span>
                      {!stripeClientSecret && (
                        <button
                          onClick={() => handlePayClick(item)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Payer
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Stripe Form if this item is clicked */}
                  {isSelected && stripeClientSecret && stripePromise && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeClientSecret,
                        appearance: { theme: "stripe", variables: { colorPrimary: '#4f46e5' } },
                        locale: "fr"
                      }}
                    >
                      <InlineStripeForm 
                        amount={item.montant} 
                        onSuccess={handleSuccess} 
                        onCancel={() => {
                          setStripeClientSecret(null);
                          setSelectedItem(null);
                        }} 
                      />
                    </Elements>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
