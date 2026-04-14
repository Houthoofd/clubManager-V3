/**
 * @fileoverview StatCard Component
 * @module features/statistics/components
 *
 * Reusable card component for displaying a single statistic with trend indicator.
 */

import React from "react";
import {
  formatNumber,
  formatCurrency,
  formatPercentage,
} from "../utils/formatting";

/**
 * Stat card variant for different types of statistics
 */
export type StatCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

/**
 * Value format type
 */
export type ValueFormat = "number" | "currency" | "percentage";

/**
 * Trend direction
 */
export type TrendDirection = "up" | "down" | "neutral";

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
  if (trend > 0) return "up";
  if (trend < 0) return "down";
  return "neutral";
};

/**
 * Get color classes based on trend direction
 */
const getTrendColorClasses = (direction: TrendDirection): string => {
  switch (direction) {
    case "up":
      return "text-green-500";
    case "down":
      return "text-red-500";
    case "neutral":
    default:
      return "text-gray-500";
  }
};

/**
 * Get variant border class
 */
const getVariantBorderClass = (variant: StatCardVariant): string => {
  switch (variant) {
    case "success":
      return "border-l-4 border-l-green-500";
    case "warning":
      return "border-l-4 border-l-yellow-500";
    case "danger":
      return "border-l-4 border-l-red-500";
    case "info":
      return "border-l-4 border-l-blue-500";
    case "default":
    default:
      return "";
  }
};

/**
 * Format value based on format type
 */
const formatValue = (value: number | string, format?: ValueFormat): string => {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return formatCurrency(value);
    case "percentage":
      return formatPercentage(value, 1);
    case "number":
    default:
      return formatNumber(value);
  }
};

/**
 * ArrowUp Icon SVG
 */
const ArrowUpIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
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
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
);

/**
 * ArrowDown Icon SVG
 */
const ArrowDownIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
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
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

/**
 * Question Icon SVG
 */
const QuestionIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
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
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
  valueFormat = "number",
  trend,
  trendIsPercentage = true,
  trendLabel,
  variant = "default",
  icon: IconComponent,
  isLoading = false,
  description,
  isCompact = false,
  onClick,
  className = "",
}) => {
  const trendDirection =
    trend !== undefined ? getTrendDirection(trend) : "neutral";
  const trendColorClasses = getTrendColorClasses(trendDirection);
  const variantBorderClass = getVariantBorderClass(variant);
  const isClickable = !!onClick;

  const containerClasses = [
    "bg-white rounded-lg shadow p-6",
    variantBorderClass,
    isClickable
      ? "cursor-pointer hover:shadow-lg transition-shadow duration-200"
      : "",
    isCompact ? "p-4" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses} onClick={onClick}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {IconComponent && (
          <div className="flex-shrink-0">
            <IconComponent className="h-5 w-5 text-gray-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
      </div>

      {/* Body */}
      <div>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/5 mb-2" />
            {trend !== undefined && <Skeleton className="h-4 w-2/5" />}
          </>
        ) : (
          <>
            <div
              className={`font-bold text-gray-900 mb-2 ${isCompact ? "text-2xl" : "text-3xl"}`}
            >
              {formatValue(value, valueFormat)}
            </div>

            {description && (
              <p className="text-sm text-gray-600 mb-2">{description}</p>
            )}

            {trend !== undefined && (
              <div className="flex items-center gap-1">
                <div className={`flex-shrink-0 ${trendColorClasses}`}>
                  {trendDirection === "up" && (
                    <ArrowUpIcon className="h-4 w-4" />
                  )}
                  {trendDirection === "down" && (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                  {trendDirection === "neutral" && (
                    <QuestionIcon className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-sm font-semibold ${trendColorClasses}`}>
                  {trend > 0 && "+"}
                  {trendIsPercentage
                    ? formatPercentage(trend, 1)
                    : formatNumber(trend, 2)}
                </span>
                {trendLabel && (
                  <span className="text-sm text-gray-600 ml-1">
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StatCard;
