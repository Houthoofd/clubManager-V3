/**
 * ScheduleStatusBadge
 * Badge coloré affichant le statut d'une échéance de paiement.
 * Les échéances en retard affichent une alerte visuelle supplémentaire.
 */

import { ScheduleStatus, SCHEDULE_STATUS_LABELS } from '@clubmanager/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleStatusBadgeProps {
  statut?: string;
  joursRetard?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  [ScheduleStatus.EN_ATTENTE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.EN_ATTENTE],
    className: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
  },
  [ScheduleStatus.PAYE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.PAYE],
    className: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  },
  [ScheduleStatus.EN_RETARD]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.EN_RETARD],
    className: 'bg-red-100 text-red-800 ring-1 ring-red-300',
  },
  [ScheduleStatus.ANNULE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.ANNULE],
    className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * ScheduleStatusBadge — Affiche le statut d'une échéance sous forme de badge coloré.
 *
 * - en_attente → orange
 * - paye       → vert
 * - en_retard  → rouge avec icône d'alerte (⚠️) et jours de retard si fournis
 * - annule     → gris
 * - inconnu    → gris
 */
export const ScheduleStatusBadge: React.FC<ScheduleStatusBadgeProps> = ({
  statut,
  joursRetard,
}) => {
  const config = statut ? statusConfig[statut] : null;
  const isOverdue = statut === ScheduleStatus.EN_RETARD;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        config?.className ?? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
      } ${isOverdue ? 'animate-pulse' : ''}`}
    >
      {isOverdue && (
        <span aria-hidden="true" className="text-red-600">
          ⚠️
        </span>
      )}
      {config?.label ?? statut ?? 'Inconnu'}
      {isOverdue && joursRetard !== undefined && joursRetard > 0 && (
        <span className="ml-0.5 font-semibold">({joursRetard}j)</span>
      )}
    </span>
  );
};
