/**
 * @fileoverview PeriodSelector Component
 * @module features/statistics/components
 *
 * Component for selecting date ranges and period types for statistics filtering.
 */

import { useState } from "react";
import { format } from "date-fns";
import type { PeriodType } from "@clubmanager/types";
import {
  useStatisticsFiltersStore,
  type PresetPeriod,
} from "../stores/filtersStore";
import { formatDateRange } from "../utils/formatting";

/**
 * Props for PeriodSelector component
 */
export interface PeriodSelectorProps {
  /** Whether to show the period type selector */
  showPeriodType?: boolean;

  /** Whether to show the refresh button */
  showRefresh?: boolean;

  /** Callback when refresh is clicked */
  onRefresh?: () => void;

  /** Whether the refresh is in progress */
  isRefreshing?: boolean;

  /** Compact mode for smaller displays */
  isCompact?: boolean;
}

/**
 * Preset period options
 */
const PRESET_OPTIONS: { value: PresetPeriod; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "thisWeek", label: "Cette semaine" },
  { value: "lastWeek", label: "Semaine dernière" },
  { value: "thisMonth", label: "Ce mois" },
  { value: "lastMonth", label: "Mois dernier" },
  { value: "last30Days", label: "30 derniers jours" },
  { value: "last90Days", label: "90 derniers jours" },
  { value: "thisYear", label: "Cette année" },
  { value: "lastYear", label: "Année dernière" },
  { value: "custom", label: "Personnalisé" },
];

/**
 * Period type options
 */
const PERIOD_TYPE_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: "day", label: "Jour" },
  { value: "week", label: "Semaine" },
  { value: "month", label: "Mois" },
  { value: "quarter", label: "Trimestre" },
  { value: "year", label: "Année" },
];

// SVG Icons
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

/**
 * PeriodSelector Component
 *
 * Provides controls for selecting date ranges and period types for statistics.
 *
 * @example
 * ```tsx
 * <PeriodSelector
 *   showPeriodType
 *   showRefresh
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  showPeriodType = true,
  showRefresh = true,
  onRefresh,
  isRefreshing = false,
  isCompact = false,
}) => {
  const {
    dateDebut,
    dateFin,
    periodType,
    preset,
    setPreset,
    setPeriodType,
    setDateRange,
  } = useStatisticsFiltersStore();

  const [showCustomDates, setShowCustomDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPreset = e.target.value as PresetPeriod;
    setPreset(selectedPreset);

    if (selectedPreset === "custom") {
      setShowCustomDates(true);
      setTempStartDate(format(dateDebut, "yyyy-MM-dd"));
      setTempEndDate(format(dateFin, "yyyy-MM-dd"));
    } else {
      setShowCustomDates(false);
    }
  };

  /**
   * Handle period type selection
   */
  const handlePeriodTypeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriodType(e.target.value as PeriodType);
  };

  /**
   * Handle custom date range apply
   */
  const handleApplyCustomDates = () => {
    if (tempStartDate && tempEndDate) {
      const start = new Date(tempStartDate);
      const end = new Date(tempEndDate);

      if (start <= end) {
        setDateRange(start, end);
        setShowCustomDates(false);
      }
    }
  };

  /**
   * Handle custom date range cancel
   */
  const handleCancelCustomDates = () => {
    setShowCustomDates(false);
    if (preset !== "custom") {
      setTempStartDate("");
      setTempEndDate("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-3 ${isCompact ? "gap-2" : "gap-3"}`}
      >
        {/* Preset Period Selector */}
        <div className="relative">
          <select
            value={preset}
            onChange={handlePresetSelect}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pl-3 pr-10 bg-white"
            style={{ minWidth: isCompact ? "180px" : "220px" }}
          >
            {PRESET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Date Range Trigger */}
        {preset === "custom" && !showCustomDates && (
          <button
            onClick={() => setShowCustomDates(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            {formatDateRange(dateDebut, dateFin)}
          </button>
        )}

        {/* Period Type Selector */}
        {showPeriodType && (
          <div className="relative">
            <select
              value={periodType}
              onChange={handlePeriodTypeSelect}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 pl-3 pr-10 bg-white"
              style={{ minWidth: isCompact ? "140px" : "160px" }}
            >
              {PERIOD_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Refresh Button */}
        {showRefresh && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshIcon
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {!isCompact && "Actualiser"}
          </button>
        )}

        {/* Current Period Info */}
        {preset !== "custom" && !isCompact && (
          <div className="ml-auto text-sm text-gray-500">
            {formatDateRange(dateDebut, dateFin)}
          </div>
        )}
      </div>

      {/* Custom Date Range Panel */}
      {showCustomDates && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Période personnalisée
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date de début
              </label>
              <input
                type="date"
                id="start-date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date de fin
              </label>
              <input
                type="date"
                id="end-date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={tempStartDate}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleApplyCustomDates}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Appliquer
            </button>
            <button
              onClick={handleCancelCustomDates}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
