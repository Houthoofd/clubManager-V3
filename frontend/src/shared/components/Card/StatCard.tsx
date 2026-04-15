/**
 * StatCard Component
 *
 * Composant réutilisable pour afficher des statistiques dans un format compact et visuellement attrayant.
 * Wrapper autour du composant Card avec une structure optimisée pour les métriques.
 *
 * @example
 * ```tsx
 * <StatCard
 *   label="Total Membres"
 *   value="254"
 *   change="+12%"
 *   trend="up"
 * />
 * ```
 */

import { ReactNode } from 'react';
import { Card } from './Card';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface StatCardProps {
  /**
   * Label de la statistique (ex: "Total Membres")
   */
  label: string;

  /**
   * Valeur principale (ex: "254", "12,450 €")
   */
  value: string | number;

  /**
   * Variation optionnelle (ex: "+12%", "-5%")
   */
  change?: string;

  /**
   * Tendance : détermine la couleur du change
   * - up: vert (positif)
   * - down: rouge (négatif)
   * - neutral: gris
   */
  trend?: 'up' | 'down' | 'neutral';

  /**
   * Icône optionnelle (React node)
   */
  icon?: ReactNode;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Détermine la couleur du change selon la tendance
 */
function getTrendColor(trend?: 'up' | 'down' | 'neutral'): string {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    case 'neutral':
    default:
      return 'text-gray-500';
  }
}

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  className = '',
}: StatCardProps) {
  const trendColor = getTrendColor(trend);

  return (
    <Card variant="compact" hover className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-400">{icon}</div>}
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
        {change && (
          <span className={`text-xs font-medium ${trendColor}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </Card>
  );
}

export default StatCard;
