/**
 * UserAlertCard
 * Carte affichant une alerte utilisateur avec ses actions
 */

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { AlertUserDto } from '../api/alertsApi';
import { AlertTypeBadge } from './AlertTypeBadge';
import { AlertStatusBadge } from './AlertStatusBadge';
import { useResolveAlert, useIgnoreAlert } from '../hooks/useAlerts';

interface UserAlertCardProps {
  alert: AlertUserDto;
  onViewActions?: (alert: AlertUserDto) => void;
  showAdminActions?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function UserAlertCard({ alert, onViewActions, showAdminActions = false }: UserAlertCardProps) {
  const { t } = useTranslation('alerts');
  const { mutate: resolve, isPending: isResolving } = useResolveAlert();
  const { mutate: ignore, isPending: isIgnoring } = useIgnoreAlert();

  const handleResolve = () => {
    resolve(
      { id: alert.id },
      {
        onSuccess: () => toast.success(t('userAlerts.messages.resolved')),
        onError: () => toast.error(t('errors.saveFailed')),
      },
    );
  };

  const handleIgnore = () => {
    ignore(alert.id, {
      onSuccess: () => toast.success(t('userAlerts.messages.ignored')),
      onError: () => toast.error(t('errors.saveFailed')),
    });
  };

  const priorite = alert.alerte_type?.priorite ?? 'normale';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {alert.alerte_type?.nom ?? `Type #${alert.alerte_type_id}`}
            </span>
            {alert.alerte_type && (
              <span className="text-xs text-gray-400 font-mono">{alert.alerte_type.code}</span>
            )}
          </div>
          {showAdminActions && (
            <p className="text-xs text-gray-500 mt-0.5">Utilisateur #{alert.user_id}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertTypeBadge priorite={priorite} size="sm" />
          <AlertStatusBadge statut={alert.statut} size="sm" />
        </div>
      </div>

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{t('myAlerts.card.detectedOn')} {formatDate(alert.date_detection)}</span>
        {alert.date_resolution && (
          <span>{t('myAlerts.card.resolvedOn')} {formatDate(alert.date_resolution)}</span>
        )}
      </div>

      {/* Notes */}
      {alert.notes && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          {alert.notes}
        </p>
      )}

      {/* Actions */}
      {(showAdminActions || alert.statut === 'active') && (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {showAdminActions && alert.statut === 'active' && (
            <>
              <button
                onClick={handleResolve}
                disabled={isResolving || isIgnoring}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {t('userAlerts.actions.resolve')}
              </button>
              <button
                onClick={handleIgnore}
                disabled={isResolving || isIgnoring}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                {t('userAlerts.actions.ignore')}
              </button>
            </>
          )}
          {showAdminActions && onViewActions && (
            <button
              onClick={() => onViewActions(alert)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('userAlerts.actions.viewActions')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
