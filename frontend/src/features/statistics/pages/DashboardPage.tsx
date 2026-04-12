/**
 * @fileoverview Dashboard Statistics Page
 * @module features/statistics/pages
 *
 * Main dashboard page displaying overview statistics for all modules.
 */

import React, { useState } from "react";
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

// ============================================================================
// SVG Icons
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

function ExclamationTriangleIcon({ className }: { className?: string }) {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
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
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

// ============================================================================
// Loading Skeleton Components
// ============================================================================

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
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
 */
export const DashboardPage: React.FC = () => {
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

  // Tabs configuration
  const tabs: Array<{
    id: TabId;
    label: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    { id: "overview", label: "Vue d'ensemble", icon: ChartLineIcon },
    { id: "members", label: "Membres", icon: UsersIcon },
    { id: "courses", label: "Cours", icon: CalendarIcon },
    { id: "finance", label: "Finances", icon: CurrencyDollarIcon },
    { id: "store", label: "Magasin", icon: ShoppingCartIcon },
  ];

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tableau de Bord - Statistiques
          </h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">
                Erreur de chargement
              </h3>
              <p className="text-sm text-red-700">
                Une erreur est survenue lors du chargement des statistiques du
                dashboard.
              </p>
              {error.message && (
                <p className="text-sm text-red-600 mt-2 font-mono">
                  {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de Bord - Statistiques
          </h1>
        </div>

        {/* Period Selector */}
        <PeriodSelector
          showPeriodType
          showRefresh
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm
                    whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Global KPIs */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Indicateurs Clés
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : (
                    <>
                      <StatCard
                        title="Total Membres"
                        value={data?.members.overview.total_membres || 0}
                        valueFormat="number"
                        trend={data?.members.overview.taux_croissance}
                        trendLabel="taux de croissance"
                        icon={UsersIcon}
                        variant="info"
                      />
                      <StatCard
                        title="Total Cours"
                        value={data?.courses.overview.total_cours || 0}
                        valueFormat="number"
                        icon={CalendarIcon}
                        variant="default"
                        description={`${formatPercentage(data?.courses.overview.taux_presence || 0, 1)} de présence`}
                      />
                      <StatCard
                        title="Total Revenus"
                        value={data?.finance.overview.total_revenus || 0}
                        valueFormat="currency"
                        icon={CurrencyDollarIcon}
                        variant="success"
                        description={`${formatPercentage(data?.finance.overview.taux_paiement || 0, 1)} de taux de paiement`}
                      />
                      <StatCard
                        title="Commandes Magasin"
                        value={data?.store.overview.total_commandes || 0}
                        valueFormat="number"
                        icon={ShoppingCartIcon}
                        variant="default"
                        description={
                          formatCurrency(
                            data?.store.overview.panier_moyen || 0,
                          ) + " panier moyen"
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Alerts */}
              {data && (
                <div className="space-y-3">
                  {data.finance.overview.nombre_echeances_retard > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900">
                            Paiements en retard
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            {data.finance.overview.nombre_echeances_retard}{" "}
                            paiement(s) en retard pour un montant total de{" "}
                            <strong>
                              {formatCurrency(
                                data.finance.overview.montant_echeances_retard,
                              )}
                            </strong>
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {data.store.low_stock.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-900">
                            Alertes de stock
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            {data.store.low_stock.length} article(s) avec stock
                            bas ou en rupture nécessitent un
                            réapprovisionnement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trend Charts */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Tendances
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {isLoading && !data ? (
                    <>
                      <SkeletonChart />
                      <SkeletonChart />
                      <SkeletonChart />
                    </>
                  ) : (
                    <>
                      {data?.trends.member_growth && (
                        <TrendChart
                          title="Croissance des Membres"
                          subtitle="Évolution du nombre de membres"
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
                          title="Fréquentation des Cours"
                          subtitle="Évolution des présences"
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
                          title="Évolution des Revenus"
                          subtitle="Revenus par période"
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

export default DashboardPage;
