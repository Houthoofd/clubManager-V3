/**
 * DashboardPage
 * Page principale du tableau de bord — vue d'ensemble du club
 */
import { useTranslation } from "react-i18next";
import { useDashboardAnalytics } from "../../../features/statistics/hooks/useStatistics";
import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTutorial } from "../../../shared/providers/TutorialProvider";
import { getDashboardSteps } from "../../../shared/providers/tutorialsConfig";
import { useAuth } from "../../../shared/hooks/useAuth";
import { UserRole } from "@clubmanager/types";

import { WelcomeBanner } from "../components/WelcomeBanner";
import { KpiGrid } from "../components/KpiGrid";
import { AlertsSection } from "../components/AlertsSection";
import { QuickActions } from "../components/QuickActions";
import { TodayCourses } from "../components/TodayCourses";
import { RecentNotifications } from "../components/RecentNotifications";

export function DashboardPage() {
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();
  const isAdminOrProf = user?.role_app === UserRole.ADMIN || user?.role_app === UserRole.PROFESSOR;
  const { data, isLoading, error } = useDashboardAnalytics(undefined, isAdminOrProf);
  const { runTutorial, isActive } = useTutorial();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const forceTutorial = params.get("tutorial");
    console.log("[DashboardPage] URL tutorial param:", forceTutorial, "isActive:", isActive);
    if (forceTutorial?.includes("dashboard") && !isActive) {
      console.log("[DashboardPage] Launching tutorial!");
      runTutorial("dashboard_admin_intro", getDashboardSteps());
      params.delete("tutorial");
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location, isActive, runTutorial, navigate]);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* 1. Bannière de bienvenue — toujours affichée */}
      <WelcomeBanner />

      {/* 2. KPIs — ou banner d'erreur stats si l'API échoue */}
      {isAdminOrProf && (
        error ? (
          <AlertBanner
            variant="error"
            title={t("errors.stats")}
            message={error.message}
          />
        ) : (
          <div data-testid="kpi-grid">
            <KpiGrid />
          </div>
        )
      )}

      {/* 3. Alertes (paiements, stock) — visible uniquement si alertes */}
      {isAdminOrProf && (
        <AlertsSection data={data} isLoading={isLoading} />
      )}

      {/* 4. Accès rapides */}
      <div data-testid="quick-actions">
        <QuickActions />
      </div>

      {/* 5. Grille : Cours du jour + Notifications récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div data-testid="today-courses">
          <TodayCourses />
        </div>
        <RecentNotifications />
      </div>
    </div>
  );
}

export default DashboardPage;
