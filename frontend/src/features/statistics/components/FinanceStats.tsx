/**
 * @fileoverview FinanceStats Component
 * @module features/statistics/components
 *
 * Component for displaying financial statistics and payment analytics.
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
  Alert,
  AlertVariant,
  AlertActionCloseButton,
} from '@patternfly/react-core';
import {
  Chart,
  ChartDonut,
  ChartThemeColor,
} from '@patternfly/react-charts';
import {
  DollarSignIcon,
  CheckCircleIcon,
  ClockIcon,
  TimesCircleIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  MoneyBillIcon,
} from '@patternfly/react-icons';
import type { FinancialAnalyticsResponse } from '@clubmanager/types';
import { StatCard } from './StatCard';
import { formatCurrency, formatNumber, formatPercentage, formatDate, formatRelativeDate } from '../utils/formatting';

/**
 * Props for FinanceStats component
 */
export interface FinanceStatsProps {
  /** Financial analytics data */
  data?: FinancialAnalyticsResponse;

  /** Whether the data is loading */
  isLoading?: boolean;

  /** Error message if any */
  error?: Error | null;

  /** Whether to show in compact mode */
  isCompact?: boolean;
}

/**
 * Chart colors for payment method distribution
 */
const PAYMENT_METHOD_COLORS = [
  'var(--pf-v5-global--palette--blue-300)',
  'var(--pf-v5-global--palette--green-300)',
  'var(--pf-v5-global--palette--purple-300)',
  'var(--pf-v5-global--palette--cyan-300)',
  'var(--pf-v5-global--palette--gold-300)',
];

/**
 * Chart colors for subscription plan distribution
 */
const PLAN_COLORS = [
  'var(--pf-v5-global--palette--blue-400)',
  'var(--pf-v5-global--palette--cyan-400)',
  'var(--pf-v5-global--palette--green-400)',
  'var(--pf-v5-global--palette--gold-400)',
  'var(--pf-v5-global--palette--orange-400)',
  'var(--pf-v5-global--palette--purple-400)',
];

/**
 * Get severity label based on days late
 */
const getLateSeverity = (daysLate: number): { label: string; color: 'orange' | 'red' | 'purple' } => {
  if (daysLate >= 60) {
    return { label: 'Critique', color: 'red' };
  } else if (daysLate >= 30) {
    return { label: 'Urgent', color: 'orange' };
  } else {
    return { label: 'En retard', color: 'purple' };
  }
};

/**
 * FinanceStats Component
 *
 * Displays comprehensive financial statistics including:
 * - Total revenue and payment status
 * - Late payments with alerts
 * - Revenue distribution by payment method
 * - Revenue distribution by subscription plan
 *
 * @example
 * ```tsx
 * <FinanceStats data={financialAnalytics} isLoading={isLoading} />
 * ```
 */
