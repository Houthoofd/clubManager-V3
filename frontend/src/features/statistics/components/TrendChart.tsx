/**
 * @fileoverview TrendChart Component
 * @module features/statistics/components
 *
 * Chart component for displaying trend data over time using PatternFly Charts.
 */

import React from 'react';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartThemeColor,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import {
  Card,
  CardTitle,
  CardBody,
  Skeleton,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
  Title,
  Flex,
  FlexItem,
  Label,
} from '@patternfly/react-core';
import { ChartLineIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import type { TrendDataPoint } from '@clubmanager/types';
import { formatNumber, formatCurrency, formatPercentage, formatDate } from '../utils/formatting';

/**
 * Trend chart type
 */
export type TrendChartType = 'line' | 'area';

/**
 * Value format for Y-axis
 */
export type TrendValueFormat = 'number' | 'currency' | 'percentage';

/**
 * Chart data point
 */
export interface ChartDataPoint {
  x: Date | string | number;
  y: number;
  name?: string;
}

/**
 * Props for TrendChart component
 */
export interface TrendChartProps {
  /** Chart title */
  title: string;

  /** Chart subtitle/description */
  subtitle?: string;

  /** Trend data points */
  data: TrendDataPoint[];

  /** Chart type */
  chartType?: TrendChartType;

  /** Value format for Y-axis */
  valueFormat?: TrendValueFormat;

  /** Chart height in pixels */
  height?: number;

  /** Chart theme color */
  themeColor?: ChartThemeColor;

  /** Whether the chart is loading */
  isLoading?: boolean;

  /** Custom color for the line */
  color?: string;

  /** Show grid lines */
  showGrid?: boolean;

  /** Show legend */
  showLegend?: boolean;

  /** Custom legend label */
  legendLabel?: string;

  /** Show average line */
  showAverage?: boolean;

  /** Average value */
  averageValue?: number;

  /** Show variation badge */
  showVariation?: boolean;

  /** Total variation percentage */
  totalVariation?: number;

  /** Custom className */
  className?: string;

  /** Compact mode */
  isCompact?: boolean;
}

/**
 * Format value based on format type
 */
const formatYAxisValue = (value: number, format: TrendValueFormat): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value, false);
    case 'percentage':
      return formatPercentage(value, 0, false);
    case 'number':
    default:
      return formatNumber(value, 0);
  }
};

/**
 * Format tooltip value
 */
const formatTooltipValue = (value: number, format: TrendValueFormat): string => {
  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percentage':
      return formatPercentage(value, 1);
    case 'number':
    default:
      return formatNumber(value, 0);
  }
};

/**
 * Convert TrendDataPoint to chart data format
 */
const convertToChartData = (data: TrendDataPoint[]): ChartDataPoint[] => {
  return data.map((point) => ({
    x: new Date(point.date_debut),
    y: point.valeur,
    name: point.periode,
  }));
};

/**
 * Get variation color
 */
const getVariationColor = (variation: number): 'green' | 'red' | 'grey' => {
  if (variation > 0) return 'green';
  if (variation < 0) return 'red';
  return 'grey';
};

/**
 * TrendChart Component
 *
 * Displays trend data as a line or area chart with PatternFly Charts.
 *
 * @example
 * ```tsx
 * <TrendChart
 *   title="Croissance des membres"
 *   data={trendData}
 *   valueFormat="number"
 *   showVariation
 *   totalVariation={12.5}
 * />
 * ```
 */
export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  subtitle,
  data,
  chartType = 'line',
  valueFormat = 'number',
  height = 250,
  themeColor = ChartThemeColor.blue,
  isLoading = false,
  color,
  showGrid = true,
  showLegend = false,
  legendLabel,
  showAverage = false,
  averageValue,
  showVariation = false,
  totalVariation,
  className = '',
  isCompact = false,
}) => {
  // Convert data to chart format
  const chartData = React.useMemo(() => convertToChartData(data), [data]);

  // Calculate domain for better chart scaling
  const yValues = chartData.map((d) => d.y);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const yPadding = (maxY - minY) * 0.1 || 1;

  // Average line data
  const averageLineData = React.useMemo(() => {
    if (!showAverage || averageValue === undefined) return [];
    return chartData.map((d) => ({
      x: d.x,
      y: averageValue,
    }));
  }, [showAverage, averageValue, chartData]);

  return (
    <Card isCompact={isCompact} className={`trend-chart ${className}`}>
      <CardTitle>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
              <FlexItem>
                <Title headingLevel="h3" size={isCompact ? 'md' : 'lg'}>
                  {title}
                </Title>
              </FlexItem>
              {subtitle && (
                <FlexItem className="pf-v5-u-color-200 pf-v5-u-font-size-sm">
                  {subtitle}
                </FlexItem>
              )}
            </Flex>
          </FlexItem>

          {showVariation && totalVariation !== undefined && (
            <FlexItem>
              <Label color={getVariationColor(totalVariation)}>
                {totalVariation > 0 && '+'}
                {formatPercentage(totalVariation, 1)}
              </Label>
            </FlexItem>
          )}
        </Flex>
      </CardTitle>

      <CardBody>
        {isLoading ? (
          <Skeleton height={`${height}px`} />
        ) : data.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon icon={ExclamationTriangleIcon} />
            <Title headingLevel="h4" size="lg">
              Aucune donnée disponible
            </Title>
            <EmptyStateBody>
              Il n'y a pas de données de tendance pour la période sélectionnée.
            </EmptyStateBody>
          </EmptyState>
        ) : (
          <div style={{ height: `${height}px` }}>
            <Chart
              ariaDesc={`Graphique de tendance: ${title}`}
              ariaTitle={title}
              containerComponent={
                <ChartVoronoiContainer
                  labels={({ datum }) => {
                    if (datum.childName === 'average') {
                      return `Moyenne: ${formatTooltipValue(datum.y, valueFormat)}`;
                    }
                    return `${datum.name}\n${formatTooltipValue(datum.y, valueFormat)}`;
                  }}
                  constrainToVisibleArea
                />
              }
              height={height}
              padding={{
                bottom: 50,
                left: 70,
                right: 20,
                top: 20,
              }}
              themeColor={themeColor}
              domain={{
                y: [Math.max(0, minY - yPadding), maxY + yPadding],
              }}
            >
              <ChartAxis
                showGrid={showGrid}
                tickFormat={(x) => {
                  const date = new Date(x);
                  return formatDate(date, 'dd/MM');
                }}
              />
              <ChartAxis
                dependentAxis
                showGrid={showGrid}
                tickFormat={(y) => formatYAxisValue(y, valueFormat)}
              />
              <ChartGroup>
                <ChartLine
                  data={chartData}
                  interpolation="monotoneX"
                  style={{
                    data: {
                      stroke: color || undefined,
                      strokeWidth: 2,
                    },
                  }}
                  name={legendLabel || title}
                />
                {showAverage && averageLineData.length > 0 && (
                  <ChartLine
                    data={averageLineData}
                    name="average"
                    style={{
                      data: {
                        stroke: 'var(--pf-v5-global--palette--black-500)',
                        strokeWidth: 1,
                        strokeDasharray: '5,5',
                      },
                    }}
                  />
                )}
              </ChartGroup>
            </Chart>
          </div>
        )}
      </CardBody>

      <style>{`
        .trend-chart {
          height: 100%;
        }

        .trend-chart .pf-v5-c-card__body {
          padding-top: 0;
        }
      `}</style>
    </Card>
  );
};

export default TrendChart;
