/**
 * @fileoverview Courses Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for courses analytics.
 *
 * MIGRATION NOTES:
 * - Migrated to use PageHeader component for consistent page header
 * - Replaced custom buttons with Button component
 * - Preserved all business logic and hooks
 * - CourseStats and PeriodSelector remain unchanged
 */

import React from "react";
import {
  useCourseAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { CourseStats } from "../components/CourseStats";
import { PageHeader } from "../../../shared/components/Layout/PageHeader";
import { Button } from "../../../shared/components/Button/Button";

/**
 * CoursesStatsPage Component
 *
 * Detailed page displaying comprehensive course statistics including:
 * - Total courses, enrollments, attendance
 * - Attendance rate
 * - Distribution by course type
 * - Attendance by day of week
 * - Popular courses
 *
 * @example
 * ```tsx
 * <CoursesStatsPage />
 * ```
 */
export const CoursesStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useCourseAnalytics();
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

  // Breadcrumb component
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
              Statistiques des Cours
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );

  // Back button icon
  const backIcon = (
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
      <PageHeader
        breadcrumb={breadcrumb}
        title="Statistiques des Cours"
        description="Vue détaillée des statistiques de fréquentation et performance des cours"
        actions={
          <Button
            variant="ghost"
            size="md"
            icon={backIcon}
            iconPosition="left"
            onClick={handleBackToDashboard}
          >
            Retour au tableau de bord
          </Button>
        }
      />

      {/* Period Selector Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <PeriodSelector
          showPeriodType={false}
          showRefresh
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </div>

      {/* Main Content */}
      <CourseStats data={data} isLoading={isLoading} error={error} />
    </div>
  );
};

export default CoursesStatsPage;
