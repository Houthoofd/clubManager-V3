/**
 * @fileoverview KpiGrid Component
 * @module features/dashboard/components
 *
 * Grille de 4 indicateurs clés de performance (KPI) affichés sous forme
 * de StatCard : membres actifs, cours actifs, revenus du mois, notifications.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../../../features/statistics/components/StatCard";
import { useDashboardAnalytics } from "../../../features/statistics/hooks/useStatistics";
import { useNotificationCount } from "../../notifications/hooks/useNotifications";
import {
  formatPercentage,
} from "../../../features/statistics/utils/formatting";

// ─── Icônes SVG (heroicons outline) ──────────────────────────────────────────

/**
 * Icône groupe d'utilisateurs
 */
const UsersIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

/**
 * Icône calendrier
 */
const CalendarIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

/**
 * Icône euro (monnaie)
 */
const CurrencyEuroIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

/**
 * Icône cloche (notifications)
 */
const BellIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
    />
  </svg>
);

// ─── Composant ────────────────────────────────────────────────────────────────

/**
 * KpiGrid
 *
 * Affiche une grille responsive de 4 indicateurs clés :
 * - Membres actifs (avec taux de croissance)
 * - Cours actifs (avec taux de présence)
 * - Revenus du mois (avec taux de paiement)
 * - Notifications non lues
 *
 * @example
 * ```tsx
 * <KpiGrid />
 * ```
 */
export function KpiGrid() {
  const { t } = useTranslation("dashboard");

  const {
    data,
    isLoading: isStatsLoading,
  } = useDashboardAnalytics();

  const {
    data: count,
    isLoading: isCountLoading,
  } = useNotificationCount();

  const isLoading = isStatsLoading || isCountLoading;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* KPI 1 — Membres actifs */}
      <StatCard
        title={t("kpis.members")}
        value={data?.members?.overview?.total_membres ?? 0}
        valueFormat="number"
        trend={data?.members?.overview?.taux_croissance}
        trendIsPercentage
        trendLabel={t("kpis.membersDesc")}
        icon={UsersIcon}
        variant="info"
        isLoading={isLoading}
      />

      {/* KPI 2 — Cours actifs */}
      <StatCard
        title={t("kpis.courses")}
        value={data?.courses?.overview?.total_cours ?? 0}
        valueFormat="number"
        description={
          formatPercentage(
            data?.courses?.overview?.taux_presence ?? 0,
            1
          ) +
          " " +
          t("kpis.coursesDesc")
        }
        icon={CalendarIcon}
        variant="default"
        isLoading={isLoading}
      />

      {/* KPI 3 — Revenus du mois */}
      <StatCard
        title={t("kpis.revenue")}
        value={data?.finance?.overview?.total_revenus ?? 0}
        valueFormat="currency"
        description={
          formatPercentage(
            data?.finance?.overview?.taux_paiement ?? 0,
            1
          ) +
          " " +
          t("kpis.revenueDesc")
        }
        icon={CurrencyEuroIcon}
        variant="success"
        isLoading={isLoading}
      />

      {/* KPI 4 — Notifications non lues */}
      <StatCard
        title={t("kpis.notifications")}
        value={count ?? 0}
        valueFormat="number"
        description={t("kpis.notificationsDesc")}
        icon={BellIcon}
        variant={(count ?? 0) > 0 ? "warning" : "default"}
        isLoading={isLoading}
      />
    </div>
  );
}

export default KpiGrid;
