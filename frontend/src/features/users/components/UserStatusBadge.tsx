/**
 * UserStatusBadge
 * Badge coloré affichant le statut d'un utilisateur selon son status_id.
 *
 * ⚠️ Ce composant utilise maintenant Badge.Status pour la cohérence visuelle.
 */

import { Badge } from "../../../shared/components/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStatusBadgeProps {
  statusId: number;
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

const statusIdToStatus: Record<
  number,
  "actif" | "inactif" | "suspendu" | "en_attente" | "archive"
> = {
  1: "actif",
  2: "inactif",
  3: "suspendu",
  4: "en_attente",
  5: "archive",
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * UserStatusBadge — Affiche le statut d'un utilisateur sous forme de badge coloré.
 *
 * - 1 (Actif)      → vert
 * - 2 (Inactif)    → gris
 * - 3 (Suspendu)   → orange
 * - 4 (En attente) → jaune
 * - 5 (Archivé)    → rouge
 * - inconnu        → gris (inactif)
 */
export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  statusId,
}) => {
  const status = statusIdToStatus[statusId] || "inactif";

  return <Badge.Status status={status} />;
};
