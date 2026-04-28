/**
 * @fileoverview Dashboard Statistics Page
 * @module features/statistics/pages
 *
 * Main dashboard page displaying overview statistics for all modules.
 * Migrated to use reusable components from shared library.
 *
 * @migrations
 * - PageHeader: Replaced custom header with reusable PageHeader component
 * - ErrorBanner: Replaced custom error state with ErrorBanner component
 * - TabGroup: Replaced custom tabs with TabGroup component
 * - AlertBanner: Replaced custom alert divs with AlertBanner component
 * - LoadingSpinner: Replaced SkeletonCard/SkeletonChart with LoadingSpinner
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useDashboardAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { StatCard } from "../components/StatCard";
import { TrendChart } from "../components/TrendChart";
import { MemberStats } from "../components/MemberStats";
import { CourseStats } from "../components/CourseStats";
import { FinanceStats } from "../components/FinanceStats";
import { StoreStats } from "../components/StoreStats";
import { formatCurrency, formatPercentage } from "../utils/formatting";

// Shared Components
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { LoadingSpinner } from "../../../shared/components/Layout/LoadingSpinner";

import { AlertBanner } from "../../../shared/components/Feedback/AlertBanner";
import { TabGroup, Tab } from "../../../shared/components/Navigation/TabGroup";

// ============================================================================
// SVG Icons (Preserved for statistics specificity)
// ============================================================================

function ChartLineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function CurrencyDollarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

type TabId = "overview" | "members" | "courses" | "finance" | "store";

/**
 * DashboardPage Component
 *
 * Main dashboard displaying comprehensive statistics overview including:
 * - Key performance indicators (KPIs)
 * - Trend charts for growth analysis
 * - Module-specific statistics (members, courses, finance, store)
 *
 * @component
 * @reusable_components PageHeader, ErrorBanner, AlertBanner, TabGroup, LoadingSpinner
 */
export const DashboardPage: React.FC = () => {
  const { t } = useTranslation("statistics");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useDashboardAnalytics();
  const invalidateStats = useInvalidateStatistics();

  /**
   * Handle refresh button click
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await invalidateStats();
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Tabs configuration for TabGroup component
  const tabs: Tab[] = [
    {
      id: "overview",
      label: t("tabs.overview"),
      icon: <ChartLineIcon className="w-5 h-5" />,
    },
    {
      id: "members",
      label: t("tabs.members"),
      icon: <UsersIcon className="w-5 h-5" />,
    },
    {
      id: "courses",
      label: t("tabs.courses"),
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      id: "finance",
      label: t("tabs.finance"),
      icon: <CurrencyDollarIcon className="w-5 h-5" />,
    },
    {
      id: "store",
      label: t("tabs.store"),
      icon: <ShoppingCartIcon className="w-5 h-5" />,
    },
  ];

  // Error state - Using ErrorBanner component
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={<ChartLineIcon className="h-8 w-8 text-blue-600" />}
          title={t("page.title")}
          description={t("page.description")}
        />
        <AlertBanner
          variant="error"
          title={t("errors.loadingError")}
          message={error.message || t("errors.dashboardError")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Using PageHeader component */}
      <PageHeader
        icon={<ChartLineIcon className="h-8 w-8 text-blue-600" />}
        title={t("page.title")}
        description={t("page.description")}
      />

      {/* Period Selector Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <PeriodSelector
          showPeriodType
          showRefresh
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Tabs & Content - Using TabGroup component */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <TabGroup
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as TabId)}
            scrollable
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Global KPIs */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t("sections.keyIndicators")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    <div className="col-span-full">
                      <LoadingSpinner text={t("loading.indicators")} />
                    </div>
                  ) : (
                    <>
                      <StatCard
                        title={t("kpis.totalMembers")}
                        value={data?.members.overview.total_membres || 0}
                        valueFormat="number"
                        trend={data?.members.overview.taux_croissance}
                        trendLabel={t("kpis.growthRate")}
                        icon={UsersIcon}
                        variant="info"
                      />
                      <StatCard
                        title={t("kpis.totalCourses")}
                        value={data?.courses.overview.total_cours || 0}
                        valueFormat="number"
                        icon={CalendarIcon}
                        variant="default"
                        description={`${formatPercentage(data?.courses.overview.taux_presence || 0, 1)} ${t("kpis.attendanceRate")}`}
                      />
                      <StatCard
                        title={t("kpis.totalRevenue")}
                        value={data?.finance.overview.total_revenus || 0}
                        valueFormat="currency"
                        icon={CurrencyDollarIcon}
                        variant="success"
                        description={`${formatPercentage(data?.finance.overview.taux_paiement || 0, 1)} ${t("kpis.paymentRate")}`}
                      />
                      <StatCard
                        title={t("kpis.storeOrders")}
                        value={data?.store.overview.total_commandes || 0}
                        valueFormat="number"
                        icon={ShoppingCartIcon}
                        variant="default"
                        description={
                          formatCurrency(
                            data?.store.overview.panier_moyen || 0,
                          ) +
                          " " +
                          t("kpis.averageBasket")
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Alerts - Using AlertBanner component */}
              {data && (
                <div className="space-y-3">
                  {data.finance.overview.nombre_echeances_retard > 0 && (
                    <AlertBanner
                      variant="warning"
                      title={t("alerts.latePayments")}
                      message={t("alerts.latePaymentsMessage", {
                        count: data.finance.overview.nombre_echeances_retard,
                        amount: formatCurrency(
                          data.finance.overview.montant_echeances_retard,
                        ),
                      })}
                    />
                  )}

                  {data.store.low_stock.length > 0 && (
                    <AlertBanner
                      variant="warning"
                      title={t("alerts.lowStock")}
                      message={t("alerts.lowStockMessage", {
                        count: data.store.low_stock.length,
                      })}
                    />
                  )}
                </div>
              )}

              {/* Trend Charts */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t("sections.trends")}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {isLoading && !data ? (
                    <div className="col-span-full">
                      <LoadingSpinner text={t("loading.charts")} />
                    </div>
                  ) : (
                    <>
                      {data?.trends.member_growth && (
                        <TrendChart
                          title={t("charts.memberGrowth")}
                          subtitle={t("charts.memberGrowthSubtitle")}
                          data={data.trends.member_growth.data}
                          valueFormat="number"
                          showVariation
                          totalVariation={
                            data.trends.member_growth.total_variation
                          }
                          showAverage
                          averageValue={data.trends.member_growth.moyenne}
                          height={250}
                        />
                      )}

                      {data?.trends.attendance && (
                        <TrendChart
                          title={t("charts.courseAttendance")}
                          subtitle={t("charts.courseAttendanceSubtitle")}
                          data={data.trends.attendance.data}
                          valueFormat="number"
                          showVariation
                          totalVariation={
                            data.trends.attendance.total_variation
                          }
                          showAverage
                          averageValue={data.trends.attendance.moyenne}
                          height={250}
                        />
                      )}

                      {data?.trends.revenue && (
                        <TrendChart
                          title={t("charts.revenueEvolution")}
                          subtitle={t("charts.revenueEvolutionSubtitle")}
                          data={data.trends.revenue.data}
                          valueFormat="currency"
                          showVariation
                          totalVariation={data.trends.revenue.total_variation}
                          showAverage
                          averageValue={data.trends.revenue.moyenne}
                          height={250}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <MemberStats
              data={data?.members}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <CourseStats
              data={data?.courses}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* Finance Tab */}
          {activeTab === "finance" && (
            <FinanceStats
              data={data?.finance}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* Store Tab */}
          {activeTab === "store" && (
            <StoreStats
              data={data?.store}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};
