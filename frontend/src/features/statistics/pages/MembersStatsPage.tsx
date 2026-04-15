/**
 * @fileoverview Members Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for members analytics.
 *
 * **MIGRATION NOTES** (Date: 2024)
 * - ✅ Migrated to use PageHeader component from shared/components/Layout
 * - ✅ Replaced custom header with PageHeader (title, description, actions)
 * - ✅ Replaced custom buttons with Button component
 * - ✅ Breadcrumb passed to PageHeader via breadcrumb prop
 * - ✅ Preserved all business logic (hooks, refetch, state management)
 * - ✅ Kept MemberStats and PeriodSelector components unchanged (domain-specific)
 */

import React from "react";
import {
  useMemberAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { MemberStats } from "../components/MemberStats";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { Button } from "../../../shared/components/Button/Button";

/**
 * MembersStatsPage Component
 *
 * Detailed page displaying comprehensive member statistics including:
 * - Total members, active, inactive
 * - New members and growth rate
 * - Distribution by grade, gender, and age group
 *
 * @example
 * ```tsx
 * <MembersStatsPage />
 * ```
 */
export const MembersStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useMemberAnalytics();
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

  /**
   * Breadcrumb component
   */
  const breadcrumb = (
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
              Statistiques des Membres
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );

  /**
   * Back button icon
   */
  const BackIcon = () => (
    <svg
      className="w-4 h-4"
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
  );

  return (
    <div className="space-y-6">
      {/* Page Header with Breadcrumb */}
      <div className="bg-white rounded-lg shadow p-6">
        <PageHeader
          breadcrumb={breadcrumb}
          title="Statistiques des Membres"
          description="Vue détaillée des statistiques et analytics des membres du club"
          actions={
            <Button
              variant="ghost"
              size="md"
              icon={<BackIcon />}
              onClick={handleBackToDashboard}
            >
              Retour au tableau de bord
            </Button>
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
      <MemberStats data={data} isLoading={isLoading} error={error} />
    </div>
  );
};

export default MembersStatsPage;
