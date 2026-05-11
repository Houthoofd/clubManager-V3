/**
 * AlertTypeBadge
 * Badge coloré affichant la priorité d'une alerte
 */

import { useTranslation } from 'react-i18next';
import type { AlertPriorite } from '../api/alertsApi';

interface AlertTypeBadgeProps {
  priorite: AlertPriorite;
  size?: 'sm' | 'md';
}

const PRIORITY_STYLES: Record<AlertPriorite, string> = {
  critique: 'bg-red-100 text-red-700 border border-red-200',
  haute: 'bg-orange-100 text-orange-700 border border-orange-200',
  normale: 'bg-blue-100 text-blue-700 border border-blue-200',
  basse: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const PRIORITY_DOT: Record<AlertPriorite, string> = {
  critique: 'bg-red-600',
  haute: 'bg-orange-500',
  normale: 'bg-blue-500',
  basse: 'bg-gray-400',
};

export function AlertTypeBadge({ priorite, size = 'md' }: AlertTypeBadgeProps) {
  const { t } = useTranslation('alerts');
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClass} ${PRIORITY_STYLES[priorite]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[priorite]}`} />
      {t(`priority.${priorite}`)}
    </span>
  );
}
