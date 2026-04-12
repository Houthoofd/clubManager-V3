/**
 * StockBadge
 * Badge coloré indiquant le statut du stock d'un article.
 */

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
  className = '',
}) => {
  let label: string;
  let colorClass: string;

  if (quantite <= 0) {
    label = 'Rupture';
    colorClass = 'bg-red-100 text-red-800 ring-1 ring-red-200';
  } else if (quantite <= quantite_minimum) {
    label = 'Stock bas';
    colorClass = 'bg-orange-100 text-orange-800 ring-1 ring-orange-200';
  } else {
    label = 'En stock';
    colorClass = 'bg-green-100 text-green-800 ring-1 ring-green-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {/* Dot indicator */}
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          quantite <= 0
            ? 'bg-red-500'
            : quantite <= quantite_minimum
              ? 'bg-orange-500'
              : 'bg-green-500'
        }`}
      />
      {label}
    </span>
  );
};
