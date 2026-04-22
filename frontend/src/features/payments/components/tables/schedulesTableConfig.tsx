/**
 * schedulesTableConfig.tsx - Configuration des colonnes pour le tableau des échéances
 */

import { CheckIcon } from "@heroicons/react/24/outline";
import type { Column } from "@/shared/components/Table/DataTable";
import { Badge } from "@/shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScheduleRow {
  id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  plan_tarifaire_nom: string;
  montant: number;
  date_echeance: string;
  statut: string;
  jours_retard?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR");
}

// ─── Configuration des colonnes ───────────────────────────────────────────────

export interface SchedulesColumnsOptions {
  isAdmin: boolean;
  markingScheduleId: number | null;
  onMarkAsPaid: (id: number) => void;
}

export const createSchedulesColumns = ({
  isAdmin,
  markingScheduleId,
  onMarkAsPaid,
}: SchedulesColumnsOptions): Column<ScheduleRow>[] => [
  {
    key: "utilisateur_nom_complet",
    label: "Membre",
    render: (_, row) => (
      <div>
        <div className="text-sm font-medium text-gray-900">
          {row.utilisateur_nom_complet}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {row.utilisateur_email}
        </div>
      </div>
    ),
  },
  {
    key: "plan_tarifaire_nom",
    label: "Plan",
    render: (value) => (
      <span className="text-sm text-gray-600">{value}</span>
    ),
  },
  {
    key: "montant",
    label: "Montant",
    render: (value) => (
      <span className="text-sm font-semibold text-gray-900">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    key: "date_echeance",
    label: "Date échéance",
    render: (value) => (
      <span className="text-sm text-gray-600">{formatDate(value)}</span>
    ),
  },
  {
    key: "statut",
    label: "Statut",
    render: (value, row) => (
      <Badge.ScheduleStatus status={value} daysLate={row.jours_retard} />
    ),
  },
  {
    key: "jours_retard",
    label: "Jours retard",
    render: (value) =>
      value !== undefined && value > 0 ? (
        <span className="text-sm font-medium text-red-600">{value}j</span>
      ) : (
        <span className="text-sm text-gray-400">—</span>
      ),
  },
  {
    key: "id",
    label: "Actions",
    render: (_, row) => {
      if (isAdmin && row.statut !== "paye" && row.statut !== "annule") {
        return (
          <button
            type="button"
            onClick={() => onMarkAsPaid(row.id)}
            disabled={markingScheduleId === row.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium
                     text-white bg-green-600 hover:bg-green-700 rounded-lg
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markingScheduleId === row.id ? (
              <svg
                className="animate-spin h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <CheckIcon className="h-3.5 w-3.5" />
            )}
            Marquer payé
          </button>
        );
      }
      return <span className="text-xs text-gray-400">—</span>;
    },
  },
];
