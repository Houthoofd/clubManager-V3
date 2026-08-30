import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationTriangleIcon } from "./CourseStatsIcons";
import { formatNumber } from "../utils/formatting";

const CHART_COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
];

export interface DistributionChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    percentage: number;
    extra?: string;
  }>;
  isLoading?: boolean;
  noDataText?: string;
}

export function DistributionChart({
  title,
  data,
  isLoading,
  noDataText,
}: DistributionChartProps) {
  const { t } = useTranslation("statistics");
  const resolvedNoDataText = noDataText ?? t("empty.noData");
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">{resolvedNoDataText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * 100;
          const colorClass = CHART_COLORS[index % CHART_COLORS.length];

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <span className="text-sm text-gray-600">
                  {formatNumber(item.value)}
                  {item.extra && ` • ${item.extra}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${colorClass} transition-all duration-300`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
