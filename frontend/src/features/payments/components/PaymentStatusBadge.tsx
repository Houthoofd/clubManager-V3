/**
 * PaymentStatusBadge
 * Badge coloré affichant le statut d'un paiement.
 */

import { PaymentStatus, PAYMENT_STATUS_LABELS } from '@clubmanager/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  statut?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  [PaymentStatus.EN_ATTENTE]: {
    label: PAYMENT_STATUS_LABELS[PaymentStatus.EN_ATTENTE],
    className: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  },
  [PaymentStatus.VALIDE]: {
    label: PAYMENT_STATUS_LABELS[PaymentStatus.VALIDE],
    className: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  },
  [PaymentStatus.ECHOUE]: {
    label: PAYMENT_STATUS_LABELS[PaymentStatus.ECHOUE],
    className: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  },
  [PaymentStatus.REMBOURSE]: {
    label: PAYMENT_STATUS_LABELS[PaymentStatus.REMBOURSE],
    className: 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * PaymentStatusBadge — Affiche le statut d'un paiement sous forme de badge coloré.
 *
 * - en_attente → jaune/orange
 * - valide     → vert
 * - echoue     → rouge
 * - rembourse  → violet
 * - inconnu    → gris
 */
export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ statut }) => {
  const config = statut ? statusConfig[statut] : null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.className ?? 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
      }`}
    >
      {config?.label ?? statut ?? 'Inconnu'}
    </span>
  );
};
