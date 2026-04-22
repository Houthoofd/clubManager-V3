/**
 * StripePaymentModal
 * Modal de paiement par carte bancaire via Stripe Elements.
 * Nécessite VITE_STRIPE_PUBLIC_KEY dans les variables d'environnement.
 */

import { useState, useCallback } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Modal, Button } from "../../../shared/components";

// ─── Clé publique Stripe ──────────────────────────────────────────────────────

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as
  | string
  | undefined;
const stripePromise: Promise<Stripe | null> | null = stripePublicKey
  ? loadStripe(stripePublicKey)
  : null;

// ─── Types ────────────────────────────────────────────────────────────────────

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientSecret: string;
  amount: number;
}

// ─── Formulaire interne Stripe ────────────────────────────────────────────────

interface StripeCheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  amount,
  onSuccess,
  onClose,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // On reste sur la même page après la confirmation
          return_url: window.location.href,
        },
        // Si le paiement n'exige pas de redirection, on reste dans la modal
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(
          error.message ?? "Une erreur est survenue lors du paiement.",
        );
        setIsLoading(false);
      } else {
        // Paiement confirmé sans redirection
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  const amountFormatted = (amount / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <form
      id="stripe-payment-form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* ── Stripe PaymentElement ── */}
      <div className="min-h-[180px]">
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: "tabs",
          }}
        />
        {!isReady && (
          <div className="flex items-center justify-center py-10 gap-2 text-gray-400 text-sm">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Chargement du formulaire de paiement…
          </div>
        )}
      </div>

      {/* ── Message d'erreur ── */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* ── Message de sécurité ── */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        Paiement sécurisé par Stripe — vos données sont chiffrées
      </div>

      {/* ── Actions (dans Modal.Footer) ── */}
      <div className="hidden" id="stripe-form-actions">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={!stripe || !elements || isLoading || !isReady}
        >
          Payer {amountFormatted}
        </Button>
      </div>
    </form>
  );
};

// ─── Modal d'erreur - Clé Stripe manquante ────────────────────────────────────

const StripeKeyMissingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <Modal.Header
        title="Configuration Stripe manquante"
        subtitle="Paiement par carte indisponible"
        showCloseButton
        onClose={onClose}
      />

      <Modal.Body>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0
                   2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                   0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              Variable d'environnement requise
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          La variable d'environnement{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-red-700">
            VITE_STRIPE_PUBLIC_KEY
          </code>{" "}
          n'est pas définie.
        </p>
        <p className="text-sm text-gray-500">
          Ajoutez cette clé dans votre fichier{" "}
          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
            .env
          </code>{" "}
          pour activer les paiements par carte bancaire.
        </p>
      </Modal.Body>

      <Modal.Footer align="right">
        <Button type="button" variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

/**
 * StripePaymentModal — Modal de paiement Stripe.
 *
 * Pré-requis :
 *   - `VITE_STRIPE_PUBLIC_KEY` doit être défini dans les variables d'environnement.
 *   - `clientSecret` doit provenir d'un Payment Intent créé côté backend.
 *
 * Affiche un message d'erreur explicite si la clé publique Stripe est absente.
 */
export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientSecret,
  amount,
}) => {
  const handleSuccess = useCallback(() => {
    onSuccess();
    onClose();
  }, [onSuccess, onClose]);

  // ── Clé Stripe absente ────────────────────────────────────────────────────
  if (!stripePublicKey || !stripePromise) {
    return <StripeKeyMissingModal isOpen={isOpen} onClose={onClose} />;
  }

  // ── Options Elements ──────────────────────────────────────────────────────
  const elementsOptions: StripeElementsOptions = {
    clientSecret,
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
  };

  const amountFormatted = (amount / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      {/* ── Header avec logo Stripe ── */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Stripe-like */}
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Paiement sécurisé
              </h2>
              <p className="text-sm text-gray-500">
                Montant :{" "}
                <span className="font-medium text-gray-800">
                  {amountFormatted}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
                       transition-colors"
            aria-label="Fermer"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body avec Stripe Elements ── */}
      <Modal.Body>
        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripeCheckoutForm
            amount={amount}
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        </Elements>
      </Modal.Body>

      {/* ── Footer avec actions du formulaire ── */}
      <Modal.Footer align="right">
        <Elements stripe={stripePromise} options={elementsOptions}>
          <StripeCheckoutFormActions amount={amount} onClose={onClose} />
        </Elements>
      </Modal.Footer>
    </Modal>
  );
};

// ─── Actions du formulaire (séparées pour utiliser les hooks Stripe) ──────────

const StripeCheckoutFormActions: React.FC<{
  amount: number;
  onClose: () => void;
}> = ({ amount, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();

  const amountFormatted = (amount / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <>
      <Button type="button" variant="outline" onClick={onClose}>
        Annuler
      </Button>
      <Button
        type="submit"
        form="stripe-payment-form"
        variant="primary"
        disabled={!stripe || !elements}
      >
        Payer {amountFormatted}
      </Button>
    </>
  );
};
