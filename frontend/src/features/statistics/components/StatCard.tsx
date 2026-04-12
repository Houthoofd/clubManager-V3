/**
 * @fileoverview StatCard Component
 * @module features/statistics/components
 *
 * Reusable card component for displaying a single statistic with trend indicator.
 */

import React from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants,
  Skeleton,
  Icon,
} from '@patternfly/react-core';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { formatNumber, formatCurrency, formatPercentage } from '../utils/formatting';

/**
 * Stat card variant for different types of statistics
 */
export type StatCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Value format type
 */
export type ValueFormat = 'number' | 'currency' | 'percentage';

/**
 * Trend direction
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Props for StatCard component
 */
export interface StatCardProps {
  /** Card title/label */
  title: string;

  /** Main value to display */
  value: number | string;

  /** Format for the value */
  valueFormat?: ValueFormat;

  /** Trend/variation value (optional) */
  trend?: number;

  /** Whether trend is a percentage */
  trendIsPercentage?: boolean;

  /** Trend label/description */
  trendLabel?: string;

  /** Card variant/color */
  variant?: StatCardVariant;

  /** Icon to display */
  icon?: React.ComponentType<any>;

  /** Whether the card is in loading state */
  isLoading?: boolean;

  /** Additional description/subtitle */
  description?: string;

  /** Whether to show the card as compact */
  isCompact?: boolean;

  /** Click handler */
  onClick?: () => void;

  /** Custom className */
  className?: string;
}

/**
 * Get trend direction based on value
 */
const getTrendDirection = (trend: number): TrendDirection => {
  if (trend > 0) return 'up';
  if (trend < 0) return 'down';
  return 'neutral';
};

/**
 * Get color class based on trend direction
 */
const getTrendColor = (direction: TrendDirection): string => {
  switch (direction) {
    case 'up':
      return 'pf-v5-u-success-color-100';
    case 'down':
      return 'pf-v5-u-danger-color-100';
    case 'neutral':
    default:
      return 'pf-v5-u-color-200';
  }
};

/**
 * Get variant color class
 */
const getVariantClass = (variant: StatCardVariant): string => {
  switch (variant) {
    case 'success':
      return 'stat-card--success';
    case 'warning':
      return 'stat-card--warning';
    case 'danger':
      return 'stat-card--danger';
    case 'info':
      return 'stat-card--info';
    case 'default':
    default:
      return '';
  }
};

/**
 * Format value based on format type
 */
const formatValue = (value: number | string, format?: ValueFormat): string => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value, 1);
    case 'number':
    default:
      return formatNumber(value);
  }
};

/**
 * StatCard Component
 *
 * Displays a statistic with optional trend indicator and icon.
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Membres"
 *   value={245}
 *   trend={12.5}
 *   trendLabel="vs mois dernier"
 *   icon={UsersIcon}
 *   variant="success"
 * />
 * ```
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueFormat = 'number',
  trend,
  trendIsPercentage = true,
  trendLabel,
  variant = 'default',
  icon: IconComponent,
  isLoading = false,
  description,
  isCompact = false,
  onClick,
  className = '',
}) => {
  const trendDirection = trend !== undefined ? getTrendDirection(trend) : 'neutral';
  const trendColor = getTrendColor(trendDirection);
  const variantClass = getVariantClass(variant);
  const isClickable = !!onClick;

  const cardClasses = [
    'stat-card',
    variantClass,
    isClickable ? 'stat-card--clickable' : '',
    isCompact ? 'stat-card--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Card
      isClickable={isClickable}
      onClick={onClick}
      className={cardClasses}
      isCompact={isCompact}
    >
      <CardTitle>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {IconComponent && (
            <FlexItem>
              <Icon size="md">
                <IconComponent />
              </Icon>
            </FlexItem>
          )}
          <FlexItem flex={{ default: 'flex_1' }}>
            <TextContent>
              <Text component={TextVariants.small} className="pf-v5-u-color-200">
                {title}
              </Text>
            </TextContent>
          </FlexItem>
        </Flex>
      </CardTitle>

      <CardBody>
        {isLoading ? (
          <>
            <Skeleton width="60%" height="2rem" className="pf-v5-u-mb-sm" />
            {trend !== undefined && <Skeleton width="40%" height="1rem" />}
          </>
        ) : (
          <>
            <TextContent>
              <Text component={TextVariants.h1} className="stat-card__value pf-v5-u-mb-sm">
                {formatValue(value, valueFormat)}
              </Text>
            </TextContent>

            {description && (
              <TextContent className="pf-v5-u-mb-sm">
                <Text component={TextVariants.small} className="pf-v5-u-color-200">
                  {description}
                </Text>
              </TextContent>
            )}

            {trend !== undefined && (
              <Flex
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsXs' }}
              >
                <FlexItem>
                  <Icon size="sm" className={trendColor}>
                    {trendDirection === 'up' && <ArrowUpIcon />}
                    {trendDirection === 'down' && <ArrowDownIcon />}
                    {trendDirection === 'neutral' && <OutlinedQuestionCircleIcon />}
                  </Icon>
                </FlexItem>
                <FlexItem>
                  <TextContent>
                    <Text component={TextVariants.small} className={trendColor}>
                      <strong>
                        {trend > 0 && '+'}
                        {trendIsPercentage ? formatPercentage(trend, 1) : formatNumber(trend, 2)}
                      </strong>
                    </Text>
                  </TextContent>
                </FlexItem>
                {trendLabel && (
                  <FlexItem>
                    <TextContent>
                      <Text component={TextVariants.small} className="pf-v5-u-color-200">
                        {trendLabel}
                      </Text>
                    </TextContent>
                  </FlexItem>
                )}
              </Flex>
            )}
          </>
        )}
      </CardBody>

      <style>{`
        .stat-card {
          height: 100%;
          transition: all 0.2s ease;
        }

        .stat-card--clickable {
          cursor: pointer;
        }

        .stat-card--clickable:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .stat-card--compact .stat-card__value {
          font-size: 1.5rem;
        }

        .stat-card__value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .stat-card--success {
          border-left: 4px solid var(--pf-v5-global--success-color--100);
        }

        .stat-card--warning {
          border-left: 4px solid var(--pf-v5-global--warning-color--100);
        }

        .stat-card--danger {
          border-left: 4px solid var(--pf-v5-global--danger-color--100);
        }

        .stat-card--info {
          border-left: 4px solid var(--pf-v5-global--info-color--100);
        }
      `}</style>
    </Card>
  );
};

export default StatCard;
