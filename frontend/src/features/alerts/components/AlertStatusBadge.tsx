/**
 * AlertStatusBadge
 * Badge coloré affichant le statut d'une alerte
 */

import { useTranslation } from 'react-i18next';
import type { AlertStatut } from '../api/alertsApi';

interface AlertStatusBadgeProps {
  statut: AlertStatut;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<AlertStatut, string> = {
  active: 'bg-red-100 text-red-700 border border-red-200',
  resolue: 'bg-green-100 text-green-700 border border-green-200',
  ignoree: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const STATUS_DOT: Record<AlertStatut, string> = {
  active: 'bg-red-500',
  resolue: 'bg-green-500',
  ignoree: 'bg-gray-400',
};

export function AlertStatusBadge({ statut, size = 'md' }: AlertStatusBadgeProps) {
  const { t } = useTranslation('alerts');
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${STATUS_STYLES[statut]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[statut]}`} />
      {t(`status.${statut}`)}
    </span>
  );
}
