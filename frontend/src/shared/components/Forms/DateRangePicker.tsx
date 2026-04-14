/**
 * DateRangePicker Component
 *
 * Composant réutilisable pour sélectionner une plage de dates (date de début et date de fin).
 * Utilise des inputs HTML natifs `<input type="date">` avec validation automatique et raccourcis prédéfinis.
 *
 * @example
 * // Exemple 1 : Usage basique
 * const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
 *
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   label="Période"
 * />
 *
 * @example
 * // Exemple 2 : Avec raccourcis prédéfinis
 * const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
 *
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   label="Sélectionner une période"
 *   showPresets
 * />
 *
 * @example
 * // Exemple 3 : Avec validation et limites
 * const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
 * const [error, setError] = useState('');
 *
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={(range) => {
 *     setDateRange(range);
 *     setError('');
 *   }}
 *   minDate="2024-01-01"
 *   maxDate="2024-12-31"
 *   error={error}
 * />
 *
 * @example
 * // Exemple 4 : Pour filtres de paiements
 * const [filters, setFilters] = useState({
 *   dateRange: { startDate: null, endDate: null },
 *   status: 'all',
 * });
 *
 * <div className="flex items-end gap-3">
 *   <DateRangePicker
 *     value={filters.dateRange}
 *     onChange={(range) => setFilters({ ...filters, dateRange: range })}
 *     label="Période de paiement"
 *     showPresets
 *   />
 *   <Button onClick={handleFilter}>Filtrer</Button>
 * </div>
 *
 * @example
 * // Exemple 5 : Pour rapports avec validation
 * const [reportRange, setReportRange] = useState({ startDate: null, endDate: null });
 * const [validationError, setValidationError] = useState('');
 *
 * const handleRangeChange = (range: DateRange) => {
 *   setReportRange(range);
 *   if (range.startDate && range.endDate) {
 *     const start = new Date(range.startDate);
 *     const end = new Date(range.endDate);
 *     const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
 *     if (diffDays > 365) {
 *       setValidationError('La période ne peut pas dépasser 365 jours');
 *     } else {
 *       setValidationError('');
 *     }
 *   }
 * };
 *
 * <DateRangePicker
 *   value={reportRange}
 *   onChange={handleRangeChange}
 *   label="Période du rapport"
 *   showPresets
 *   error={validationError}
 * />
 *
 * @example
 * // Exemple 6 : Désactivé avec valeur par défaut
 * const [dateRange, setDateRange] = useState({
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31',
 * });
 *
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   label="Année fiscale"
 *   disabled
 * />
 */

import { cn } from "../../styles/designTokens";

// ─── TYPES ───────────────────────────────────────────────────────────────────

/**
 * Représente une plage de dates
 */
export interface DateRange {
  /**
   * Date de début au format ISO (YYYY-MM-DD)
   */
  startDate: string | null;

  /**
   * Date de fin au format ISO (YYYY-MM-DD)
   */
  endDate: string | null;
}

/**
 * Props du composant DateRangePicker
 */
export interface DateRangePickerProps {
  /**
   * Plage de dates sélectionnée
   * @required
   */
  value: DateRange;

  /**
   * Fonction appelée lors du changement de la plage de dates
   * @required
   */
  onChange: (range: DateRange) => void;

  /**
   * Label affiché au-dessus du composant
   */
  label?: string;

  /**
   * Afficher les raccourcis prédéfinis (Aujourd'hui, 7 derniers jours, etc.)
   * @default false
   */
  showPresets?: boolean;

  /**
   * Date minimum sélectionnable (format ISO: YYYY-MM-DD)
   */
  minDate?: string;

  /**
   * Date maximum sélectionnable (format ISO: YYYY-MM-DD)
   */
  maxDate?: string;

  /**
   * Message d'erreur à afficher sous le composant
   */
  error?: string;

  /**
   * Désactive le composant
   * @default false
   */
  disabled?: boolean;

  /**
   * Classes CSS additionnelles pour le container principal
   */
  className?: string;
}

/**
 * Type des presets disponibles
 */
type PresetType =
  | "today"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "clear";

// ─── STYLES ──────────────────────────────────────────────────────────────────

const inputClasses = cn(
  "block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm",
  "text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
  "transition-colors",
);

