/**
 * DateRangePicker Examples
 *
 * Page de démonstration des différents usages du composant DateRangePicker.
 * Ces exemples illustrent les cas d'usage courants dans l'application.
 */

import { useState } from 'react';
import { DateRangePicker, DateRange } from './DateRangePicker';
import Button from '../Button/Button';

export function DateRangePickerExamples() {
  // ─── EXEMPLE 1 : USAGE BASIQUE ───────────────────────────────────────────

  const [basicRange, setBasicRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // ─── EXEMPLE 2 : AVEC RACCOURCIS PRÉDÉFINIS ──────────────────────────────

  const [rangeWithPresets, setRangeWithPresets] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  // ─── EXEMPLE 3 : AVEC VALIDATION ET LIMITES ──────────────────────────────

  const [rangeWithLimits, setRangeWithLimits] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const [validationError, setValidationError] = useState('');

  const handleLimitedRangeChange = (range: DateRange) => {
    setRangeWithLimits(range);
    setValidationError('');
  };

  // ─── EXEMPLE 4 : POUR FILTRES DE PAIEMENTS ───────────────────────────────

  const [paymentFilters, setPaymentFilters] = useState({
    dateRange: { startDate: null, endDate: null } as DateRange,
    status: 'all',
  });

  const [filteredResults, setFilteredResults] = useState<string | null>(null);

  const handleFilterPayments = () => {
    const { startDate, endDate } = paymentFilters.dateRange;
    if (startDate && endDate) {
      setFilteredResults(`Filtrage des paiements du ${startDate} au ${endDate}`);
    } else {
      setFilteredResults('Aucune période sélectionnée');
    }
  };

  const handleClearFilters = () => {
    setPaymentFilters({
      dateRange: { startDate: null, endDate: null },
      status: 'all',
    });
    setFilteredResults(null);
  };

  // ─── EXEMPLE 5 : POUR RAPPORTS AVEC VALIDATION PERSONNALISÉE ─────────────

  const [reportRange, setReportRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const [reportError, setReportError] = useState('');

  const handleReportRangeChange = (range: DateRange) => {
    setReportRange(range);

    // Validation personnalisée : max 365 jours
    if (range.startDate && range.endDate) {
      const start = new Date(range.startDate);
      const end = new Date(range.endDate);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

      if (diffDays > 365) {
        setReportError('La période ne peut pas dépasser 365 jours');
      } else if (diffDays < 0) {
        setReportError('La date de fin doit être après la date de début');
      } else {
        setReportError('');
      }
    } else {
      setReportError('');
    }
  };

  const canGenerateReport = reportRange.startDate && reportRange.endDate && !reportError;

  // ─── EXEMPLE 6 : DÉSACTIVÉ AVEC VALEUR PAR DÉFAUT ────────────────────────

  const [fiscalYear] = useState<DateRange>({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  });

  // ─── RENDU ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">DateRangePicker</h1>
        <p className="text-gray-600">
          Composant pour sélectionner une plage de dates avec validation automatique
          et raccourcis prédéfinis.
        </p>
      </div>

      {/* ─── EXEMPLE 1 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            1. Usage basique
          </h2>
          <p className="text-sm text-gray-600">
            Sélection simple d'une plage de dates avec label.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <DateRangePicker
            value={basicRange}
            onChange={setBasicRange}
            label="Période"
          />

          {basicRange.startDate && basicRange.endDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Sélection :</strong> Du {basicRange.startDate} au{' '}
                {basicRange.endDate}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── EXEMPLE 2 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            2. Avec raccourcis prédéfinis
          </h2>
          <p className="text-sm text-gray-600">
            Boutons de raccourcis pour sélectionner rapidement des périodes courantes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <DateRangePicker
            value={rangeWithPresets}
            onChange={setRangeWithPresets}
            label="Sélectionner une période"
            showPresets
          />

          {rangeWithPresets.startDate && rangeWithPresets.endDate && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Période sélectionnée :</strong> {rangeWithPresets.startDate} → {rangeWithPresets.endDate}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── EXEMPLE 3 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            3. Avec validation et limites
          </h2>
          <p className="text-sm text-gray-600">
            Restriction des dates sélectionnables avec minDate et maxDate.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <DateRangePicker
            value={rangeWithLimits}
            onChange={handleLimitedRangeChange}
            label="Période (limitée à 2024)"
            showPresets
            minDate="2024-01-01"
            maxDate="2024-12-31"
            error={validationError}
          />

          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              ℹ️ Les dates sont limitées entre le 01/01/2024 et le 31/12/2024
            </p>
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 4 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            4. Pour filtres de paiements
          </h2>
          <p className="text-sm text-gray-600">
            Utilisation dans un formulaire de filtrage avec boutons d'action.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="space-y-4">
            <DateRangePicker
              value={paymentFilters.dateRange}
              onChange={(range) =>
                setPaymentFilters({ ...paymentFilters, dateRange: range })
              }
              label="Période de paiement"
              showPresets
            />

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleFilterPayments}
                disabled={!paymentFilters.dateRange.startDate || !paymentFilters.dateRange.endDate}
              >
                Filtrer
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Réinitialiser
              </Button>
            </div>

            {filteredResults && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">{filteredResults}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 5 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            5. Pour rapports avec validation personnalisée
          </h2>
          <p className="text-sm text-gray-600">
            Validation personnalisée limitant la plage à maximum 365 jours.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="space-y-4">
            <DateRangePicker
              value={reportRange}
              onChange={handleReportRangeChange}
              label="Période du rapport"
              showPresets
              error={reportError}
            />

            <Button
              variant="success"
              disabled={!canGenerateReport}
              onClick={() => alert('Génération du rapport...')}
            >
              Générer le rapport
            </Button>

            {reportRange.startDate && reportRange.endDate && !reportError && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900">
                  ✓ Période valide ({' '}
                  {Math.ceil(
                    (new Date(reportRange.endDate).getTime() -
                      new Date(reportRange.startDate).getTime()) /
                      (1000 * 3600 * 24)
                  )}{' '}
                  jours)
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── EXEMPLE 6 ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            6. Désactivé avec valeur par défaut
          </h2>
          <p className="text-sm text-gray-600">
            Affichage d'une période en lecture seule (ex: année fiscale fixe).
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <DateRangePicker
            value={fiscalYear}
            onChange={() => {}}
            label="Année fiscale"
            disabled
          />

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Cette période est verrouillée et ne peut pas être modifiée.
            </p>
          </div>
        </div>
      </section>

      {/* ─── CODE EXEMPLES ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Code d'exemple
          </h2>
          <p className="text-sm text-gray-600">
            Extraits de code pour une utilisation rapide.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl overflow-x-auto">
          <pre className="text-xs text-gray-100 font-mono">
{`// Import
import { DateRangePicker, DateRange } from './DateRangePicker';

// State
const [dateRange, setDateRange] = useState<DateRange>({
  startDate: null,
  endDate: null,
});

// Usage basique
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  label="Période"
/>

// Avec presets
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  showPresets
/>

// Avec limites
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  minDate="2024-01-01"
  maxDate="2024-12-31"
/>

// Avec validation personnalisée
const handleChange = (range: DateRange) => {
  setDateRange(range);
  if (range.startDate && range.endDate) {
    const diff = new Date(range.endDate).getTime() -
                 new Date(range.startDate).getTime();
    const days = diff / (1000 * 3600 * 24);
    if (days > 365) {
      setError('Maximum 365 jours');
    }
  }
};`}
          </pre>
        </div>
      </section>
    </div>
  );
}

export default DateRangePickerExamples;
