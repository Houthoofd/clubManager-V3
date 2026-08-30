/**
 * @fileoverview MemberStats Component
 * @module features/statistics/components
 *
 * Component for displaying member statistics and analytics.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./StatCard";
import { formatPercentage } from "../utils/formatting";
import { 
  UsersIcon, 
  UserCheckIcon, 
  UserMinusIcon, 
  UserPlusIcon, 
  TrendingUpIcon, 
  ExclamationTriangleIcon 
} from "./icons";
import { DistributionChart } from "./DistributionChart";

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
    data?.by_grade?.map((item) => ({
      label: item.grade_nom,
      value: item.count,
      percentage: item.pourcentage,
    })) || [];

  const genderDistribution =
    data?.by_gender?.map((item) => ({
      label: item.genre_nom,
      value: item.count,
      percentage: item.pourcentage,
    })) || [];

  const ageDistribution =
    data?.by_age_group?.map((item) => ({
      label: `${item.groupe_age} ${t("members.ageSuffix")}`,
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
