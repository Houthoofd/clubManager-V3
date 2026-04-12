/**
 * @fileoverview CourseStats Component
 * @module features/statistics/components
 *
 * Component for displaying course statistics and attendance analytics.
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
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  Label,
  Flex,
  FlexItem,
  Progress,
  ProgressMeasureLocation,
  ProgressVariant,
} from '@patternfly/react-core';
import {
  Chart,
  ChartDonut,
  ChartBar,
  ChartAxis,
  ChartGroup,
  ChartThemeColor,
} from '@patternfly/react-charts';
import {
  CalendarAltIcon,
  UsersIcon,
  CheckCircleIcon,
  ChartBarIcon,
  TrendUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@patternfly/react-icons';
import type { CourseAnalyticsResponse } from '@clubmanager/types';
import { StatCard } from './StatCard';
import { formatNumber, formatPercentage, formatTime, formatDate } from '../utils/formatting';

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

/**
 * Chart colors for course type distribution
 */
const TYPE_COLORS = [
  'var(--pf-v5-global--palette--blue-300)',
  'var(--pf-v5-global--palette--purple-300)',
  'var(--pf-v5-global--palette--cyan-300)',
  'var(--pf-v5-global--palette--green-300)',
  'var(--pf-v5-global--palette--gold-300)',
  'var(--pf-v5-global--palette--orange-300)',
];

/**
 * Get progress variant based on attendance rate
 */
const getAttendanceVariant = (rate: number): ProgressVariant => {
  if (rate >= 80) return ProgressVariant.success;
  if (rate >= 60) return ProgressVariant.warning;
  return ProgressVariant.danger;
};

/**
 * CourseStats Component
 *
 * Displays comprehensive course statistics including:
 * - Total courses, enrollments, attendance
 * - Attendance rate
 * - Distribution by course type
 * - Attendance by day of week
 * - Popular courses
 *
 * @example
 * ```tsx
 * <CourseStats data={courseAnalytics} isLoading={isLoading} />
 * ```
 */
