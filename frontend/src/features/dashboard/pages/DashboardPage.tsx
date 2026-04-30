/**
 * DashboardPage
 * Page principale du tableau de bord — vue d'ensemble du club
 */
import { useTranslation } from "react-i18next";
import { useDashboardAnalytics } from "../../../features/statistics/hooks/useStatistics";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";

import { WelcomeBanner } from "../components/WelcomeBanner";
import { KpiGrid } from "../components/KpiGrid";
import { AlertsSection } from "../components/AlertsSection";
import { QuickActions } from "../components/QuickActions";
import { TodayCourses } from "../components/TodayCourses";
import { RecentNotifications } from "../components/RecentNotifications";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { data, isLoading, error } = useDashboardAnalytics();

  if (error) {
    return (
      <AlertBanner
        variant="error"
        title={t("errors.stats")}
        message={error.message}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Bannière de bienvenue */}
      <WelcomeBanner />

      {/* 2. KPIs */}
      <KpiGrid />

      {/* 3. Alertes (paiements, stock) — visible uniquement si alertes */}
      <AlertsSection data={data} isLoading={isLoading} />

      {/* 4. Accès rapides */}
      <QuickActions />

      {/* 5. Grille : Cours du jour + Notifications récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayCourses />
        <RecentNotifications />
      </div>
    </div>
  );
}

export default DashboardPage;
