import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getQuickPayData, createPublicStripeIntent, QuickPayItem, verifyPublicPayment } from "../api/paymentsApi";
import { formatCurrency } from "../../../shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Button } from "../../../shared/components/Button";


const SuccessAnimation = () => (
  <div className="flex justify-center items-center my-8">
    <div className="relative w-24 h-24">
      <svg className="animate-[scale_0.3s_ease-in-out_forwards]" viewBox="0 0 52 52">
        <circle className="animate-[stroke_0.6s_cubic-bezier(0.65,0,0.45,1)_forwards] stroke-green-500 fill-none" cx="26" cy="26" r="25" strokeWidth="2" strokeDasharray="166" strokeDashoffset="166"/>
        <path className="animate-[stroke_0.3s_cubic-bezier(0.65,0,0.45,1)_0.6s_forwards] stroke-green-500 fill-none" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="2" strokeDasharray="48" strokeDashoffset="48"/>
      </svg>
      <style>{`
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
      `}</style>
    </div>
  </div>
);

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise: Promise<Stripe | null> | null = stripePublicKey ? loadStripe(stripePublicKey) : null;

function InlineStripeCheckout({ amount, onSuccess, onCancel }: { amount: number, onSuccess: () => void, onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: 'if_required',
    });

    if (error) {
      toast.error(error.message || "Erreur lors du paiement");
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={!stripe}>
          Confirmer le paiement de {formatCurrency(amount)}
        </Button>
      </div>
    </form>
  );
}

export function QuickPayPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const redirectStatus = searchParams.get("redirect_status");
  const { t } = useTranslation();

  const [items, setItems] = useState<QuickPayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (redirectStatus === "succeeded") {
      toast.success("Paiement réalisé avec succès !");
      setLoading(false);
      return;
    }

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
        setError("Ce lien est invalide ou expiré.");
      })
      .finally(() => setLoading(false));
  }, [token, redirectStatus]);

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
      setStripeClientSecret((intent as any).clientSecret || (intent as any).client_secret);
    } catch (err) {
      toast.error("Erreur lors de l'initialisation du paiement.");
    }
  };

  const handleSuccess = () => {
    setStripeClientSecret(null);
    toast.success("Paiement réalisé avec succès !");
    if (selectedItem) {
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
    }
    setSelectedItem(null);
  };

  const handleCancel = () => {
    setStripeClientSecret(null);
    setSelectedItem(null);
  };

  if (loading) {
    return <div className="flex justify-center p-12">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center p-12 text-red-600 font-medium">{error}</div>;
  }

  if (redirectStatus === "succeeded") {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 text-center">
        <div className="bg-white shadow rounded-lg p-12">
          <h1 className="text-2xl font-bold text-green-600 mb-4">Merci !</h1>
          <p className="text-gray-600">Votre paiement a été traité avec succès.</p>
        </div>
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = stripeClientSecret ? {
    clientSecret: stripeClientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#111827",
        colorDanger: "#dc2626",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
        borderRadius: "8px",
        spacingUnit: "4px",
      },
    },
    locale: "fr",
  } : {};

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

        {!stripeClientSecret && items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            {showSuccess ? (
              <div className="flex flex-col items-center">
                <SuccessAnimation />
                <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">Paiement rÃ©ussi !</h2>
                <p className="text-gray-600">Un reÃ§u vous sera envoyÃ© par email.</p>
              </div>
            ) : "Vous n'avez aucun paiement en attente."}
          </div>
        ) : null}

        {!stripeClientSecret && items.length > 0 ? (
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
        ) : null}

        {stripeClientSecret && selectedItem && stripePromise && (
          <div>
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Détails du paiement</h2>
              <div className="mt-2 flex justify-between items-center text-gray-600">
                <span>{selectedItem.description}</span>
                <span className="font-bold text-gray-900">{formatCurrency(selectedItem.montant)}</span>
              </div>
            </div>
            <Elements stripe={stripePromise} options={elementsOptions}>
              <InlineStripeCheckout 
                amount={selectedItem.montant} 
                onSuccess={handleSuccess} 
                onCancel={handleCancel}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
