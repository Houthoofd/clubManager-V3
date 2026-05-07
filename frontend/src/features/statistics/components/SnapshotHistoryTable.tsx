/**
 * @fileoverview SnapshotHistoryTable component
 * @module features/statistics/components/SnapshotHistoryTable
 *
 * Displays the history of statistics snapshots and provides a button
 * to trigger a new snapshot.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useStatisticsHistory, useCreateSnapshot } from '../hooks/useStatistics';
import { Button } from '../../../shared/components/Button/Button';
import { LoadingSpinner } from '../../../shared/components/Layout/LoadingSpinner';

const TYPES = ['membres', 'cours', 'finance', 'store'] as const;
type SnapshotType = typeof TYPES[number];

/** Format a date string to French locale with time */
function fmt(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Human-readable labels for metric keys */
const KEY_LABELS: Record<string, string> = {
  total_membres:    'Total membres',
  membres_actifs:   'Membres actifs',
  total_cours:      'Total cours',
  taux_presence:    'Taux présence (%)',
  total_revenus:    'Total revenus (€)',
  taux_paiement:    'Taux paiement (%)',
  echeances_retard: 'Échéances en retard',
  total_commandes:  'Total commandes',
  revenus_store:    'Revenus magasin (€)',
};

/** Badge colours per domain */
const TYPE_COLORS: Record<string, string> = {
  membres: 'bg-blue-50 text-blue-700',
  cours:   'bg-green-50 text-green-700',
  finance: 'bg-yellow-50 text-yellow-700',
  store:   'bg-purple-50 text-purple-700',
};

export const SnapshotHistoryTable: React.FC = () => {
  const { t } = useTranslation('statistics');
  const [activeType, setActiveType] = useState<SnapshotType | undefined>(undefined);

  const { data: history, isLoading } = useStatisticsHistory(activeType, 50);
  const { mutate: takeSnapshot, isPending: isSnapshotting } = useCreateSnapshot();

  const handleSnapshot = () => {
    takeSnapshot(undefined, {
      onSuccess: (result) => {
        toast.success(t('snapshot.success', { count: result.inserted }));
      },
      onError: () => {
        toast.error(t('snapshot.error'));
      },
    });
  };

  // Group rows by minute-precision timestamp (each snapshot == same minute)
  const grouped = React.useMemo(() => {
    if (!history) return [];
    const map = new Map<string, typeof history>();
    for (const row of history) {
      const dateKey = new Date(row.date_stat).toISOString().slice(0, 16);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(row);
    }
    // Keep at most the 10 most recent snapshots
    return Array.from(map.entries()).slice(0, 10);
  }, [history]);

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('snapshot.title', 'Historique des Snapshots')}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('snapshot.description', 'Captures ponctuelles des statistiques clés')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSnapshot}
          disabled={isSnapshotting}
        >
          {isSnapshotting
            ? t('snapshot.taking', 'Capture en cours…')
            : t('snapshot.take', 'Prendre un snapshot')}
        </Button>
      </div>

      {/* ── Type filter ── */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveType(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeType === undefined
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {TYPES.map((tp) => (
          <button
            key={tp}
            onClick={() => setActiveType(tp === activeType ? undefined : tp)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              activeType === tp
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tp}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">
          {t(
            'snapshot.empty',
            'Aucun snapshot. Cliquez sur "Prendre un snapshot" pour en créer un.'
          )}
        </p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, rows]) => (
            <div key={dateKey} className="border border-gray-100 rounded-lg overflow-hidden">
              {/* Snapshot header row */}
              <div className="bg-gray-50 px-4 py-2 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {fmt(rows[0].date_stat)}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {rows.length} métriques
                </span>
              </div>

              {/* Metrics table */}
              <table className="w-full">
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-xs w-24">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                            TYPE_COLORS[row.type] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {KEY_LABELS[row.cle] ?? row.cle}
                      </td>
                      <td className="px-4 py-2 text-sm font-mono text-gray-900 text-right">
                        {row.valeur}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
