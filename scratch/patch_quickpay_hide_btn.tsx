import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getQuickPayData, createPublicStripeIntent, QuickPayItem } from "../api/paymentsApi";
import { formatCurrency } from "../../../shared/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe } from "@stripe/stripe-js";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripePromise: Promise<Stripe | null> | null = stripePublicKey ? loadStripe(stripePublicKey) : null;

const SuccessAnimation: React.FC<{ message: string; onClose?: () => void }> = ({ message, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-in fade-in zoom-in duration-500">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-pulse"></div>
        <svg className="relative z-10 w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path strokeDasharray="60" strokeDashoffset="60" className="animate-[dash_1s_ease-out_forwards]" d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Paiement validé !</h3>
      <p className="text-gray-500 text-center text-lg mb-8">{message}</p>
      {onClose && (
        <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Fermer
        </button>
      )}
      <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
};

const InlineStripeForm: React.FC<{ amount: number; onSuccess: () => void; onCancel: () => void; }> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // On traque le type de moyen de paiement sélectionné pour cacher notre bouton bleu si Stripe fournit le sien (Link, Apple Pay...)
  const [paymentMethodType, setPaymentMethodType] = useState<string>("card");

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
    <form onSubmit={handleSubmit} className="mt-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm relative">
      <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" title="Annuler">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 className="text-lg font-medium text-gray-900 mb-6 pr-8">Paiement sécurisé</h3>
      
      {/* Utilisation des tabs classiques (qui est le layout par défaut) car l'accordion enferme parfois trop l'UI */}
      <PaymentElement 
        options={{ layout: "tabs" }} 
        onChange={(e) => {
          if (e.value.type) {
            setPaymentMethodType(e.value.type);
          }
        }}
      />
      
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">{errorMessage}</div>
      )}
      
      {/* Si l'utilisateur sélectionne 'link' (ou un autre wallet qui a son propre bouton), on cache notre bouton bleu pour éviter la duplication */}
      {paymentMethodType !== "link" && (
        <div className="mt-6">
          <button 
            type="submit" 
            disabled={!stripe || !elements || isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Traitement en cours..." : `Confirmer le paiement de ${formatCurrency(amount)}`}
          </button>
        </div>
      )}
    </form>
  );
};

export function QuickPayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const redirectStatus = searchParams.get("redirect_status");
  const { t } = useTranslation();

  const [items, setItems] = useState<QuickPayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<QuickPayItem | null>(null);
  const [showSuccessFor, setShowSuccessFor] = useState<{ amount: number; description: string } | null>(null);

  useEffect(() => {
    if (redirectStatus === "succeeded") {
      setShowSuccessFor({ amount: 0, description: "Votre paiement" });
      searchParams.delete("payment_intent");
      searchParams.delete("payment_intent_client_secret");
      searchParams.delete("redirect_status");
      setSearchParams(searchParams, { replace: true });
    } else if (redirectStatus === "failed") {
      toast.error("Le paiement a échoué. Veuillez réessayer.");
    }
  }, [redirectStatus, searchParams, setSearchParams]);

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
    if (selectedItem) {
      setShowSuccessFor({ amount: selectedItem.montant, description: selectedItem.description });
      setItems(items.filter(i => i.id !== selectedItem.id || i.type !== selectedItem.type));
      setSelectedItem(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Chargement...</div>;
  if (error) return <div className="text-center p-12 text-red-600 font-medium">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow rounded-lg p-6 overflow-hidden relative">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Paiement Rapide</h1>
        
        {showSuccessFor ? (
          <SuccessAnimation 
            message={`Merci, le règlement pour ${showSuccessFor.description} a bien été enregistré.`}
            onClose={() => setShowSuccessFor(null)} 
          />
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Tout est en ordre !</h2>
            <p className="text-gray-500">Vous n'avez aucun paiement en attente. Merci de votre confiance.</p>
          </div>
        ) : (
          <div className="space-y-6 relative">
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

                  {isSelected && stripeClientSecret && stripePromise && (
                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret: stripeClientSecret,
                        appearance: { 
                          theme: "stripe",
                          variables: { colorPrimary: '#4f46e5', borderRadius: '8px' } 
                        },
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
