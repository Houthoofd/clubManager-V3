/**
 * @fileoverview Courses Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for courses analytics.
 */

import React from "react";
import {
  useCourseAnalytics,
  useInvalidateStatistics,
} from "../hooks/useStatistics";
import { PeriodSelector } from "../components/PeriodSelector";
import { CourseStats } from "../components/CourseStats";

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
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

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Statistiques des Cours
            </h1>
            <p className="text-sm text-gray-600">
              Vue détaillée des statistiques de fréquentation et performance des
              cours
            </p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Retour au tableau de bord
          </button>
        </div>

        {/* Period Selector */}
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
