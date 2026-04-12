/**
 * @fileoverview Members Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for members analytics.
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
import { useMemberAnalytics, useInvalidateStatistics } from '../hooks/useStatistics';
import { PeriodSelector } from '../components/PeriodSelector';
import { MemberStats } from '../components/MemberStats';

/**
 * MembersStatsPage Component
 *
 * Detailed page displaying comprehensive member statistics including:
 * - Total members, active, inactive
 * - New members and growth rate
 * - Distribution by grade, gender, and age group
 *
 * @example
 * ```tsx
 * <MembersStatsPage />
 * ```
 */
export const MembersStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useMemberAnalytics();
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
            Statistiques des Membres
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
              Statistiques des Membres
            </Title>
            <p className="pf-v5-u-color-200 pf-v5-u-mt-sm">
              Vue détaillée des statistiques et analytics des membres du club
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
        <MemberStats data={data} isLoading={isLoading} error={error} />
      </PageSection>
    </Page>
  );
};

export default MembersStatsPage;
