/**
 * PaymentMethodBadge
 * Badge coloré affichant la méthode de paiement avec une icône SVG.
 */

import { PaymentMethod, PAYMENT_METHOD_LABELS } from "@clubmanager/types";

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

const CreditCardIcon = () => (
  <svg
    className="h-3.5 w-3.5 flex-shrink-0"
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
);

const BanknotesIcon = () => (
  <svg
    className="h-3.5 w-3.5 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
    />
  </svg>
);

const BuildingLibraryIcon = () => (
  <svg
    className="h-3.5 w-3.5 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
    />
  </svg>
);

const TagIcon = () => (
  <svg
    className="h-3.5 w-3.5 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6Z"
    />
  </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethodBadgeProps {
  methode?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const methodConfig: Record<
  string,
  { label: string; Icon: () => JSX.Element; className: string }
> = {
  [PaymentMethod.STRIPE]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.STRIPE],
    Icon: CreditCardIcon,
    className: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  },
  [PaymentMethod.ESPECES]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.ESPECES],
    Icon: BanknotesIcon,
    className: "bg-green-100 text-green-800 ring-1 ring-green-200",
  },
  [PaymentMethod.VIREMENT]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.VIREMENT],
    Icon: BuildingLibraryIcon,
    className: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
  },
  [PaymentMethod.AUTRE]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.AUTRE],
    Icon: TagIcon,
    className: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * PaymentMethodBadge — Affiche la méthode de paiement sous forme de badge coloré avec icône SVG.
 *
 * - stripe   → bleu   + icône carte bancaire
 * - especes  → vert   + icône billets
 * - virement → indigo + icône établissement bancaire
 * - autre    → gris   + icône étiquette
 */
export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({
  methode,
}) => {
  const config = methode ? methodConfig[methode] : null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.className ?? "bg-gray-100 text-gray-700 ring-1 ring-gray-200"
      }`}
    >
      {config ? (
        <>
          <config.Icon />
          {config.label}
        </>
      ) : (
        (methode ?? "Inconnu")
      )}
    </span>
  );
};
