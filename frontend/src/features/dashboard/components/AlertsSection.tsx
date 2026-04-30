/**
 * @fileoverview AlertsSection Component
 * @module features/dashboard/components
 *
 * Affiche des bannières d'alerte contextuelles basées sur les données analytiques :
 * - Paiements en retard
 * - Articles avec stock bas ou en rupture
 *
 * Retourne null si aucune alerte n'est active ou si les données sont en cours
 * de chargement.
 */

import { useTranslation } from "react-i18next";
import type { DashboardAnalytics } from "@clubmanager/types";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";
import { formatCurrency } from "../../../features/statistics/utils/formatting";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertsSectionProps {
  /** Données analytiques du dashboard */
  data: DashboardAnalytics | undefined;
  /** Indique si les données sont en cours de chargement */
  isLoading: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * AlertsSection
 *
 * Affiche des AlertBanner uniquement si des alertes existent dans les données.
 *
 * Alertes gérées :
 * 1. **Paiements en retard** — si `finance.overview.nombre_echeances_retard > 0`
 * 2. **Stock bas** — si `store.low_stock.length > 0`
 *
 * @example
 * ```tsx
 * <AlertsSection data={dashboardData} isLoading={isLoading} />
 * ```
 */
export function AlertsSection({ data, isLoading }: AlertsSectionProps) {
  const { t } = useTranslation("dashboard");

  // Ne rien afficher pendant le chargement
  if (isLoading) return null;

  const latePaymentsCount =
    data?.finance?.overview?.nombre_echeances_retard ?? 0;
  const latePaymentsAmount =
    data?.finance?.overview?.montant_echeances_retard ?? 0;
  const lowStockCount = data?.store?.low_stock?.length ?? 0;

  // Aucune alerte → ne rien rendre
  if (latePaymentsCount === 0 && lowStockCount === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Alerte : paiements en retard */}
      {latePaymentsCount > 0 && (
        <AlertBanner
          variant="warning"
          title={t("alerts.latePayments")}
          message={t("alerts.latePaymentsMessage", {
            count: latePaymentsCount,
            amount: formatCurrency(latePaymentsAmount),
          })}
        />
      )}

      {/* Alerte : articles en stock bas ou en rupture */}
      {lowStockCount > 0 && (
        <AlertBanner
          variant="warning"
          title={t("alerts.lowStock")}
          message={t("alerts.lowStockMessage", {
            count: lowStockCount,
          })}
        />
      )}
    </div>
  );
}

export default AlertsSection;
