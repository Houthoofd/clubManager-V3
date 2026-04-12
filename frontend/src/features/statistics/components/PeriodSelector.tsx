/**
 * @fileoverview PeriodSelector Component
 * @module features/statistics/components
 *
 * Component for selecting date ranges and period types for statistics filtering.
 */

import React, { useState } from 'react';
import {
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Select,
  SelectOption,
  SelectVariant,
  Button,
  Flex,
  FlexItem,
  DatePicker,
  Popover,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { CalendarAltIcon, SyncAltIcon, OutlinedCalendarAltIcon } from '@patternfly/react-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { PeriodType } from '@clubmanager/types';
import {
  useStatisticsFiltersStore,
  type PresetPeriod,
} from '../stores/filtersStore';
import { formatDateRange } from '../utils/formatting';

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
  { value: 'today', label: "Aujourd'hui" },
  { value: 'yesterday', label: 'Hier' },
  { value: 'thisWeek', label: 'Cette semaine' },
  { value: 'lastWeek', label: 'Semaine dernière' },
  { value: 'thisMonth', label: 'Ce mois' },
  { value: 'lastMonth', label: 'Mois dernier' },
  { value: 'last30Days', label: '30 derniers jours' },
  { value: 'last90Days', label: '90 derniers jours' },
  { value: 'thisYear', label: 'Cette année' },
  { value: 'lastYear', label: 'Année dernière' },
  { value: 'custom', label: 'Personnalisé' },
];

/**
 * Period type options
 */
const PERIOD_TYPE_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Année' },
];

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

  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isPeriodTypeOpen, setIsPeriodTypeOpen] = useState(false);
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (_event: React.MouseEvent, selection: string) => {
    const selectedPreset = selection as PresetPeriod;
    setPreset(selectedPreset);
    setIsPresetOpen(false);

    if (selectedPreset === 'custom') {
      setShowCustomDates(true);
      setTempStartDate(format(dateDebut, 'yyyy-MM-dd'));
      setTempEndDate(format(dateFin, 'yyyy-MM-dd'));
    } else {
      setShowCustomDates(false);
    }
  };

  /**
   * Handle period type selection
   */
  const handlePeriodTypeSelect = (_event: React.MouseEvent, selection: string) => {
    setPeriodType(selection as PeriodType);
    setIsPeriodTypeOpen(false);
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
    if (preset !== 'custom') {
      setTempStartDate('');
      setTempEndDate('');
    }
  };

  /**
   * Get the selected preset label
   */
  const getSelectedPresetLabel = (): string => {
    const option = PRESET_OPTIONS.find((opt) => opt.value === preset);
    return option?.label || 'Sélectionner une période';
  };

  /**
   * Get the selected period type label
   */
  const getSelectedPeriodTypeLabel = (): string => {
    const option = PERIOD_TYPE_OPTIONS.find((opt) => opt.value === periodType);
    return option?.label || 'Sélectionner';
  };

  return (
    <>
      <Toolbar isFullHeight={!isCompact}>
        <ToolbarContent>
          {/* Preset Period Selector */}
          <ToolbarItem>
            <Select
              variant={SelectVariant.single}
              onToggle={(_event, isOpen) => setIsPresetOpen(isOpen)}
              onSelect={handlePresetSelect}
              selections={preset}
              isOpen={isPresetOpen}
              toggleIcon={<CalendarAltIcon />}
              placeholderText="Période"
              width={isCompact ? '180px' : '220px'}
            >
              {PRESET_OPTIONS.map((option) => (
                <SelectOption key={option.value} value={option.value}>
                  {option.label}
                </SelectOption>
              ))}
            </Select>
          </ToolbarItem>

          {/* Custom Date Range Trigger */}
          {preset === 'custom' && !showCustomDates && (
            <ToolbarItem>
              <Button
                variant="link"
                icon={<OutlinedCalendarAltIcon />}
                onClick={() => setShowCustomDates(true)}
              >
                {formatDateRange(dateDebut, dateFin)}
              </Button>
            </ToolbarItem>
          )}

          {/* Period Type Selector */}
          {showPeriodType && (
            <ToolbarItem>
              <Select
                variant={SelectVariant.single}
                onToggle={(_event, isOpen) => setIsPeriodTypeOpen(isOpen)}
                onSelect={handlePeriodTypeSelect}
                selections={periodType}
                isOpen={isPeriodTypeOpen}
                placeholderText="Type de période"
                width={isCompact ? '140px' : '160px'}
              >
                {PERIOD_TYPE_OPTIONS.map((option) => (
                  <SelectOption key={option.value} value={option.value}>
                    {option.label}
                  </SelectOption>
                ))}
              </Select>
            </ToolbarItem>
          )}

          {/* Refresh Button */}
          {showRefresh && onRefresh && (
            <ToolbarItem>
              <Button
                variant="secondary"
                icon={<SyncAltIcon />}
                onClick={onRefresh}
                isLoading={isRefreshing}
                isDisabled={isRefreshing}
              >
                {isCompact ? '' : 'Actualiser'}
              </Button>
            </ToolbarItem>
          )}

          {/* Current Period Info (on non-custom) */}
          {preset !== 'custom' && !isCompact && (
            <ToolbarItem alignment={{ default: 'alignRight' }}>
              <TextContent>
                <Text component={TextVariants.small} className="pf-v5-u-color-200">
                  {formatDateRange(dateDebut, dateFin)}
                </Text>
              </TextContent>
            </ToolbarItem>
          )}
        </ToolbarContent>
      </Toolbar>

      {/* Custom Date Range Popover */}
      {showCustomDates && (
        <div className="pf-v5-u-mt-md pf-v5-u-mb-md">
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsMd' }}
            className="custom-date-range-selector"
          >
            <FlexItem>
              <TextContent>
                <Text component={TextVariants.h4}>Période personnalisée</Text>
              </TextContent>
            </FlexItem>

            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsMd' }}>
                <FlexItem>
                  <div>
                    <label htmlFor="start-date" className="pf-v5-u-mb-xs pf-v5-u-display-block">
                      Date de début
                    </label>
                    <DatePicker
                      value={tempStartDate}
                      onChange={(_event, value) => setTempStartDate(value)}
                      placeholder="YYYY-MM-DD"
                      inputProps={{ id: 'start-date' }}
                      locale={fr.code}
                    />
                  </div>
                </FlexItem>

                <FlexItem>
                  <div>
                    <label htmlFor="end-date" className="pf-v5-u-mb-xs pf-v5-u-display-block">
                      Date de fin
                    </label>
                    <DatePicker
                      value={tempEndDate}
                      onChange={(_event, value) => setTempEndDate(value)}
                      placeholder="YYYY-MM-DD"
                      inputProps={{ id: 'end-date' }}
                      locale={fr.code}
                      rangeStart={tempStartDate ? new Date(tempStartDate) : undefined}
                    />
                  </div>
                </FlexItem>
              </Flex>
            </FlexItem>

            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <Button variant="primary" onClick={handleApplyCustomDates}>
                    Appliquer
                  </Button>
                </FlexItem>
                <FlexItem>
                  <Button variant="link" onClick={handleCancelCustomDates}>
                    Annuler
                  </Button>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        </div>
      )}

      <style>{`
        .custom-date-range-selector {
          padding: 1rem;
          background-color: var(--pf-v5-global--BackgroundColor--light-100);
          border: 1px solid var(--pf-v5-global--BorderColor--100);
          border-radius: 4px;
        }

        .custom-date-range-selector label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--pf-v5-global--Color--100);
        }
      `}</style>
    </>
  );
};

export default PeriodSelector;
