/**
 * @fileoverview Courses Statistics Page
 * @module features/statistics/pages
 *
 * Detailed statistics page for courses analytics.
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
import { useCourseAnalytics, useInvalidateStatistics } from '../hooks/useStatistics';
import { PeriodSelector } from '../components/PeriodSelector';
import { CourseStats } from '../components/CourseStats';

/**
 * CoursesStatsPage Component
 *
 * Detailed page displaying comprehensive course statistics including:
 * - Total courses, enrollments, attendance
 * - Attendance rate
 * - Distribution by course type
 * - Attendance by day of week
 * - Popular courses
 *
 * @example
 * ```tsx
 * <CoursesStatsPage />
 * ```
 */
export const CoursesStatsPage: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { data, isLoading, error, refetch } = useCourseAnalytics();
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
            Statistiques des Cours
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
              Statistiques des Cours
            </Title>
            <p className="pf-v5-u-color-200 pf-v5-u-mt-sm">
              Vue détaillée des statistiques de fréquentation et performance des cours
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
        <CourseStats data={data} isLoading={isLoading} error={error} />
      </PageSection>
    </Page>
  );
};

export default CoursesStatsPage;
