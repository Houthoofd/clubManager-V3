/**
 * @fileoverview Statistics Filters Store
 * @module features/statistics/stores
 *
 * Zustand store for managing statistics filters (date ranges, period types).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PeriodType } from '@clubmanager/types';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
} from 'date-fns';

/**
 * Preset period types for quick selection
 */
export type PresetPeriod =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last30Days'
  | 'last90Days'
  | 'thisYear'
  | 'lastYear'
  | 'custom';

/**
 * Statistics filters state
 */
export interface StatisticsFiltersState {
  /** Start date for analytics query */
  dateDebut: Date;

  /** End date for analytics query */
  dateFin: Date;

  /** Period type for trend analysis */
  periodType: PeriodType;

  /** Currently selected preset period */
  preset: PresetPeriod;

  /** Whether trends should be included in dashboard analytics */
  includeTrends: boolean;

  /** Set custom date range */
  setDateRange: (dateDebut: Date, dateFin: Date) => void;

  /** Set period type */
  setPeriodType: (periodType: PeriodType) => void;

  /** Set preset period (auto-calculates dates) */
  setPreset: (preset: PresetPeriod) => void;

  /** Toggle include trends */
  setIncludeTrends: (include: boolean) => void;

  /** Reset to default values */
  reset: () => void;
}

/**
 * Calculate date range based on preset period
 */
const getPresetDateRange = (preset: PresetPeriod): { dateDebut: Date; dateFin: Date } => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        dateDebut: startOfDay(now),
        dateFin: endOfDay(now),
      };

    case 'yesterday':
      return {
        dateDebut: startOfDay(subDays(now, 1)),
        dateFin: endOfDay(subDays(now, 1)),
      };

    case 'thisWeek':
      return {
        dateDebut: startOfWeek(now, { weekStartsOn: 1 }), // Monday
        dateFin: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case 'lastWeek':
      return {
        dateDebut: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        dateFin: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      };

    case 'thisMonth':
      return {
        dateDebut: startOfMonth(now),
        dateFin: endOfMonth(now),
      };

    case 'lastMonth':
      return {
        dateDebut: startOfMonth(subMonths(now, 1)),
        dateFin: endOfMonth(subMonths(now, 1)),
      };

    case 'last30Days':
      return {
        dateDebut: startOfDay(subDays(now, 30)),
        dateFin: endOfDay(now),
      };

    case 'last90Days':
      return {
        dateDebut: startOfDay(subDays(now, 90)),
        dateFin: endOfDay(now),
      };

    case 'thisYear':
      return {
        dateDebut: startOfYear(now),
        dateFin: endOfYear(now),
      };

    case 'lastYear':
      return {
        dateDebut: startOfYear(subYears(now, 1)),
        dateFin: endOfYear(subYears(now, 1)),
      };

    case 'custom':
    default:
      // Return current month as fallback
      return {
        dateDebut: startOfMonth(now),
        dateFin: endOfMonth(now),
      };
  }
};

/**
 * Get default period type based on preset
 */
const getDefaultPeriodType = (preset: PresetPeriod): PeriodType => {
  switch (preset) {
    case 'today':
    case 'yesterday':
      return 'day';

    case 'thisWeek':
    case 'lastWeek':
      return 'day';

    case 'thisMonth':
    case 'lastMonth':
    case 'last30Days':
      return 'week';

    case 'last90Days':
      return 'month';

    case 'thisYear':
    case 'lastYear':
      return 'month';

    case 'custom':
    default:
      return 'month';
  }
};

/**
 * Default state values
 */
const getDefaultState = () => {
  const preset: PresetPeriod = 'thisMonth';
  const { dateDebut, dateFin } = getPresetDateRange(preset);

  return {
    dateDebut,
    dateFin,
    periodType: getDefaultPeriodType(preset) as PeriodType,
    preset,
    includeTrends: true,
  };
};

/**
 * Statistics filters store
 * Persists to localStorage to remember user preferences
 */
export const useStatisticsFiltersStore = create<StatisticsFiltersState>()(
  persist(
    (set) => ({
      ...getDefaultState(),

      setDateRange: (dateDebut: Date, dateFin: Date) => {
        set({
          dateDebut,
          dateFin,
          preset: 'custom',
        });
      },

      setPeriodType: (periodType: PeriodType) => {
        set({ periodType });
      },

      setPreset: (preset: PresetPeriod) => {
        const { dateDebut, dateFin } = getPresetDateRange(preset);
        const periodType = getDefaultPeriodType(preset);

        set({
          preset,
          dateDebut,
          dateFin,
          periodType,
        });
      },

      setIncludeTrends: (includeTrends: boolean) => {
        set({ includeTrends });
      },

      reset: () => {
        set(getDefaultState());
      },
    }),
    {
      name: 'statistics-filters-storage',
      // Custom serialization to handle Date objects
      partialize: (state) => ({
        preset: state.preset,
        periodType: state.periodType,
        includeTrends: state.includeTrends,
        // Store dates as ISO strings
        dateDebut: state.dateDebut.toISOString(),
        dateFin: state.dateFin.toISOString(),
      }),
      // Custom deserialization to convert ISO strings back to Date objects
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.dateDebut = new Date(state.dateDebut);
          state.dateFin = new Date(state.dateFin);
        }
      },
    }
  )
);

/**
 * Hook to get current filter params for API requests
 */
export const useStatisticsParams = () => {
  const { dateDebut, dateFin, periodType, includeTrends } = useStatisticsFiltersStore();

  return {
    date_debut: dateDebut,
    date_fin: dateFin,
    period_type: periodType,
    include_trends: includeTrends,
  };
};
