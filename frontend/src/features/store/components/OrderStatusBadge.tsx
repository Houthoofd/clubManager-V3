/**
 * OrderStatusBadge
 * Badge coloré affichant le statut d'une commande boutique.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'en_attente' | 'payee' | 'expediee' | 'livree' | 'annulee';

interface OrderStatusBadgeProps {
  statut?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  en_attente: {
    label: 'En attente',
    className: 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200',
  },
  payee: {
    label: 'Payée',
    className: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
  },
  expediee: {
    label: 'Expédiée',
    className: 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
  },
  livree: {
    label: 'Livrée',
    className: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  },
  annulee: {
    label: 'Annulée',
    className: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * OrderStatusBadge — Affiche le statut d'une commande sous forme de badge coloré.
 *
 * - en_attente → jaune
 * - payee      → bleu
 * - expediee   → violet
 * - livree     → vert
 * - annulee    → rouge
 * - inconnu    → gris
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ statut }) => {
  const config = statut ? statusConfig[statut as OrderStatus] : null;

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
