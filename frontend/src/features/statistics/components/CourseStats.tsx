/**
 * @fileoverview CourseStats Component
 * @module features/statistics/components
 *
 * Component for displaying course statistics and analytics.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./StatCard";
import { formatNumber, formatPercentage } from "../utils/formatting";

/**
 * Course Analytics Response Interface
 */
export interface CourseAnalyticsResponse {
  overview: {
    total_cours: number;
    total_seances: number;
    total_inscriptions: number;
    taux_presence_moyen: number;
    cours_actifs: number;
    taux_remplissage_moyen: number;
  };
  by_type: Array<{
    type_nom: string;
    count: number;
    pourcentage: number;
    taux_presence: number;
  }>;
  by_professor: Array<{
    professeur_nom: string;
    nombre_cours: number;
    total_inscrits: number;
    taux_presence: number;
  }>;
  popular_courses: Array<{
    cours_nom: string;
    jour: string;
    heure_debut: string;
    nombre_inscrits: number;
    taux_presence: number;
  }>;
}

/**
 * Props for CourseStats component
 */
export interface CourseStatsProps {
  /** Course analytics data */
  data?: CourseAnalyticsResponse;

  /** Whether the data is loading */
  isLoading?: boolean;

  /** Error message if any */
  error?: Error | null;

  /** Whether to show in compact mode */
  isCompact?: boolean;
}

// SVG Icons
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

function AcademicCapIcon({ className }: { className?: string }) {
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
        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
      />
    </svg>
  );
}

function UserGroupIcon({ className }: { className?: string }) {
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
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
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
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChartBarIcon({ className }: { className?: string }) {
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
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
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

// Distribution Chart Colors
const CHART_COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
];

interface DistributionChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    percentage: number;
    extra?: string;
  }>;
  isLoading?: boolean;
  noDataText?: string;
}

function DistributionChart({
  title,
  data,
  isLoading,
  noDataText = "Aucune donnée disponible",
}: DistributionChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">{noDataText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const colorClass = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <span className="text-sm text-gray-600">
                  {formatNumber(item.value)}
                  {item.extra && ` • ${item.extra}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colorClass} transition-all duration-300`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
              Erreur de chargement
            </h3>
            <p className="text-sm text-red-700">
              Une erreur est survenue lors du chargement des statistiques des
              cours.
            </p>
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
            Aucune donnée disponible
          </h3>
          <p className="text-sm text-gray-600">
            Les statistiques des cours ne sont pas disponibles pour le moment.
          </p>
        </div>
      </div>
    );
  }

  // Prepare distribution data
  const typeDistribution =
    data?.by_type.map((item) => ({
      label: item.type_nom,
      value: item.count,
      percentage: item.pourcentage,
      extra: `${formatPercentage(item.taux_presence, 0)} présence`,
    })) || [];

  const professorDistribution =
    data?.by_professor.slice(0, 5).map((item) => ({
      label: item.professeur_nom,
      value: item.nombre_cours,
      percentage: 0,
      extra: `${item.total_inscrits} élèves`,
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("courses.popularCourses")}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscrits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taux Présence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.popular_courses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {course.cours_nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {course.jour} - {course.heure_debut}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {course.nombre_inscrits}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          course.taux_presence >= 75
                            ? "bg-green-100 text-green-800"
                            : course.taux_presence >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatPercentage(course.taux_presence, 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
