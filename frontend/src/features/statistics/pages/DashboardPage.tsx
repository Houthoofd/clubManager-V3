/**
 * @fileoverview Dashboard Statistics Page
 * @module features/statistics/pages
 *
 * Main dashboard page displaying overview statistics for all modules.
 */

import React from 'react';
import {
  Page,
  PageSection,
  PageSectionVariants,
  Title,
  Grid,
  GridItem,
  Card,
  CardTitle,
  CardBody,
  Skeleton,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Spinner,
  Alert,
  AlertVariant,
  Tabs,
  Tab,
  TabTitleText,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import {
  ChartLineIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  CalendarAltIcon,
  DollarSignIcon,
  ShoppingCartIcon,
} from '@patternfly/react-icons';
import { useDashboardAnalytics, useInvalidateStatistics } from '../hooks/useStatistics';
import { PeriodSelector } from '../components/PeriodSelector';
import { StatCard } from '../components/StatCard';
import { TrendChart } from '../components/TrendChart';
import { MemberStats } from '../components/MemberStats';
import { CourseStats } from '../components/CourseStats';
import { FinanceStats } from '../components/FinanceStats';
import { StoreStats } from '../components/StoreStats';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatting';

/**
 * DashboardPage Component
 *
 * Main dashboard displaying comprehensive statistics overview including:
 * - Key performance indicators (KPIs)
 * - Trend charts for growth analysis
 * - Module-specific statistics (members, courses, finance, store)
 *
 * @example
 * ```tsx
 * <DashboardPage />
 * ```
 */
export const DashboardPage: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>('overview');
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useDashboardAnalytics();
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
   * Handle tab change
   */
  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  // Error state
  if (error) {
    return (
      <Page>
        <PageSection variant={PageSectionVariants.light}>
          <EmptyState>
            <EmptyStateIcon
              icon={ExclamationTriangleIcon}
              color="var(--pf-v5-global--danger-color--100)"
            />
            <Title headingLevel="h1" size="lg">
              Erreur de chargement
            </Title>
            <EmptyStateBody>
              Une erreur est survenue lors du chargement des statistiques du dashboard.
              <br />
              <br />
              {error.message}
            </EmptyStateBody>
          </EmptyState>
        </PageSection>
      </Page>
    );
  }

  return (
    <Page>
      {/* Page Header */}
      <PageSection variant={PageSectionVariants.light} className="pf-v5-u-pb-0">
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          className="pf-v5-u-mb-md"
        >
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Tableau de Bord - Statistiques
            </Title>
          </FlexItem>
        </Flex>

        {/* Period Selector */}
        <PeriodSelector
          showPeriodType
          showRefresh
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </PageSection>

      {/* Main Content */}
      <PageSection>
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label="Dashboard statistics tabs"
          role="region"
        >
          {/* Overview Tab */}
          <Tab
            eventKey="overview"
            title={<TabTitleText><ChartLineIcon className="pf-v5-u-mr-sm" />Vue d'ensemble</TabTitleText>}
            aria-label="Vue d'ensemble"
          >
            <div className="pf-v5-u-mt-lg">
              {/* Global KPIs */}
              <Grid hasGutter>
                <GridItem span={12}>
                  <Title headingLevel="h2" size="xl" className="pf-v5-u-mb-md">
                    Indicateurs Clés
                  </Title>
                </GridItem>

                <GridItem span={12} md={6} lg={3}>
                  <StatCard
                    title="Total Membres"
                    value={data?.members.overview.total_membres || 0}
                    valueFormat="number"
                    trend={data?.members.overview.taux_croissance}
                    trendLabel="taux de croissance"
                    icon={UsersIcon}
                    variant="info"
                    isLoading={isLoading}
                  />
                </GridItem>

                <GridItem span={12} md={6} lg={3}>
                  <StatCard
                    title="Total Cours"
                    value={data?.courses.overview.total_cours || 0}
                    valueFormat="number"
                    icon={CalendarAltIcon}
                    variant="default"
                    isLoading={isLoading}
                    description={`${formatPercentage(data?.courses.overview.taux_presence || 0, 1)} de présence`}
                  />
                </GridItem>

                <GridItem span={12} md={6} lg={3}>
                  <StatCard
                    title="Total Revenus"
                    value={data?.finance.overview.total_revenus || 0}
                    valueFormat="currency"
                    icon={DollarSignIcon}
                    variant="success"
                    isLoading={isLoading}
                    description={`${formatPercentage(data?.finance.overview.taux_paiement || 0, 1)} de taux de paiement`}
                  />
                </GridItem>

                <GridItem span={12} md={6} lg={3}>
                  <StatCard
                    title="Commandes Magasin"
                    value={data?.store.overview.total_commandes || 0}
                    valueFormat="number"
                    icon={ShoppingCartIcon}
                    variant="default"
                    isLoading={isLoading}
                    description={formatCurrency(data?.store.overview.panier_moyen || 0) + ' panier moyen'}
                  />
                </GridItem>
              </Grid>

              {/* Alerts */}
              {data && (
                <>
                  {data.finance.overview.nombre_echeances_retard > 0 && (
                    <Alert
                      variant={AlertVariant.warning}
                      title="Paiements en retard"
                      className="pf-v5-u-mt-lg"
                      isInline
                    >
                      {data.finance.overview.nombre_echeances_retard} paiement(s) en retard pour un montant total de{' '}
                      <strong>{formatCurrency(data.finance.overview.montant_echeances_retard)}</strong>.
                    </Alert>
                  )}

                  {data.store.low_stock.length > 0 && (
                    <Alert
                      variant={AlertVariant.warning}
                      title="Alertes de stock"
                      className="pf-v5-u-mt-md"
                      isInline
                    >
                      {data.store.low_stock.length} article(s) avec stock bas ou en rupture nécessitent un réapprovisionnement.
                    </Alert>
                  )}
                </>
              )}

              {/* Trend Charts */}
              <Grid hasGutter className="pf-v5-u-mt-lg">
                <GridItem span={12}>
                  <Title headingLevel="h2" size="xl" className="pf-v5-u-mb-md">
                    Tendances
                  </Title>
                </GridItem>

                {data?.trends.member_growth && (
                  <GridItem span={12} lg={4}>
                    <TrendChart
                      title="Croissance des Membres"
                      subtitle="Évolution du nombre de membres"
                      data={data.trends.member_growth.data}
                      valueFormat="number"
                      showVariation
                      totalVariation={data.trends.member_growth.total_variation}
                      showAverage
                      averageValue={data.trends.member_growth.moyenne}
                      isLoading={isLoading}
                      height={250}
                    />
                  </GridItem>
                )}

                {data?.trends.attendance && (
                  <GridItem span={12} lg={4}>
                    <TrendChart
                      title="Fréquentation des Cours"
                      subtitle="Évolution des présences"
                      data={data.trends.attendance.data}
                      valueFormat="number"
                      showVariation
                      totalVariation={data.trends.attendance.total_variation}
                      showAverage
                      averageValue={data.trends.attendance.moyenne}
                      isLoading={isLoading}
                      height={250}
                    />
                  </GridItem>
                )}

                {data?.trends.revenue && (
                  <GridItem span={12} lg={4}>
                    <TrendChart
                      title="Évolution des Revenus"
                      subtitle="Revenus par période"
                      data={data.trends.revenue.data}
                      valueFormat="currency"
                      showVariation
                      totalVariation={data.trends.revenue.total_variation}
                      showAverage
                      averageValue={data.trends.revenue.moyenne}
                      isLoading={isLoading}
                      height={250}
                    />
                  </GridItem>
                )}

                {isLoading && !data && (
                  <>
                    <GridItem span={12} lg={4}>
                      <Card>
                        <CardBody>
                          <Skeleton height="250px" />
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem span={12} lg={4}>
                      <Card>
                        <CardBody>
                          <Skeleton height="250px" />
                        </CardBody>
                      </Card>
                    </GridItem>
                    <GridItem span={12} lg={4}>
                      <Card>
                        <CardBody>
                          <Skeleton height="250px" />
                        </CardBody>
                      </Card>
                    </GridItem>
                  </>
                )}
              </Grid>
            </div>
          </Tab>

          {/* Members Tab */}
          <Tab
            eventKey="members"
            title={<TabTitleText><UsersIcon className="pf-v5-u-mr-sm" />Membres</TabTitleText>}
            aria-label="Statistiques membres"
          >
            <div className="pf-v5-u-mt-lg">
              <MemberStats data={data?.members} isLoading={isLoading} error={error} />
            </div>
          </Tab>

          {/* Courses Tab */}
          <Tab
            eventKey="courses"
            title={<TabTitleText><CalendarAltIcon className="pf-v5-u-mr-sm" />Cours</TabTitleText>}
            aria-label="Statistiques cours"
          >
            <div className="pf-v5-u-mt-lg">
              <CourseStats data={data?.courses} isLoading={isLoading} error={error} />
            </div>
          </Tab>

          {/* Finance Tab */}
          <Tab
            eventKey="finance"
            title={<TabTitleText><DollarSignIcon className="pf-v5-u-mr-sm" />Finances</TabTitleText>}
            aria-label="Statistiques financières"
          >
            <div className="pf-v5-u-mt-lg">
              <FinanceStats data={data?.finance} isLoading={isLoading} error={error} />
            </div>
          </Tab>

          {/* Store Tab */}
          <Tab
            eventKey="store"
            title={<TabTitleText><ShoppingCartIcon className="pf-v5-u-mr-sm" />Magasin</TabTitleText>}
            aria-label="Statistiques magasin"
          >
            <div className="pf-v5-u-mt-lg">
              <StoreStats data={data?.store} isLoading={isLoading} error={error} />
            </div>
          </Tab>
        </Tabs>
      </PageSection>

      <style>{`
        .dashboard-page {
          width: 100%;
        }
      `}</style>
    </Page>
  );
};

export default DashboardPage;
