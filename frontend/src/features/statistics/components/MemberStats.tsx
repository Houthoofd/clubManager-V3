/**
 * @fileoverview MemberStats Component
 * @module features/statistics/components
 *
 * Component for displaying member statistics and analytics.
 */

import React from 'react';
import {
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Skeleton,
  EmptyState,
  EmptyStateIcon,
  Title,
  EmptyStateBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  Chart,
  ChartDonut,
  ChartThemeColor,
  ChartLegend,
} from '@patternfly/react-charts';
import {
  UsersIcon,
  UserCheckIcon,
  UserTimesIcon,
  UserPlusIcon,
  TrendUpIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import type { MemberAnalyticsResponse } from '@clubmanager/types';
import { StatCard } from './StatCard';
import { formatNumber, formatPercentage } from '../utils/formatting';

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
 * Donut chart colors for grade distribution
 */
const GRADE_COLORS = [
  'var(--pf-v5-global--palette--blue-300)',
  'var(--pf-v5-global--palette--cyan-300)',
  'var(--pf-v5-global--palette--green-300)',
  'var(--pf-v5-global--palette--gold-300)',
  'var(--pf-v5-global--palette--orange-300)',
  'var(--pf-v5-global--palette--red-300)',
  'var(--pf-v5-global--palette--purple-300)',
];

/**
 * Donut chart colors for gender distribution
 */
const GENDER_COLORS = [
  'var(--pf-v5-global--palette--blue-400)',
  'var(--pf-v5-global--palette--purple-400)',
  'var(--pf-v5-global--palette--green-400)',
];

/**
 * Bar chart colors for age group distribution
 */
const AGE_COLORS = [
  'var(--pf-v5-global--palette--cyan-300)',
  'var(--pf-v5-global--palette--blue-300)',
  'var(--pf-v5-global--palette--purple-300)',
  'var(--pf-v5-global--palette--gold-300)',
  'var(--pf-v5-global--palette--orange-300)',
];

/**
 * MemberStats Component
 *
 * Displays comprehensive member statistics including:
 * - Total members, active, inactive
 * - New members (monthly/weekly)
 * - Growth rate
 * - Distribution by grade, gender, and age group
 *
 * @example
 * ```tsx
 * <MemberStats data={memberAnalytics} isLoading={isLoading} />
 * ```
 */
export const MemberStats: React.FC<MemberStatsProps> = ({
  data,
  isLoading = false,
  error = null,
  isCompact = false,
}) => {
  // Error state
  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon icon={ExclamationTriangleIcon} color="var(--pf-v5-global--danger-color--100)" />
        <Title headingLevel="h2" size="lg">
          Erreur de chargement
        </Title>
        <EmptyStateBody>
          Une erreur est survenue lors du chargement des statistiques des membres.
          <br />
          {error.message}
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // No data state
  if (!isLoading && !data) {
    return (
      <EmptyState>
        <EmptyStateIcon icon={UsersIcon} />
        <Title headingLevel="h2" size="lg">
          Aucune donnée disponible
        </Title>
        <EmptyStateBody>
          Les statistiques des membres ne sont pas disponibles pour le moment.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Prepare chart data
  const gradeChartData = data?.by_grade.map((item, index) => ({
    x: item.grade_nom,
    y: item.count,
    label: `${item.grade_nom}: ${formatPercentage(item.pourcentage, 1)}`,
    color: GRADE_COLORS[index % GRADE_COLORS.length],
  })) || [];

  const genderChartData = data?.by_gender.map((item, index) => ({
    x: item.genre_nom,
    y: item.count,
    label: `${item.genre_nom}: ${formatPercentage(item.pourcentage, 1)}`,
    color: GENDER_COLORS[index % GENDER_COLORS.length],
  })) || [];

  const ageChartData = data?.by_age_group.map((item, index) => ({
    x: item.groupe_age,
    y: item.count,
    label: `${item.groupe_age} ans: ${formatPercentage(item.pourcentage, 1)}`,
    color: AGE_COLORS[index % AGE_COLORS.length],
  })) || [];

  return (
    <div className="member-stats">
      {/* KPI Cards */}
      <Grid hasGutter>
        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Membres"
            value={data?.overview.total_membres || 0}
            valueFormat="number"
            icon={UsersIcon}
            variant="info"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Membres Actifs"
            value={data?.overview.membres_actifs || 0}
            valueFormat="number"
            icon={UserCheckIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(
                    (data.overview.membres_actifs / data.overview.total_membres) * 100,
                    1
                  )} du total`
                : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Membres Inactifs"
            value={data?.overview.membres_inactifs || 0}
            valueFormat="number"
            icon={UserTimesIcon}
            variant={
              data && data.overview.membres_inactifs > data.overview.membres_actifs / 2
                ? 'warning'
                : 'default'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(
                    (data.overview.membres_inactifs / data.overview.total_membres) * 100,
                    1
                  )} du total`
                : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Nouveaux Membres (Mois)"
            value={data?.overview.nouveaux_membres_mois || 0}
            valueFormat="number"
            trend={data?.overview.taux_croissance}
            trendLabel="taux de croissance"
            icon={UserPlusIcon}
            variant={data && data.overview.taux_croissance > 0 ? 'success' : 'default'}
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>
      </Grid>

      {/* Secondary KPIs */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12} md={6}>
          <StatCard
            title="Nouveaux Membres (Semaine)"
            value={data?.overview.nouveaux_membres_semaine || 0}
            valueFormat="number"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6}>
          <StatCard
            title="Taux de Croissance"
            value={data?.overview.taux_croissance || 0}
            valueFormat="percentage"
            icon={TrendUpIcon}
            variant={
              data && data.overview.taux_croissance > 5
                ? 'success'
                : data && data.overview.taux_croissance < 0
                ? 'danger'
                : 'default'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description="Sur le mois en cours"
          />
        </GridItem>
      </Grid>

      {/* Distribution Charts */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        {/* Grade Distribution */}
        <GridItem span={12} lg={4}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Répartition par Grade
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : gradeChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des membres par grade"
                    ariaTitle="Grades"
                    constrainToVisibleArea
                    data={gradeChartData}
                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                    legendData={gradeChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 140,
                      top: 20,
                    }}
                    subTitle="Membres"
                    title={formatNumber(data?.overview.total_membres || 0)}
                    width={350}
                    height={300}
                    colorScale={gradeChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de grade disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Gender Distribution */}
        <GridItem span={12} lg={4}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Répartition par Genre
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : genderChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des membres par genre"
                    ariaTitle="Genres"
                    constrainToVisibleArea
                    data={genderChartData}
                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                    legendData={genderChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 140,
                      top: 20,
                    }}
                    subTitle="Membres"
                    title={formatNumber(data?.overview.total_membres || 0)}
                    width={350}
                    height={300}
                    colorScale={genderChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de genre disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Age Distribution */}
        <GridItem span={12} lg={4}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Répartition par Âge
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : ageChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des membres par groupe d'âge"
                    ariaTitle="Groupes d'âge"
                    constrainToVisibleArea
                    data={ageChartData}
                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                    legendData={ageChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 140,
                      top: 20,
                    }}
                    subTitle="Membres"
                    title={formatNumber(data?.overview.total_membres || 0)}
                    width={350}
                    height={300}
                    colorScale={ageChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée d'âge disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <style>{`
        .member-stats {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MemberStats;
