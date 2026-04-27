/**
 * @fileoverview MemberStats Component
 * @module features/statistics/components
 *
 * Component for displaying member statistics and analytics.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./StatCard";
import { formatNumber, formatPercentage } from "../utils/formatting";

/**
 * Member Analytics Response Interface
 */
export interface MemberAnalyticsResponse {
  overview: {
    total_membres: number;
    membres_actifs: number;
    membres_inactifs: number;
    nouveaux_membres_mois: number;
    nouveaux_membres_semaine: number;
    taux_croissance: number;
  };
  by_grade: Array<{
    grade_nom: string;
    count: number;
    pourcentage: number;
  }>;
  by_gender: Array<{
    genre_nom: string;
    count: number;
    pourcentage: number;
  }>;
  by_age_group: Array<{
    groupe_age: string;
    count: number;
    pourcentage: number;
  }>;
}

/**
 * Props for MemberStats component
 */
export interface MemberStatsProps {
  /** Member analytics data */
  data?: MemberAnalyticsResponse;

  /** Whether the data is loading */
  isLoading?: boolean;

  /** Error message if any */
  error?: Error | null;

  /** Whether to show in compact mode */
  isCompact?: boolean;
}

// SVG Icons
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

function UserCheckIcon({ className }: { className?: string }) {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function UserMinusIcon({ className }: { className?: string }) {
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
        d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
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
        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
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
  "bg-indigo-500",
];

interface DistributionChartProps {
  title: string;
  data: Array<{ label: string; value: number; percentage: number }>;
  isLoading?: boolean;
  noDataText?: string;
}

function DistributionChart({
  title,
  data,
  isLoading,
  noDataText,
}: DistributionChartProps) {
  const { t } = useTranslation("statistics");
  const resolvedNoDataText = noDataText ?? t("empty.noData");
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
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
          <p className="text-sm text-gray-600">{resolvedNoDataText}</p>
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
                  {formatNumber(item.value)} (
                  {formatPercentage(item.percentage, 1)})
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
 * MemberStats Component
 *
 * Displays comprehensive member statistics including:
 * - Total members, active, inactive
 * - New members (monthly/weekly)
 * - Growth rate
 * - Distribution by grade, gender, and age group
 */
export const MemberStats: React.FC<MemberStatsProps> = ({
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
            <p className="text-sm text-red-700">{t("members.loadingError")}</p>
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
          <UsersIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t("empty.noData")}
          </h3>
          <p className="text-sm text-gray-600">
            {t("members.noDataDescription")}
          </p>
        </div>
      </div>
    );
  }

  // Prepare distribution data
  const gradeDistribution =
    data?.by_grade.map((item) => ({
      label: item.grade_nom,
      value: item.count,
      percentage: item.pourcentage,
    })) || [];

  const genderDistribution =
    data?.by_gender.map((item) => ({
      label: item.genre_nom,
      value: item.count,
      percentage: item.pourcentage,
    })) || [];

  const ageDistribution =
    data?.by_age_group.map((item) => ({
      label: `${item.groupe_age} ans`,
      value: item.count,
      percentage: item.pourcentage,
    })) || [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("cards.totalMembers")}
          value={data?.overview.total_membres || 0}
          valueFormat="number"
          icon={UsersIcon}
          variant="info"
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title={t("cards.activeMembers")}
          value={data?.overview.membres_actifs || 0}
          valueFormat="number"
          icon={UserCheckIcon}
          variant="success"
          isLoading={isLoading}
          isCompact={isCompact}
          description={
            data
              ? `${formatPercentage(
                  (data.overview.membres_actifs / data.overview.total_membres) *
                    100,
                  1,
                )} ${t("members.ofTotal")}`
              : undefined
          }
        />

        <StatCard
          title={t("cards.inactiveMembers")}
          value={data?.overview.membres_inactifs || 0}
          valueFormat="number"
          icon={UserMinusIcon}
          variant={
            data &&
            data.overview.membres_inactifs > data.overview.membres_actifs / 2
              ? "warning"
              : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description={
            data
              ? `${formatPercentage(
                  (data.overview.membres_inactifs /
                    data.overview.total_membres) *
                    100,
                  1,
                )} ${t("members.ofTotal")}`
              : undefined
          }
        />

        <StatCard
          title={t("cards.newMembersMonth")}
          value={data?.overview.nouveaux_membres_mois || 0}
          valueFormat="number"
          trend={data?.overview.taux_croissance}
          trendLabel={t("members.growthRateLabel")}
          icon={UserPlusIcon}
          variant={
            data && data.overview.taux_croissance > 0 ? "success" : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title={t("cards.newMembersWeek")}
          value={data?.overview.nouveaux_membres_semaine || 0}
          valueFormat="number"
          isLoading={isLoading}
          isCompact={isCompact}
        />

        <StatCard
          title={t("cards.growthRate")}
          value={data?.overview.taux_croissance || 0}
          valueFormat="percentage"
          icon={TrendingUpIcon}
          variant={
            data && data.overview.taux_croissance > 5
              ? "success"
              : data && data.overview.taux_croissance < 0
                ? "danger"
                : "default"
          }
          isLoading={isLoading}
          isCompact={isCompact}
          description={t("members.currentMonth")}
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DistributionChart
          title={t("members.distributionByGrade")}
          data={gradeDistribution}
          isLoading={isLoading}
          noDataText={t("empty.noData")}
        />

        <DistributionChart
          title={t("members.distributionByGender")}
          data={genderDistribution}
          isLoading={isLoading}
          noDataText={t("empty.noData")}
        />

        <DistributionChart
          title={t("members.distributionByAge")}
          data={ageDistribution}
          isLoading={isLoading}
          noDataText={t("empty.noData")}
        />
      </div>
    </div>
  );
};

export default MemberStats;
