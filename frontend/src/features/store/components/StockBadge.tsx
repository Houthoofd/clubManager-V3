/**
 * StockBadge
 * Badge coloré indiquant le statut du stock d'un article.
 *
 * Ce composant est maintenant un wrapper autour de Badge.Stock
 * pour maintenir la compatibilité avec l'ancienne API.
 */

import { Badge } from "../../../shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockBadgeProps {
  quantite: number;
  quantite_minimum: number;
  className?: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * StockBadge — Affiche l'état du stock sous forme de badge coloré.
 *
 * - quantite <= 0                          → rouge   "Rupture"
 * - quantite > 0 && quantite <= minimum    → orange  "Stock bas"
 * - quantite > minimum                     → vert    "En stock"
 */
export const StockBadge: React.FC<StockBadgeProps> = ({
  quantite,
  quantite_minimum,
  className = "",
}) => {
  // Déterminer le label selon la logique originale
  let label: string;

  if (quantite <= 0) {
    label = "Rupture";
  } else if (quantite <= quantite_minimum) {
    label = "Stock bas";
  } else {
    label = "En stock";
  }

  return (
    <Badge.Stock
      quantity={quantite}
      threshold={quantite_minimum}
      className={className}
    >
      {label}
    </Badge.Stock>
  );
};
