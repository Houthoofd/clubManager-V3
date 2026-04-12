/**
 * UserStatusBadge
 * Badge coloré affichant le statut d'un utilisateur selon son status_id.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStatusBadgeProps {
  statusId: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<number, { label: string; className: string }> = {
  1: { label: 'Actif',       className: 'bg-green-100 text-green-700'  },
  2: { label: 'Inactif',     className: 'bg-gray-100 text-gray-600'    },
  3: { label: 'Suspendu',    className: 'bg-orange-100 text-orange-700' },
  4: { label: 'En attente',  className: 'bg-yellow-100 text-yellow-700' },
  5: { label: 'Archivé',     className: 'bg-red-100 text-red-800'      },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UserStatusBadge — Affiche le statut d'un utilisateur sous forme de badge coloré.
 *
 * - 1 (Actif)      → vert
 * - 2 (Inactif)    → gris
 * - 3 (Suspendu)   → orange
 * - 4 (En attente) → jaune
 * - 5 (Archivé)    → rouge foncé
 * - inconnu        → gris
 */
export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ statusId }) => {
  const config = statusConfig[statusId];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.className ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {config?.label ?? 'Inconnu'}
    </span>
  );
};
