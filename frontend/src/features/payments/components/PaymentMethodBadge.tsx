/**
 * PaymentMethodBadge
 * Badge coloré affichant la méthode de paiement avec une icône emoji.
 */

import { PaymentMethod, PAYMENT_METHOD_LABELS } from '@clubmanager/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethodBadgeProps {
  methode?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const methodConfig: Record<string, { label: string; icon: string; className: string }> = {
  [PaymentMethod.STRIPE]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.STRIPE],
    icon: '💳',
    className: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
  },
  [PaymentMethod.ESPECES]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.ESPECES],
    icon: '💵',
    className: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  },
  [PaymentMethod.VIREMENT]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.VIREMENT],
    icon: '🏦',
    className: 'bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200',
  },
  [PaymentMethod.AUTRE]: {
    label: PAYMENT_METHOD_LABELS[PaymentMethod.AUTRE],
    icon: '🔖',
    className: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * PaymentMethodBadge — Affiche la méthode de paiement sous forme de badge coloré avec emoji.
 *
 * - stripe   → bleu   💳
 * - especes  → vert   💵
 * - virement → indigo 🏦
 * - autre    → gris   🔖
 * - inconnu  → gris
 */
export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ methode }) => {
  const config = methode ? methodConfig[methode] : null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.className ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
      }`}
    >
      {config ? (
        <>
          <span aria-hidden="true">{config.icon}</span>
          {config.label}
        </>
      ) : (
        methode ?? 'Inconnu'
      )}
    </span>
  );
};
