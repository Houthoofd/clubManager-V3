/**
 * @fileoverview Finance Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for financial analytics.
 *
 * @migrationNotes
 * - Migrated to use PageHeader component for consistent header layout
 * - Replaced manual breadcrumb with PageHeader breadcrumb prop
 * - Replaced custom back button with IconButton component
 * - Preserved all business logic and hooks (100%)
 * - FinanceStats and PeriodSelector remain unchanged (domain-specific components)
 *
 * @linesReduced
 * - Breadcrumb: Integrated into PageHeader (cleaner structure)
 * - Header section: ~30 lines → PageHeader component
 * - Back button: ~12 lines → IconButton component
 * - Total: ~35-40 lines of boilerplate eliminated
 */

import React from "react";
import {
  useFinancialAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { FinanceStats } from "../components/FinanceStats";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { IconButton } from "../../../shared/components/Button/IconButton";

/**
 * FinanceStatsPage Component
 *
 * Detailed page displaying comprehensive financial statistics including:
 * - Total revenue and payment status
 * - Late payments with alerts
 * - Revenue distribution by payment method
 * - Revenue distribution by subscription plan
 *
 * @example
 * ```tsx
 * <FinanceStatsPage />
 * ```
 */
export const FinanceStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useFinancialAnalytics();
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

  /**
   * Navigate back to dashboard
   */
  const handleBackToDashboard = () => {
    window.history.back();
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumb and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <PageHeader
          icon={
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          title="Statistiques Financières"
          description="Vue détaillée des revenus, paiements et analytics financiers"
          breadcrumb={
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <button
                    onClick={handleBackToDashboard}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                  >
                    Tableau de bord
                  </button>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg
                      className="w-3 h-3 text-gray-400 mx-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      Statistiques Financières
                    </span>
                  </div>
                </li>
              </ol>
            </nav>
          }
          actions={
            <IconButton
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              }
              ariaLabel="Retour au tableau de bord"
              tooltip="Retour au tableau de bord"
              variant="ghost"
              size="lg"
              onClick={handleBackToDashboard}
            />
          }
        />

        {/* Period Selector */}
        <div className="mt-6">
          <PeriodSelector
            showPeriodType={false}
            showRefresh
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Main Content */}
      <FinanceStats data={data} isLoading={isLoading} error={error} />
    </div>
  );
};

export default FinanceStatsPage;
