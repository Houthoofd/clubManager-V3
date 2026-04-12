/**
 * @fileoverview TrendChart Component
 * @module features/statistics/components
 *
 * Chart component for displaying trend data over time.
 */

import React from "react";
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDate,
} from "../utils/formatting";

/**
 * Trend data point interface
 */
export interface TrendDataPoint {
  date_debut: string;
  date_fin?: string;
  periode: string;
  valeur: number;
}

/**
 * Trend chart type
 */
export type TrendChartType = "line" | "area";

/**
 * Value format for Y-axis
 */
export type TrendValueFormat = "number" | "currency" | "percentage";

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

  /** Chart theme color - ignored in simplified version */
  themeColor?: any;

  /** Whether the chart is loading */
  isLoading?: boolean;

  /** Custom color for the line */
  color?: string;

  /** Show grid lines - ignored in simplified version */
  showGrid?: boolean;

  /** Show legend - ignored in simplified version */
  showLegend?: boolean;

  /** Custom legend label */
  legendLabel?: string;

  /** Show average line - ignored in simplified version */
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
const formatValue = (value: number, format: TrendValueFormat): string => {
  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return formatPercentage(value, 1);
    case "number":
    default:
      return formatNumber(value, 0);
  }
};

/**
 * Get variation color
 */
const getVariationColor = (variation: number): "green" | "red" | "gray" => {
  if (variation > 0) return "green";
  if (variation < 0) return "red";
  return "gray";
};

/**
 * Get variation badge classes
 */
const getVariationBadgeClasses = (variation: number): string => {
  const color = getVariationColor(variation);
  switch (color) {
    case "green":
      return "bg-green-100 text-green-800";
    case "red":
      return "bg-red-100 text-red-800";
    case "gray":
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Warning Icon SVG
 */
const WarningIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

/**
 * Skeleton Loader Component
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

/**
 * TrendChart Component
 *
 * Displays trend data as a visual chart with bars.
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
  valueFormat = "number",
  height = 250,
  isLoading = false,
  showVariation = false,
  totalVariation,
  className = "",
  isCompact = false,
}) => {
  // Calculate max value for scaling bars
  const maxValue = React.useMemo(() => {
    if (data.length === 0) return 100;
    return Math.max(...data.map((d) => d.valeur));
  }, [data]);

  const containerClasses = [
    "bg-white rounded-lg shadow p-6",
    isCompact ? "p-4" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className={`font-semibold text-gray-900 ${isCompact ? "text-base" : "text-lg"}`}
          >
            {title}
          </h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>

        {showVariation && totalVariation !== undefined && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariationBadgeClasses(totalVariation)}`}
          >
            {totalVariation > 0 && "+"}
            {formatPercentage(totalVariation, 1)}
          </span>
        )}
      </div>

      {/* Body */}
      {isLoading ? (
        <div
          className={`w-full animate-pulse bg-gray-200 rounded`}
          style={{ height: `${height}px` }}
        ></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <WarningIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aucune donnée disponible
          </h4>
          <p className="text-sm text-gray-600">
            Il n'y a pas de données de tendance pour la période sélectionnée.
          </p>
        </div>
      ) : (
        <div className="space-y-3" style={{ minHeight: `${height}px` }}>
          {data.map((point, index) => {
            const barHeight = (point.valeur / maxValue) * 100;
            const date = new Date(point.date_debut);

            return (
              <div key={index} className="flex items-center gap-3">
                {/* Period Label */}
                <div className="w-24 flex-shrink-0">
                  <div className="text-xs font-medium text-gray-900">
                    {point.periode}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(date, "dd/MM")}
                  </div>
                </div>

                {/* Bar Container */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${barHeight}%` }}
                    >
                      {barHeight > 20 && (
                        <span className="text-xs font-medium text-white">
                          {formatValue(point.valeur, valueFormat)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Value (outside bar if bar is too small) */}
                  {barHeight <= 20 && (
                    <span className="text-xs font-medium text-gray-900 w-20 text-right">
                      {formatValue(point.valeur, valueFormat)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendChart;