export const CourseStats: React.FC<CourseStatsProps> = ({
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
          Une erreur est survenue lors du chargement des statistiques des cours.
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
        <EmptyStateIcon icon={CalendarAltIcon} />
        <Title headingLevel="h2" size="lg">
          Aucune donnée disponible
        </Title>
        <EmptyStateBody>
          Les statistiques des cours ne sont pas disponibles pour le moment.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Prepare chart data for course types
  const typeChartData = data?.by_type.map((item, index) => ({
    x: item.type_cours,
    y: item.total_inscriptions,
    label: `${item.type_cours}: ${item.total_inscriptions} inscrits`,
    color: TYPE_COLORS[index % TYPE_COLORS.length],
  })) || [];

  // Prepare chart data for attendance by day of week
  const dayChartData = data?.by_day_of_week.map((item) => ({
    x: item.jour_nom,
    y: item.total_presences,
    label: `${item.jour_nom}: ${formatNumber(item.total_presences)} présences`,
  })) || [];

  return (
    <div className="course-stats">
      {/* KPI Cards */}
      <Grid hasGutter>
        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Cours"
            value={data?.overview.total_cours || 0}
            valueFormat="number"
            icon={CalendarAltIcon}
            variant="info"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Inscriptions"
            value={data?.overview.total_inscriptions || 0}
            valueFormat="number"
            icon={UsersIcon}
            variant="default"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Présences"
            value={data?.overview.total_presences || 0}
            valueFormat="number"
            icon={CheckCircleIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Taux de Présence"
            value={data?.overview.taux_presence || 0}
            valueFormat="percentage"
            icon={TrendUpIcon}
            variant={
              data && data.overview.taux_presence >= 80
                ? 'success'
                : data && data.overview.taux_presence >= 60
                ? 'warning'
                : 'danger'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description="Taux de participation moyen"
          />
        </GridItem>
      </Grid>

      {/* Secondary KPIs */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12}>
          <StatCard
            title="Moyenne de Participants par Cours"
            value={data?.overview.moyenne_participants_par_cours || 0}
            valueFormat="number"
            icon={UsersIcon}
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>
      </Grid>

      {/* Charts */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        {/* Course Type Distribution */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Inscriptions par Type de Cours
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : typeChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des inscriptions par type de cours"
                    ariaTitle="Types de cours"
                    constrainToVisibleArea
                    data={typeChartData}
                    labels={({ datum }) => `${datum.x}: ${datum.y}`}
                    legendData={typeChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 180,
                      top: 20,
                    }}
                    subTitle="Inscriptions"
                    title={formatNumber(data?.overview.total_inscriptions || 0)}
                    width={400}
                    height={300}
                    colorScale={typeChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de type de cours disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Attendance by Day of Week */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Fréquentation par Jour de Semaine
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : dayChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Chart
                    ariaDesc="Fréquentation par jour de la semaine"
                    ariaTitle="Jours de la semaine"
                    domainPadding={{ x: [30, 30] }}
                    height={300}
                    padding={{
                      bottom: 50,
                      left: 60,
                      right: 20,
                      top: 20,
                    }}
                    themeColor={ChartThemeColor.blue}
                  >
                    <ChartAxis />
                    <ChartAxis
                      dependentAxis
                      showGrid
                      tickFormat={(t) => formatNumber(t, 0)}
                    />
                    <ChartGroup>
                      <ChartBar data={dayChartData} />
                    </ChartGroup>
                  </Chart>
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de fréquentation disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Statistics by Course Type */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Statistiques par Type de Cours
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="200px" />
              ) : data && data.by_type.length > 0 ? (
                <DataList aria-label="Statistiques par type de cours" isCompact>
                  {data.by_type.map((type, index) => (
                    <DataListItem key={index}>
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="type" width={3}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem>
                                  <strong>{type.type_cours}</strong>
                                </FlexItem>
                                <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                  {formatNumber(type.total_cours)} cours
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="inscriptions" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Inscriptions
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(type.total_inscriptions)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="presences" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Présences
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(type.total_presences)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="moyenne" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Moy. participants
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(type.moyenne_participants, 1)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="taux" width={3}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Taux de présence
                                </FlexItem>
                                <FlexItem>
                                  <Progress
                                    value={type.taux_presence}
                                    title={`${formatPercentage(type.taux_presence, 1)}`}
                                    measureLocation={ProgressMeasureLocation.outside}
                                    variant={getAttendanceVariant(type.taux_presence)}
                                  />
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune statistique par type de cours disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Popular Courses */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Cours Populaires
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="200px" />
              ) : data && data.popular_courses.length > 0 ? (
                <DataList aria-label="Cours populaires" isCompact>
                  {data.popular_courses.slice(0, 10).map((course, index) => (
                    <DataListItem key={course.cours_id}>
                      <DataListItemRow>
                        <DataListItemCells
                          dataListCells={[
                            <DataListCell key="rank" width={1}>
                              <Label color="blue">#{index + 1}</Label>
                            </DataListCell>,
                            <DataListCell key="type" width={3}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem>
                                  <strong>{course.type_cours}</strong>
                                </FlexItem>
                                <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                  <ClockIcon className="pf-v5-u-mr-xs" />
                                  {formatDate(course.date_cours, 'dd/MM/yyyy')} • {formatTime(course.heure_debut)} - {formatTime(course.heure_fin)}
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="inscriptions" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Inscriptions
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(course.total_inscriptions)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="presences" width={2}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Présences
                                </FlexItem>
                                <FlexItem>
                                  <strong>{formatNumber(course.total_presences)}</strong>
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                            <DataListCell key="taux" width={4}>
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                                <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                  Taux de remplissage
                                </FlexItem>
                                <FlexItem>
                                  <Progress
                                    value={course.taux_remplissage}
                                    title={`${formatPercentage(course.taux_remplissage, 1)}`}
                                    measureLocation={ProgressMeasureLocation.outside}
                                    variant={getAttendanceVariant(course.taux_remplissage)}
                                  />
                                </FlexItem>
                              </Flex>
                            </DataListCell>,
                          ]}
                        />
                      </DataListItemRow>
                    </DataListItem>
                  ))}
                </DataList>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucun cours populaire à afficher</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      <style>{`
        .course-stats {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CourseStats;