const presetButtonClasses = cn(
  "px-3 py-1.5 text-xs font-medium rounded-md",
  "border border-gray-300 bg-white",
  "hover:bg-gray-50 transition-colors",
  "disabled:opacity-40 disabled:cursor-not-allowed",
);

// ─── COMPOSANT ───────────────────────────────────────────────────────────────

export function DateRangePicker({
  value,
  onChange,
  label,
  showPresets = false,
  minDate,
  maxDate,
  error,
  disabled = false,
  className = "",
}: DateRangePickerProps) {
  /**
   * Formate une date en string ISO (YYYY-MM-DD)
   */
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0]!;
  };

  /**
   * Handler pour le changement de la date de début
   */
  const handleStartDateChange = (newStartDate: string) => {
    const updatedRange: DateRange = {
      startDate: newStartDate ? newStartDate : null,
      endDate: value.endDate,
    };

    // Validation : si la date de fin est avant la nouvelle date de début, on ajuste
    if (newStartDate && value.endDate && newStartDate > value.endDate) {
      updatedRange.endDate = newStartDate;
    }

    onChange(updatedRange);
  };

  /**
   * Handler pour le changement de la date de fin
   */
  const handleEndDateChange = (newEndDate: string) => {
    const updatedRange: DateRange = {
      startDate: value.startDate,
      endDate: newEndDate ? newEndDate : null,
    };

    // Validation : si la date de début est après la nouvelle date de fin, on ajuste
    if (newEndDate && value.startDate && newEndDate < value.startDate) {
      updatedRange.startDate = newEndDate;
    }

    onChange(updatedRange);
  };

  /**
   * Applique un preset prédéfini
   */
  const applyPreset = (preset: PresetType) => {
    const today = new Date();

    switch (preset) {
      case "today":
        onChange({
          startDate: formatDate(today),
          endDate: formatDate(today),
        });
        break;

      case "last7days":
        const last7 = new Date(today);
        last7.setDate(today.getDate() - 7);
        onChange({
          startDate: formatDate(last7),
          endDate: formatDate(today),
        });
        break;

      case "last30days":
        const last30 = new Date(today);
        last30.setDate(today.getDate() - 30);
        onChange({
          startDate: formatDate(last30),
          endDate: formatDate(today),
        });
        break;

      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        onChange({
          startDate: formatDate(startOfMonth),
          endDate: formatDate(today),
        });
        break;

      case "lastMonth":
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1,
        );
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        onChange({
          startDate: formatDate(lastMonthStart),
          endDate: formatDate(lastMonthEnd),
        });
        break;

      case "thisYear":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        onChange({
          startDate: formatDate(startOfYear),
          endDate: formatDate(today),
        });
        break;

      case "clear":
        onChange({ startDate: null, endDate: null });
        break;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label optionnel */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Inputs de dates */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Date de début */}
        <div className="flex-1">
          <label
            htmlFor="startDate"
            className="block text-xs text-gray-600 mb-1"
          >
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            value={value.startDate || ""}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={minDate}
            max={value.endDate || maxDate}
            disabled={disabled}
            className={cn(inputClasses, error && "border-red-300")}
          />
        </div>

        {/* Date de fin */}
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            value={value.endDate || ""}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={value.startDate || minDate}
            max={maxDate}
            disabled={disabled}
            className={cn(inputClasses, error && "border-red-300")}
          />
        </div>
      </div>

      {/* Raccourcis prédéfinis */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("today")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => applyPreset("last7days")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            7 derniers jours
          </button>
          <button
            type="button"
            onClick={() => applyPreset("last30days")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            30 derniers jours
          </button>
          <button
            type="button"
            onClick={() => applyPreset("thisMonth")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            Ce mois
          </button>
          <button
            type="button"
            onClick={() => applyPreset("lastMonth")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            Mois dernier
          </button>
          <button
            type="button"
            onClick={() => applyPreset("thisYear")}
            disabled={disabled}
            className={presetButtonClasses}
          >
            Cette année
          </button>
          <button
            type="button"
            onClick={() => applyPreset("clear")}
            disabled={disabled}
            className={cn(presetButtonClasses, "text-red-600 hover:bg-red-50")}
          >
            Effacer
          </button>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default DateRangePicker;
