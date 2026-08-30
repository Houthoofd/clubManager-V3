/**
 * @fileoverview CourseStats Component
 * @module features/statistics/components
 *
 * Component for displaying course statistics and analytics.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./StatCard";
import { formatPercentage } from "../utils/formatting";
import { CourseStatsProps } from "./CourseStats.types";
import {
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "./CourseStatsIcons";
import { DistributionChart } from "./DistributionChart";
import { PopularCoursesTable } from "./PopularCoursesTable";

/**
 * CourseStats Component
 *
 * Displays comprehensive course statistics including:
 * - Total courses and sessions
 * - Average attendance rate
 * - Distribution by type
 * - Popular courses
 * - Professor statistics
 */
export const CourseStats: React.FC<CourseStatsProps> = ({
  data,
  isLoading = false,
  error = null,
  isCompact = false,
}) => {
  const { t } = useTranslation("statistics");

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              {t("errors.loadingError")}
            </h3>
            <p className="text-sm text-red-700">{t("courses.loadingError")}</p>
            {error.message && (
              <p className="text-sm text-red-600 mt-2 font-mono">
                {error.message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!isLoading && !data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12">
        <div className="flex flex-col items-center justify-center">
          <CalendarIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t("empty.noData")}
          </h3>
          <p className="text-sm text-gray-600">
            {t("courses.noDataDescription")}
          </p>
        </div>
      </div>
    );
  }

  // Prepare distribution data
  const typeDistribution =
    data?.by_type?.map((item) => ({
      label: item.type_nom,
      value: item.count,
      percentage: item.pourcentage,
      extra: `${formatPercentage(item.taux_presence, 0)} ${t("courses.attendanceShort")}`,
    })) || [];

  const professorDistribution =
    data?.by_professor?.slice(0, 5)?.map((item) => ({
      label: item.professeur_nom,
      value: item.nombre_cours,
      percentage: 0,
      extra: t("courses.studentsShort", { count: item.total_inscrits }),
    })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title={t("courses.totalCourses")}
          value={data?.overview.total_cours || 0}
          valueFormat="number"
          icon={CalendarIcon}
          variant="info"
          isLoading={isLoading}
          isCompact={isCompact}
          description={`${data?.overview.cours_actifs || 0} ${t("courses.activeCourses")}`}
        />

        <StatCard
          title={t("courses.totalSessions")}
          value={data?.overview.total_seances || 0}
          valueFormat="number"
          icon={AcademicCapIcon}
          variant="default"
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title={t("courses.totalEnrollments")}
          value={data?.overview.total_inscriptions || 0}
          valueFormat="number"
          icon={UserGroupIcon}
          variant="success"
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title={t("courses.averageAttendanceRate")}
          value={data?.overview.taux_presence_moyen || 0}
          valueFormat="percentage"
          icon={CheckCircleIcon}
          variant={
            data && data.overview.taux_presence_moyen >= 75
              ? "success"
              : data && data.overview.taux_presence_moyen >= 50
                ? "warning"
                : "danger"
          }
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title={t("courses.fillRate")}
          value={data?.overview.taux_remplissage_moyen || 0}
          valueFormat="percentage"
          icon={ChartBarIcon}
          variant={
            data && data.overview.taux_remplissage_moyen >= 80
              ? "success"
              : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description={t("courses.fillRateDescription")}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DistributionChart
          title={t("courses.distributionByType")}
          data={typeDistribution}
          isLoading={isLoading}
          noDataText={t("empty.noData")}
        />

        <DistributionChart
          title={t("courses.topProfessors")}
          data={professorDistribution}
          isLoading={isLoading}
          noDataText={t("empty.noData")}
        />
      </div>

      {/* Popular Courses Table */}
      {!isLoading && data && data.popular_courses.length > 0 && (
        <PopularCoursesTable courses={data.popular_courses} />
      )}

      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseStats;
