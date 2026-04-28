/**
 * @fileoverview Formatting Utilities for Statistics
 * @module features/statistics/utils
 *
 * Utility functions for formatting numbers, currencies, percentages, and dates
 * for display in statistics views.
 */

import { format, formatDistance, formatRelative } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Format a number with French locale formatting
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.567) // "1 234"
 * formatNumber(1234.567, 2) // "1 234,57"
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a currency amount in euros
 *
 * @param value - The amount to format
 * @param showSymbol - Whether to show the € symbol (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "1 234,56 €"
 * formatCurrency(1234.56, false) // "1 234,56"
 */
export const formatCurrency = (
  value: number,
  showSymbol: boolean = true,
): string => {
  if (showSymbol) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a percentage value
 *
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param showSign - Whether to show the % sign (default: true)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(75.5) // "75,5 %"
 * formatPercentage(75.5, 0) // "76 %"
 * formatPercentage(75.5, 2, false) // "75,50"
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  showSign: boolean = true,
): string => {
  const formatted = formatNumber(value, decimals);
  return showSign ? `${formatted} %` : formatted;
};

/**
 * Format a variation/trend value with sign and color indicator
 *
 * @param value - The variation value (can be positive or negative)
 * @param isPercentage - Whether the value is a percentage (default: true)
 * @returns Object with formatted string and trend direction
 *
 * @example
 * formatVariation(12.5) // { text: "+12,5 %", direction: "up" }
 * formatVariation(-5.2) // { text: "-5,2 %", direction: "down" }
 * formatVariation(0) // { text: "0,0 %", direction: "neutral" }
 */
export const formatVariation = (
  value: number,
  isPercentage: boolean = true,
): {
  text: string;
  direction: "up" | "down" | "neutral";
  color: "success" | "danger" | "muted";
} => {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "neutral";
  const color = value > 0 ? "success" : value < 0 ? "danger" : "muted";

  const sign = value > 0 ? "+" : "";
  const formatted = isPercentage
    ? formatPercentage(value)
    : formatNumber(value, 2);

  return {
    text: `${sign}${formatted}`,
    direction,
    color,
  };
};

/**
 * Format a date using French locale
 *
 * @param date - The date to format
 * @param formatStr - The format string (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2024-01-15')) // "15/01/2024"
 * formatDate(new Date('2024-01-15'), 'dd MMMM yyyy') // "15 janvier 2024"
 */
export const formatDate = (
  date: Date | string,
  formatStr: string = "dd/MM/yyyy",
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

/**
 * Format a date range
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange(new Date('2024-01-01'), new Date('2024-01-31'))
 * // "01/01/2024 - 31/01/2024"
 */
export const formatDateRange = (
  startDate: Date | string,
  endDate: Date | string,
): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Format a relative date (e.g., "il y a 2 jours")
 *
 * @param date - The date to format
 * @returns Relative date string
 *
 * @example
 * formatRelativeDate(subDays(new Date(), 2)) // "il y a 2 jours"
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr });
};

/**
 * Format a compact number (e.g., 1.2K, 3.5M)
 *
 * @param value - The number to format
 * @returns Compact formatted number
 *
 * @example
 * formatCompactNumber(1234) // "1,2K"
 * formatCompactNumber(1234567) // "1,2M"
 */
export const formatCompactNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 1)}M`;
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 1)}K`;
  }
  return formatNumber(value);
};

/**
 * Format a duration in minutes to hours and minutes
 *
 * @param minutes - The duration in minutes
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(90) // "1h 30min"
 * formatDuration(45) // "45min"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
};

/**
 * Get color class based on value threshold
 *
 * @param value - The value to check
 * @param thresholds - Object with min/max thresholds
 * @returns Color variant name
 *
 * @example
 * getColorByThreshold(85, { success: 80, warning: 50 }) // "success"
 * getColorByThreshold(60, { success: 80, warning: 50 }) // "warning"
 */
export const getColorByThreshold = (
  value: number,
  thresholds: { success?: number; warning?: number },
): "success" | "warning" | "danger" => {
  if (thresholds.success && value >= thresholds.success) {
    return "success";
  }
  if (thresholds.warning && value >= thresholds.warning) {
    return "warning";
  }
  return "danger";
};

/**
 * Truncate text with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * truncateText("Long text here", 10) // "Long text..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format a time string (HH:mm)
 *
 * @param time - The time string to format
 * @returns Formatted time string
 *
 * @example
 * formatTime("14:30:00") // "14h30"
 * formatTime("09:00") // "09h00"
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  return `${hours}h${minutes}`;
};

/**
 * Format day of week name
 *
 * @param dayNumber - Day number (1-7, Monday-Sunday)
 * @returns Day name in French
 *
 * @example
 * formatDayOfWeek(1) // "Lundi"
 * formatDayOfWeek(7) // "Dimanche"
 */
export const formatDayOfWeek = (dayNumber: number): string => {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  return days[dayNumber] ?? "Lundi";
};

/**
 * Format stock status with color
 *
 * @param status - Stock status
 * @returns Object with label and color
 */
export const formatStockStatus = (
  status: "bas" | "critique" | "rupture",
): { label: string; color: "warning" | "danger" } => {
  const statusMap = {
    bas: { label: "Stock bas", color: "warning" as const },
    critique: { label: "Stock critique", color: "danger" as const },
    rupture: { label: "Rupture", color: "danger" as const },
  };

  return statusMap[status];
};

/**
 * Calculate average from an array of numbers
 *
 * @param values - Array of numbers
 * @returns Average value
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Format file size in human-readable format
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string
 *
 * @example
 * formatFileSize(1024) // "1 Ko"
 * formatFileSize(1048576) // "1 Mo"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 o";

  const k = 1024;
  const sizes = ["o", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
