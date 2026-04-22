/**
 * paymentsTableConfig.tsx - Configuration des colonnes pour le tableau des paiements
 */

import type { Column } from "@/shared/components/Table/DataTable";
import { Badge } from "@/shared/components";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentRow {
  id: number;
  utilisateur_nom_complet: string;
  utilisateur_email: string;
  montant: number;
  methode_paiement: string;
  statut: string;
  plan_tarifaire_nom?: string | null;
  date_paiement: string | null;
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

export const paymentsColumns: Column<PaymentRow>[] = [
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
    key: "montant",
    label: "Montant",
    render: (value) => (
      <span className="text-sm font-semibold text-gray-900">
        {formatCurrency(value)}
      </span>
    ),
  },
  {
    key: "methode_paiement",
    label: "Méthode",
    render: (value) => <Badge.PaymentMethod method={value} />,
  },
  {
    key: "statut",
    label: "Statut",
    render: (value) => <Badge.PaymentStatus status={value} />,
  },
  {
    key: "plan_tarifaire_nom",
    label: "Plan",
    render: (value) => (
      <span className="text-sm text-gray-600">{value ?? "—"}</span>
    ),
  },
  {
    key: "date_paiement",
    label: "Date",
    render: (value) => (
      <span className="text-sm text-gray-600">{formatDate(value)}</span>
    ),
  },
  {
    key: "id",
    label: "Actions",
    render: (value) => (
      <span className="text-xs text-gray-400">#{value}</span>
    ),
  },
];
