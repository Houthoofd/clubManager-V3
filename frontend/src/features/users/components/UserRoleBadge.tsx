/**
 * UserRoleBadge
 * Badge coloré affichant le rôle applicatif d'un utilisateur.
 */

import { UserRole } from '@clubmanager/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRoleBadgeProps {
  role?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const roleConfig: Record<string, { label: string; className: string }> = {
  [UserRole.ADMIN]: {
    label: 'Admin',
    className: 'bg-red-100 text-red-700',
  },
  [UserRole.PROFESSOR]: {
    label: 'Professeur',
    className: 'bg-blue-100 text-blue-700',
  },
  [UserRole.MEMBER]: {
    label: 'Membre',
    className: 'bg-green-100 text-green-700',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UserRoleBadge — Affiche le rôle d'un utilisateur sous forme de badge coloré.
 *
 * - admin     → rouge
 * - professor → bleu
 * - member    → vert
 * - inconnu   → gris
 */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const config = role ? roleConfig[role] : null;

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
