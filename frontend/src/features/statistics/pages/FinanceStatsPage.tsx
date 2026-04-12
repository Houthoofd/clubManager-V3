/**
 * @fileoverview Finance Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for financial analytics.
 */

import React from 'react';
import {
  Page,
  PageSection,
  PageSectionVariants,
  Title,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  Button,
} from '@patternfly/react-core';
import { ArrowLeftIcon } from '@patternfly/react-icons';
import { useFinancialAnalytics, useInvalidateStatistics } from '../hooks/useStatistics';
import { PeriodSelector } from '../components/PeriodSelector';
import { FinanceStats } from '../components/FinanceStats';

/**
 * FinanceStatsPage Component
 *
 * Detailed page displaying comprehensive financial statistics including:
 * - Total revenue and payment status
 * - Late payments with alerts
 * - Revenue distribution by payment method
 * - Revenue distribution by subscription plan
 *
 * @example
 * ```tsx
 * <FinanceStatsPage />
 * ```
 */
export const FinanceStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useFinancialAnalytics();
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
    <Page>
      {/* Breadcrumb */}
      <PageSection variant={PageSectionVariants.light} className="pf-v5-u-pb-0">
        <Breadcrumb>
          <BreadcrumbItem to="#" onClick={handleBackToDashboard}>
            Tableau de bord
          </BreadcrumbItem>
          <BreadcrumbItem to="#" isActive>
            Statistiques Financières
          </BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {/* Page Header */}
      <PageSection variant={PageSectionVariants.light} className="pf-v5-u-pb-0">
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsCenter' }}
          className="pf-v5-u-mb-md"
        >
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Statistiques Financières
            </Title>
            <p className="pf-v5-u-color-200 pf-v5-u-mt-sm">
              Vue détaillée des revenus, paiements et analytics financiers
            </p>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              icon={<ArrowLeftIcon />}
              onClick={handleBackToDashboard}
            >
              Retour au tableau de bord
            </Button>
          </FlexItem>
        </Flex>

        {/* Period Selector */}
        <PeriodSelector
          showPeriodType={false}
          showRefresh
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      </PageSection>

      {/* Main Content */}
      <PageSection>
        <FinanceStats data={data} isLoading={isLoading} error={error} />
      </PageSection>
    </Page>
  );
};

export default FinanceStatsPage;
