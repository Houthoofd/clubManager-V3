/**
 * ScheduleStatusBadge
 * Badge coloré affichant le statut d'une échéance de paiement.
 * Les échéances en retard affichent une alerte visuelle supplémentaire.
 */

import { ScheduleStatus, SCHEDULE_STATUS_LABELS } from "@clubmanager/types";

// ─── Icônes SVG ───────────────────────────────────────────────────────────────

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleStatusBadgeProps {
  statut?: string;
  joursRetard?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  [ScheduleStatus.EN_ATTENTE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.EN_ATTENTE],
    className: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  },
  [ScheduleStatus.PAYE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.PAYE],
    className: "bg-green-100 text-green-800 ring-1 ring-green-200",
  },
  [ScheduleStatus.EN_RETARD]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.EN_RETARD],
    className: "bg-red-100 text-red-800 ring-1 ring-red-300",
  },
  [ScheduleStatus.ANNULE]: {
    label: SCHEDULE_STATUS_LABELS[ScheduleStatus.ANNULE],
    className: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  },
};

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * ScheduleStatusBadge — Affiche le statut d'une échéance sous forme de badge coloré.
 *
 * - en_attente → orange
 * - paye       → vert
 * - en_retard  → rouge avec icône d'alerte et jours de retard si fournis
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
        config?.className ?? "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
      } ${isOverdue ? "animate-pulse" : ""}`}
    >
      {isOverdue && (
        <ExclamationTriangleIcon className="h-3 w-3 text-red-600 flex-shrink-0" />
      )}
      {config?.label ?? statut ?? "Inconnu"}
      {isOverdue && joursRetard !== undefined && joursRetard > 0 && (
        <span className="ml-0.5 font-semibold">({joursRetard}j)</span>
      )}
    </span>
  );
};