export const FinanceStats: React.FC<FinanceStatsProps> = ({
  data,
  isLoading = false,
  error = null,
  isCompact = false,
}) => {
  const [showLatePaymentsAlert, setShowLatePaymentsAlert] = React.useState(true);

  // Error state
  if (error) {
    return (
      <EmptyState>
        <EmptyStateIcon icon={ExclamationTriangleIcon} color="var(--pf-v5-global--danger-color--100)" />
        <Title headingLevel="h2" size="lg">
          Erreur de chargement
        </Title>
        <EmptyStateBody>
          Une erreur est survenue lors du chargement des statistiques financières.
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
        <EmptyStateIcon icon={DollarSignIcon} />
        <Title headingLevel="h2" size="lg">
          Aucune donnée disponible
        </Title>
        <EmptyStateBody>
          Les statistiques financières ne sont pas disponibles pour le moment.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  // Prepare chart data for payment methods
  const paymentMethodChartData = data?.by_payment_method.map((item, index) => ({
    x: item.methode_paiement,
    y: item.montant_total,
    label: `${item.methode_paiement}: ${formatCurrency(item.montant_total)} (${formatPercentage(item.pourcentage, 1)})`,
    color: PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length],
  })) || [];

  // Prepare chart data for subscription plans
  const planChartData = data?.by_subscription_plan.map((item, index) => ({
    x: item.plan_nom,
    y: item.montant_total,
    label: `${item.plan_nom}: ${formatCurrency(item.montant_total)} (${formatPercentage(item.pourcentage, 1)})`,
    color: PLAN_COLORS[index % PLAN_COLORS.length],
  })) || [];

  const hasLatePayments = data && data.late_payments.length > 0;

  return (
    <div className="finance-stats">
      {/* Late Payments Alert */}
      {hasLatePayments && showLatePaymentsAlert && (
        <Alert
          variant={AlertVariant.warning}
          title={`${data.late_payments.length} paiement(s) en retard`}
          actionClose={<AlertActionCloseButton onClose={() => setShowLatePaymentsAlert(false)} />}
          className="pf-v5-u-mb-lg"
        >
          <p>
            Montant total en retard: <strong>{formatCurrency(data.overview.montant_echeances_retard)}</strong>
          </p>
          <p className="pf-v5-u-mt-sm">
            Consultez la liste des paiements en retard ci-dessous pour effectuer le suivi.
          </p>
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid hasGutter>
        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Total Revenus"
            value={data?.overview.total_revenus || 0}
            valueFormat="currency"
            icon={DollarSignIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Paiements Valides"
            value={data?.overview.total_paiements_valides || 0}
            valueFormat="number"
            icon={CheckCircleIcon}
            variant="success"
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data
                ? `${formatPercentage(data.overview.taux_paiement, 1)} de taux de succès`
                : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Paiements En Attente"
            value={data?.overview.total_paiements_en_attente || 0}
            valueFormat="number"
            icon={ClockIcon}
            variant={
              data && data.overview.total_paiements_en_attente > 10 ? 'warning' : 'default'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data ? `${formatCurrency(data.overview.montant_en_attente)} en attente` : undefined
            }
          />
        </GridItem>

        <GridItem span={12} md={6} lg={3}>
          <StatCard
            title="Paiements Échoués"
            value={data?.overview.total_paiements_echoues || 0}
            valueFormat="number"
            icon={TimesCircleIcon}
            variant={data && data.overview.total_paiements_echoues > 0 ? 'danger' : 'default'}
            isLoading={isLoading}
            isCompact={isCompact}
          />
        </GridItem>
      </Grid>

      {/* Secondary KPIs */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        <GridItem span={12} md={6}>
          <StatCard
            title="Échéances en Retard"
            value={data?.overview.nombre_echeances_retard || 0}
            valueFormat="number"
            icon={ExclamationTriangleIcon}
            variant={data && data.overview.nombre_echeances_retard > 0 ? 'danger' : 'success'}
            isLoading={isLoading}
            isCompact={isCompact}
            description={
              data && data.overview.montant_echeances_retard > 0
                ? `${formatCurrency(data.overview.montant_echeances_retard)} à recouvrer`
                : 'Aucun retard'
            }
          />
        </GridItem>

        <GridItem span={12} md={6}>
          <StatCard
            title="Taux de Paiement"
            value={data?.overview.taux_paiement || 0}
            valueFormat="percentage"
            icon={CheckCircleIcon}
            variant={
              data && data.overview.taux_paiement >= 90
                ? 'success'
                : data && data.overview.taux_paiement >= 75
                ? 'warning'
                : 'danger'
            }
            isLoading={isLoading}
            isCompact={isCompact}
            description="Paiements valides / Total"
          />
        </GridItem>
      </Grid>

      {/* Distribution Charts */}
      <Grid hasGutter className="pf-v5-u-mt-lg">
        {/* Payment Method Distribution */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Revenus par Méthode de Paiement
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : paymentMethodChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des revenus par méthode de paiement"
                    ariaTitle="Méthodes de paiement"
                    constrainToVisibleArea
                    data={paymentMethodChartData}
                    labels={({ datum }) => `${datum.x}: ${formatCurrency(datum.y)}`}
                    legendData={paymentMethodChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 200,
                      top: 20,
                    }}
                    subTitle="Total"
                    title={formatCurrency(data?.overview.total_revenus || 0)}
                    width={450}
                    height={300}
                    colorScale={paymentMethodChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de méthode de paiement disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* Subscription Plan Distribution */}
        <GridItem span={12} lg={6}>
          <Card>
            <CardTitle>
              <Title headingLevel="h3" size="lg">
                Revenus par Plan d'Abonnement
              </Title>
            </CardTitle>
            <CardBody>
              {isLoading ? (
                <Skeleton height="300px" />
              ) : planChartData.length > 0 ? (
                <div style={{ height: '300px' }}>
                  <ChartDonut
                    ariaDesc="Répartition des revenus par plan d'abonnement"
                    ariaTitle="Plans d'abonnement"
                    constrainToVisibleArea
                    data={planChartData}
                    labels={({ datum }) => `${datum.x}: ${formatCurrency(datum.y)}`}
                    legendData={planChartData.map((d) => ({ name: d.label }))}
                    legendOrientation="vertical"
                    legendPosition="right"
                    padding={{
                      bottom: 20,
                      left: 20,
                      right: 200,
                      top: 20,
                    }}
                    subTitle="Total"
                    title={formatCurrency(data?.overview.total_revenus || 0)}
                    width={450}
                    height={300}
                    colorScale={planChartData.map((d) => d.color)}
                  />
                </div>
              ) : (
                <EmptyState>
                  <EmptyStateBody>Aucune donnée de plan d'abonnement disponible</EmptyStateBody>
                </EmptyState>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Late Payments List */}
      {hasLatePayments && (
        <Grid hasGutter className="pf-v5-u-mt-lg">
          <GridItem span={12}>
            <Card>
              <CardTitle>
                <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                  <FlexItem>
                    <Title headingLevel="h3" size="lg">
                      Paiements en Retard
                    </Title>
                  </FlexItem>
                  <FlexItem>
                    <Label color="red" icon={<ExclamationTriangleIcon />}>
                      {data.late_payments.length} en retard
                    </Label>
                  </FlexItem>
                </Flex>
              </CardTitle>
              <CardBody>
                {isLoading ? (
                  <Skeleton height="200px" />
                ) : (
                  <DataList aria-label="Paiements en retard" isCompact>
                    {data.late_payments.map((payment) => {
                      const severity = getLateSeverity(payment.jours_retard);
                      return (
                        <DataListItem key={payment.echeance_id}>
                          <DataListItemRow>
                            <DataListItemCells
                              dataListCells={[
                                <DataListCell key="severity" width={1}>
                                  <Label color={severity.color}>{severity.label}</Label>
                                </DataListCell>,
                                <DataListCell key="member" width={3}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem>
                                      <strong>
                                        {payment.utilisateur_prenom} {payment.utilisateur_nom}
                                      </strong>
                                    </FlexItem>
                                    <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                                      ID: {payment.utilisateur_id}
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="amount" width={2}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Montant
                                    </FlexItem>
                                    <FlexItem>
                                      <strong>{formatCurrency(payment.montant)}</strong>
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="dueDate" width={3}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Date d'échéance
                                    </FlexItem>
                                    <FlexItem>
                                      <strong>{formatDate(payment.date_echeance)}</strong>
                                    </FlexItem>
                                    <FlexItem className="pf-v5-u-font-size-xs pf-v5-u-color-200">
                                      {formatRelativeDate(payment.date_echeance)}
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                                <DataListCell key="late" width={2}>
                                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                                    <FlexItem className="pf-v5-u-font-size-sm pf-v5-u-color-200">
                                      Retard
                                    </FlexItem>
                                    <FlexItem>
                                      <strong className="pf-v5-u-danger-color-100">
                                        {payment.jours_retard} jour{payment.jours_retard > 1 ? 's' : ''}
                                      </strong>
                                    </FlexItem>
                                  </Flex>
                                </DataListCell>,
                              ]}
                            />
                          </DataListItemRow>
                        </DataListItem>
                      );
                    })}
                  </DataList>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      )}

      <style>{`
        .finance-stats {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default FinanceStats;
