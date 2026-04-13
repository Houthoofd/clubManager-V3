/**
 * OrderStatusBadge
 * Wrapper vers Badge.OrderStatus du Design System.
 *
 * Ce composant maintient la compatibilité avec l'ancienne interface
 * tout en utilisant le composant Badge.OrderStatus du design system.
 */

import { Badge } from "../../../shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderStatusBadgeProps {
  statut?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * OrderStatusBadge — Affiche le statut d'une commande sous forme de badge coloré.
 *
 * Utilise Badge.OrderStatus du design system.
 *
 * Statuts supportés:
 * - en_attente → jaune
 * - en_cours   → bleu
 * - payee      → bleu
 * - expediee   → violet
 * - prete      → violet
 * - livree     → vert
 * - annulee    → rouge
 */
export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  statut,
}) => {
  // Si pas de statut ou statut invalide, on affiche un badge neutre
  if (!statut) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
        Inconnu
      </span>
    );
  }

  // Vérifier si le statut est valide pour Badge.OrderStatus
  const validStatuses = [
    "en_attente",
    "en_cours",
    "payee",
    "expediee",
    "prete",
    "livree",
    "annulee",
  ];

  if (validStatuses.includes(statut)) {
    return (
      <Badge.OrderStatus
        status={
          statut as
            | "en_attente"
            | "en_cours"
            | "payee"
            | "expediee"
            | "prete"
            | "livree"
            | "annulee"
        }
      />
    );
  }

  // Fallback pour statuts inconnus
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-gray-200">
      {statut}
    </span>
  );
};
